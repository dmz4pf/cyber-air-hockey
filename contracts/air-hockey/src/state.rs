//! State definitions for Air Hockey contract
//!
//! This module defines the on-chain state for staked multiplayer games.

use linera_sdk::views::{MapView, RegisterView, RootView, ViewStorageContext};
use serde::{Deserialize, Serialize};

/// Game status on the blockchain
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize)]
pub enum GameStatus {
    /// Game created, waiting for opponent
    Waiting,
    /// Both players joined, game in progress
    Active,
    /// Game completed, winner determined
    Completed,
    /// Game cancelled before completion
    Cancelled,
    /// Result disputed
    Disputed,
}

impl Default for GameStatus {
    fn default() -> Self {
        Self::Waiting
    }
}

/// A single game record
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Game {
    /// Unique game identifier
    pub id: u64,
    /// Address of game creator (player 1)
    pub creator: String,
    /// Address of opponent (player 2), None until joined
    pub opponent: Option<String>,
    /// Stake amount in smallest token unit
    pub stake: u128,
    /// Current game status
    pub status: GameStatus,
    /// Winner address (None if not yet determined or draw)
    pub winner: Option<String>,
    /// Block timestamp when game was created
    pub created_at: u64,
    /// Block timestamp when opponent joined
    pub started_at: Option<u64>,
    /// Block timestamp when game ended
    pub ended_at: Option<u64>,
    /// Player 1 final score
    pub player1_score: u8,
    /// Player 2 final score
    pub player2_score: u8,
    /// WebSocket room code for real-time gameplay
    pub room_code: String,
}

impl Game {
    /// Create a new game
    pub fn new(id: u64, creator: String, stake: u128, room_code: String, timestamp: u64) -> Self {
        Self {
            id,
            creator,
            opponent: None,
            stake,
            status: GameStatus::Waiting,
            winner: None,
            created_at: timestamp,
            started_at: None,
            ended_at: None,
            player1_score: 0,
            player2_score: 0,
            room_code,
        }
    }

    /// Check if game can be joined
    pub fn can_join(&self) -> bool {
        self.status == GameStatus::Waiting && self.opponent.is_none()
    }

    /// Check if game is in progress
    pub fn is_active(&self) -> bool {
        self.status == GameStatus::Active
    }

    /// Check if game is completed
    pub fn is_completed(&self) -> bool {
        self.status == GameStatus::Completed
    }

    /// Get total pot (both stakes)
    pub fn total_pot(&self) -> u128 {
        self.stake * 2
    }
}

/// Player statistics
#[derive(Debug, Clone, Default, Serialize, Deserialize)]
pub struct PlayerStats {
    /// Total games played
    pub games_played: u64,
    /// Games won
    pub wins: u64,
    /// Games lost
    pub losses: u64,
    /// Total tokens won
    pub tokens_won: u128,
    /// Total tokens lost
    pub tokens_lost: u128,
}

/// Application state stored on chain
#[derive(RootView, async_graphql::SimpleObject)]
#[view(context = "ViewStorageContext")]
pub struct AirHockeyState {
    /// Counter for game IDs
    pub next_game_id: RegisterView<u64>,
    /// All games by ID
    pub games: MapView<u64, Game>,
    /// Player statistics by address
    pub player_stats: MapView<String, PlayerStats>,
    /// Total stake pool (all active games)
    pub total_stake_pool: RegisterView<u128>,
    /// Contract owner
    pub owner: RegisterView<String>,
}

impl AirHockeyState {
    /// Initialize contract with owner
    pub async fn initialize(&mut self, owner: String) {
        self.owner.set(owner);
        self.next_game_id.set(1);
        self.total_stake_pool.set(0);
    }

    /// Get next game ID and increment counter
    pub async fn get_next_game_id(&mut self) -> u64 {
        let id = self.next_game_id.get();
        self.next_game_id.set(id + 1);
        *id
    }

    /// Create a new game
    pub async fn create_game(
        &mut self,
        creator: String,
        stake: u128,
        room_code: String,
        timestamp: u64,
    ) -> Result<u64, String> {
        let id = self.get_next_game_id().await;
        let game = Game::new(id, creator, stake, room_code, timestamp);

        self.games.insert(&id, game)?;

        // Update total stake pool
        let current_pool = *self.total_stake_pool.get();
        self.total_stake_pool.set(current_pool + stake);

        Ok(id)
    }

    /// Join an existing game
    pub async fn join_game(
        &mut self,
        game_id: u64,
        opponent: String,
        timestamp: u64,
    ) -> Result<(), String> {
        let mut game = self.games.get(&game_id).await?
            .ok_or("Game not found")?;

        if !game.can_join() {
            return Err("Game cannot be joined".into());
        }

        if game.creator == opponent {
            return Err("Cannot join your own game".into());
        }

        game.opponent = Some(opponent);
        game.status = GameStatus::Active;
        game.started_at = Some(timestamp);

        self.games.insert(&game_id, game)?;

        // Update total stake pool
        let current_pool = *self.total_stake_pool.get();
        self.total_stake_pool.set(current_pool + game.stake);

        Ok(())
    }

    /// Submit game result
    pub async fn submit_result(
        &mut self,
        game_id: u64,
        player1_score: u8,
        player2_score: u8,
        timestamp: u64,
    ) -> Result<Option<String>, String> {
        let mut game = self.games.get(&game_id).await?
            .ok_or("Game not found")?;

        if !game.is_active() {
            return Err("Game is not active".into());
        }

        game.player1_score = player1_score;
        game.player2_score = player2_score;
        game.status = GameStatus::Completed;
        game.ended_at = Some(timestamp);

        // Determine winner
        game.winner = if player1_score > player2_score {
            Some(game.creator.clone())
        } else if player2_score > player1_score {
            game.opponent.clone()
        } else {
            None // Draw
        };

        // Update player stats
        self.update_player_stats(&game).await?;

        // Update total stake pool (remove both stakes)
        let current_pool = *self.total_stake_pool.get();
        self.total_stake_pool.set(current_pool.saturating_sub(game.total_pot()));

        let winner = game.winner.clone();
        self.games.insert(&game_id, game)?;

        Ok(winner)
    }

    /// Cancel a waiting game
    pub async fn cancel_game(
        &mut self,
        game_id: u64,
        caller: &str,
        timestamp: u64,
    ) -> Result<u128, String> {
        let mut game = self.games.get(&game_id).await?
            .ok_or("Game not found")?;

        if game.status != GameStatus::Waiting {
            return Err("Can only cancel waiting games".into());
        }

        if game.creator != caller {
            return Err("Only creator can cancel".into());
        }

        game.status = GameStatus::Cancelled;
        game.ended_at = Some(timestamp);

        // Refund stake
        let refund = game.stake;

        // Update total stake pool
        let current_pool = *self.total_stake_pool.get();
        self.total_stake_pool.set(current_pool.saturating_sub(refund));

        self.games.insert(&game_id, game)?;

        Ok(refund)
    }

    /// Update player statistics after a game
    async fn update_player_stats(&mut self, game: &Game) -> Result<(), String> {
        let opponent = game.opponent.as_ref()
            .ok_or("Game has no opponent")?;

        // Update creator stats
        let mut creator_stats = self.player_stats.get(&game.creator).await?
            .unwrap_or_default();
        creator_stats.games_played += 1;

        if game.winner.as_ref() == Some(&game.creator) {
            creator_stats.wins += 1;
            creator_stats.tokens_won += game.stake;
        } else if game.winner.is_some() {
            creator_stats.losses += 1;
            creator_stats.tokens_lost += game.stake;
        }

        self.player_stats.insert(&game.creator, creator_stats)?;

        // Update opponent stats
        let mut opponent_stats = self.player_stats.get(opponent).await?
            .unwrap_or_default();
        opponent_stats.games_played += 1;

        if game.winner.as_ref() == Some(opponent) {
            opponent_stats.wins += 1;
            opponent_stats.tokens_won += game.stake;
        } else if game.winner.is_some() {
            opponent_stats.losses += 1;
            opponent_stats.tokens_lost += game.stake;
        }

        self.player_stats.insert(opponent, opponent_stats)?;

        Ok(())
    }

    /// Get open games (waiting for opponent)
    pub async fn get_open_games(&self) -> Result<Vec<Game>, String> {
        let mut games = Vec::new();

        // Iterate through all games and collect waiting ones
        // Note: In production, you'd want an index for this
        for id in 1..*self.next_game_id.get() {
            if let Some(game) = self.games.get(&id).await? {
                if game.status == GameStatus::Waiting {
                    games.push(game);
                }
            }
        }

        Ok(games)
    }

    /// Get games for a specific player
    pub async fn get_player_games(&self, player: &str) -> Result<Vec<Game>, String> {
        let mut games = Vec::new();

        for id in 1..*self.next_game_id.get() {
            if let Some(game) = self.games.get(&id).await? {
                if game.creator == player || game.opponent.as_ref() == Some(&player.to_string()) {
                    games.push(game);
                }
            }
        }

        Ok(games)
    }
}

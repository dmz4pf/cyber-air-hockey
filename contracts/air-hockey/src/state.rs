//! State definitions for Air Hockey contract
//!
//! This module defines the on-chain state for staked multiplayer games.

use linera_sdk::views::{linera_views, MapView, RegisterView, RootView, ViewStorageContext};
use serde::{Deserialize, Serialize};

/// Game status on the blockchain
#[derive(Debug, Clone, Copy, PartialEq, Eq, Serialize, Deserialize, Default)]
pub enum GameStatus {
    /// Game created, waiting for opponent
    #[default]
    Waiting,
    /// Both players joined, game in progress
    Active,
    /// Game completed, winner determined
    Completed,
    /// Game cancelled before completion
    Cancelled,
}

/// A single game record
#[derive(Debug, Clone, Serialize, Deserialize, Default)]
pub struct Game {
    /// Unique game identifier
    pub id: u64,
    /// Address of game creator (player 1)
    pub creator: String,
    /// Address of opponent (player 2), None until joined
    pub opponent: Option<String>,
    /// Stake amount in smallest token unit
    pub stake: u64,
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
    pub fn new(id: u64, creator: String, stake: u64, room_code: String, timestamp: u64) -> Self {
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

    /// Get total pot (both stakes)
    pub fn total_pot(&self) -> u64 {
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
    pub tokens_won: u64,
    /// Total tokens lost
    pub tokens_lost: u64,
}

/// Application state stored on chain
#[derive(RootView)]
#[view(context = ViewStorageContext)]
pub struct AirHockeyState {
    /// Counter for game IDs
    pub next_game_id: RegisterView<u64>,
    /// All games by ID
    pub games: MapView<u64, Game>,
    /// Player statistics by address
    pub player_stats: MapView<String, PlayerStats>,
    /// Total stake pool (all active games)
    pub total_stake_pool: RegisterView<u64>,
    /// Contract owner
    pub owner: RegisterView<String>,
}

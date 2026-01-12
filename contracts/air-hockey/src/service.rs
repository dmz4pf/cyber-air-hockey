//! Air Hockey Service Implementation
//!
//! This service handles read-only queries to the contract state.

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use async_graphql::{EmptySubscription, Object, Schema, SimpleObject};
use linera_sdk::{
    base::WithServiceAbi,
    views::{View, ViewStorageContext},
    Service, ServiceRuntime,
};
use serde::{Deserialize, Serialize};

use crate::state::{AirHockeyState, Game, GameStatus, PlayerStats};

/// GraphQL query root
pub struct QueryRoot {
    state: AirHockeyState,
}

/// Game info for GraphQL responses
#[derive(SimpleObject, Debug, Clone, Serialize, Deserialize)]
pub struct GameInfo {
    pub id: u64,
    pub creator: String,
    pub opponent: Option<String>,
    pub stake: String,
    pub status: String,
    pub winner: Option<String>,
    pub created_at: u64,
    pub started_at: Option<u64>,
    pub ended_at: Option<u64>,
    pub player1_score: u8,
    pub player2_score: u8,
    pub room_code: String,
}

impl From<Game> for GameInfo {
    fn from(game: Game) -> Self {
        Self {
            id: game.id,
            creator: game.creator,
            opponent: game.opponent,
            stake: game.stake.to_string(),
            status: format!("{:?}", game.status),
            winner: game.winner,
            created_at: game.created_at,
            started_at: game.started_at,
            ended_at: game.ended_at,
            player1_score: game.player1_score,
            player2_score: game.player2_score,
            room_code: game.room_code,
        }
    }
}

/// Player stats for GraphQL responses
#[derive(SimpleObject, Debug, Clone, Serialize, Deserialize)]
pub struct PlayerStatsInfo {
    pub games_played: u64,
    pub wins: u64,
    pub losses: u64,
    pub tokens_won: String,
    pub tokens_lost: String,
    pub win_rate: f64,
}

impl From<PlayerStats> for PlayerStatsInfo {
    fn from(stats: PlayerStats) -> Self {
        let win_rate = if stats.games_played > 0 {
            stats.wins as f64 / stats.games_played as f64
        } else {
            0.0
        };

        Self {
            games_played: stats.games_played,
            wins: stats.wins,
            losses: stats.losses,
            tokens_won: stats.tokens_won.to_string(),
            tokens_lost: stats.tokens_lost.to_string(),
            win_rate,
        }
    }
}

/// Games list response
#[derive(SimpleObject, Debug, Clone, Serialize, Deserialize)]
pub struct GamesResponse {
    pub games: Vec<GameInfo>,
    pub total: u64,
}

#[Object]
impl QueryRoot {
    /// Get a specific game by ID
    async fn game(&self, id: u64) -> Option<GameInfo> {
        self.state.games.get(&id).await.ok().flatten().map(Into::into)
    }

    /// Get all open games (waiting for opponent)
    async fn open_games(&self) -> GamesResponse {
        let games = self.state.get_open_games().await.unwrap_or_default();
        let total = games.len() as u64;
        GamesResponse {
            games: games.into_iter().map(Into::into).collect(),
            total,
        }
    }

    /// Get games for a specific player
    async fn player_games(&self, player: String) -> GamesResponse {
        let games = self.state.get_player_games(&player).await.unwrap_or_default();
        let total = games.len() as u64;
        GamesResponse {
            games: games.into_iter().map(Into::into).collect(),
            total,
        }
    }

    /// Get player statistics
    async fn player_stats(&self, player: String) -> Option<PlayerStatsInfo> {
        self.state.player_stats.get(&player).await.ok().flatten().map(Into::into)
    }

    /// Get total stake pool
    async fn total_stake_pool(&self) -> String {
        self.state.total_stake_pool.get().to_string()
    }

    /// Get next game ID (useful for UI)
    async fn next_game_id(&self) -> u64 {
        *self.state.next_game_id.get()
    }

    /// Get contract owner
    async fn owner(&self) -> String {
        self.state.owner.get().clone()
    }
}

pub struct AirHockeyService {
    state: AirHockeyState,
}

linera_sdk::service!(AirHockeyService);

impl WithServiceAbi for AirHockeyService {
    type Abi = air_hockey::AirHockeyAbi;
}

impl Service for AirHockeyService {
    type Error = ();
    type Storage = ViewStorageContext;
    type State = AirHockeyState;

    async fn new(state: Self::State, _runtime: ServiceRuntime<Self>) -> Result<Self, Self::Error> {
        Ok(Self { state })
    }

    async fn handle_query(&self, query: Self::Query) -> Result<Self::QueryResponse, Self::Error> {
        let schema = Schema::build(
            QueryRoot { state: self.state.clone() },
            EmptyMutation,
            EmptySubscription,
        )
        .finish();

        let response = schema.execute(query).await;
        Ok(response)
    }
}

/// Empty mutation type (all mutations go through operations)
pub struct EmptyMutation;

#[Object]
impl EmptyMutation {
    /// Placeholder - all mutations are done through contract operations
    async fn _placeholder(&self) -> bool {
        true
    }
}

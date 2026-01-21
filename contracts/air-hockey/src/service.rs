//! Air Hockey Service Implementation
//!
//! This service handles read-only queries to the contract state.

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use async_graphql::{EmptyMutation, EmptySubscription, Object, Schema, SimpleObject};
use linera_sdk::{
    abi::WithServiceAbi,
    views::{RootView, View},
    Service, ServiceRuntime,
};
use serde::{Deserialize, Serialize};

use air_hockey::AirHockeyAbi;
use crate::state::{AirHockeyState, Game, GameStatus, PlayerStats};

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

pub struct AirHockeyService {
    state: AirHockeyState,
    runtime: ServiceRuntime<Self>,
}

linera_sdk::service!(AirHockeyService);

impl WithServiceAbi for AirHockeyService {
    type Abi = AirHockeyAbi;
}

impl Service for AirHockeyService {
    type Parameters = ();

    async fn new(runtime: ServiceRuntime<Self>) -> Self {
        let state = AirHockeyState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        Self { state, runtime }
    }

    async fn handle_query(&self, query: Self::Query) -> Self::QueryResponse {
        let schema = Schema::build(
            QueryRoot::new(&self.state),
            EmptyMutation,
            EmptySubscription,
        )
        .finish();

        schema.execute(query).await
    }
}

/// GraphQL query root - snapshot the data for query execution
pub struct QueryRoot {
    next_game_id: u64,
    owner: String,
    total_stake_pool: u64,
}

impl QueryRoot {
    fn new(state: &AirHockeyState) -> Self {
        Self {
            next_game_id: *state.next_game_id.get(),
            owner: state.owner.get().clone(),
            total_stake_pool: *state.total_stake_pool.get(),
        }
    }
}

#[Object]
impl QueryRoot {
    /// Get total stake pool
    async fn total_stake_pool(&self) -> String {
        self.total_stake_pool.to_string()
    }

    /// Get next game ID (useful for UI)
    async fn next_game_id(&self) -> u64 {
        self.next_game_id
    }

    /// Get contract owner
    async fn owner(&self) -> String {
        self.owner.clone()
    }
}

//! Air Hockey Linera Smart Contract
//!
//! This crate defines the ABI (Application Binary Interface) for the Air Hockey
//! staked multiplayer game contract on Linera blockchain.
//!
//! # Overview
//!
//! The contract manages staked multiplayer games where:
//! 1. A player creates a game with a stake amount
//! 2. Another player joins by matching the stake
//! 3. Players compete in real-time via WebSocket
//! 4. Results are submitted to the chain
//! 5. Winner receives the total pot
//!
//! # Operations
//!
//! - `CreateGame`: Create a new game with stake and room code
//! - `JoinGame`: Join an existing game by matching stake
//! - `SubmitResult`: Submit final scores after game ends
//! - `CancelGame`: Cancel a waiting game and refund stake
//!
//! # Queries (via GraphQL)
//!
//! - `game(id)`: Get a specific game
//! - `openGames`: List games waiting for opponents
//! - `playerGames(player)`: List games for a player
//! - `playerStats(player)`: Get player statistics

use async_graphql::{Request, Response};
use linera_sdk::base::{ContractAbi, ServiceAbi};
use serde::{Deserialize, Serialize};

pub struct AirHockeyAbi;

/// Contract operations
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    /// Initialize the contract with owner
    Initialize { owner: String },
    /// Create a new staked game
    CreateGame { stake: u128, room_code: String },
    /// Join an existing game
    JoinGame { game_id: u64 },
    /// Submit game result
    SubmitResult {
        game_id: u64,
        player1_score: u8,
        player2_score: u8,
    },
    /// Cancel a waiting game
    CancelGame { game_id: u64 },
    /// Claim winnings (handled automatically in SubmitResult)
    ClaimWinnings { game_id: u64 },
}

/// Cross-chain messages
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    /// Game created notification
    GameCreated {
        game_id: u64,
        creator: String,
        stake: u128,
        room_code: String,
    },
    /// Game joined notification
    GameJoined {
        game_id: u64,
        opponent: String,
    },
    /// Game completed notification
    GameCompleted {
        game_id: u64,
        winner: Option<String>,
        player1_score: u8,
        player2_score: u8,
    },
    /// Game cancelled notification
    GameCancelled {
        game_id: u64,
    },
}

impl ContractAbi for AirHockeyAbi {
    type Operation = Operation;
    type Response = ();
}

impl ServiceAbi for AirHockeyAbi {
    type Query = Request;
    type QueryResponse = Response;
}

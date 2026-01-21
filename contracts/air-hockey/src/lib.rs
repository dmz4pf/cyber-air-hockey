//! Air Hockey Linera Smart Contract
//!
//! This crate defines the ABI (Application Binary Interface) for the Air Hockey
//! staked multiplayer game contract on Linera blockchain.

use async_graphql::{Request, Response};
use linera_sdk::abi::{ContractAbi, ServiceAbi};
use serde::{Deserialize, Serialize};

pub struct AirHockeyAbi;

/// Contract operations
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    /// Create a new staked game
    CreateGame { stake: u64, room_code: String },
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
}

/// Cross-chain messages
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    /// Game created notification
    GameCreated {
        game_id: u64,
        creator: String,
        stake: u64,
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

/// Instantiation argument (empty for this app)
#[derive(Debug, Default, Serialize, Deserialize)]
pub struct InstantiationArgument {
    pub owner: String,
}

impl ContractAbi for AirHockeyAbi {
    type Operation = Operation;
    type Response = u64; // Returns game_id or 0
}

impl ServiceAbi for AirHockeyAbi {
    type Query = Request;
    type QueryResponse = Response;
}

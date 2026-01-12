//! Air Hockey Contract Implementation
//!
//! This contract handles staked multiplayer game creation, joining,
//! result submission, and prize distribution.

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use linera_sdk::{
    base::{Amount, Owner, WithContractAbi},
    views::{RootView, View, ViewStorageContext},
    Contract, ContractRuntime,
};
use serde::{Deserialize, Serialize};
use thiserror::Error;

use crate::state::{AirHockeyState, Game, GameStatus};

/// Operations that can be executed on the contract
#[derive(Debug, Serialize, Deserialize)]
pub enum Operation {
    /// Initialize the contract with owner
    Initialize { owner: String },
    /// Create a new staked game
    CreateGame { stake: u128, room_code: String },
    /// Join an existing game
    JoinGame { game_id: u64 },
    /// Submit game result (both players must agree or server attests)
    SubmitResult {
        game_id: u64,
        player1_score: u8,
        player2_score: u8,
    },
    /// Cancel a waiting game and get refund
    CancelGame { game_id: u64 },
    /// Claim winnings from a completed game
    ClaimWinnings { game_id: u64 },
}

/// Messages that can be sent between chains
#[derive(Debug, Serialize, Deserialize)]
pub enum Message {
    /// Notify about game creation
    GameCreated {
        game_id: u64,
        creator: String,
        stake: u128,
        room_code: String,
    },
    /// Notify about game being joined
    GameJoined {
        game_id: u64,
        opponent: String,
    },
    /// Notify about game completion
    GameCompleted {
        game_id: u64,
        winner: Option<String>,
        player1_score: u8,
        player2_score: u8,
    },
    /// Notify about game cancellation
    GameCancelled {
        game_id: u64,
    },
}

/// Contract errors
#[derive(Debug, Error)]
pub enum ContractError {
    #[error("Not initialized")]
    NotInitialized,
    #[error("Already initialized")]
    AlreadyInitialized,
    #[error("Insufficient funds")]
    InsufficientFunds,
    #[error("Game not found")]
    GameNotFound,
    #[error("Game cannot be joined")]
    CannotJoin,
    #[error("Not authorized")]
    NotAuthorized,
    #[error("Invalid operation")]
    InvalidOperation,
    #[error("State error: {0}")]
    StateError(String),
}

pub struct AirHockeyContract {
    state: AirHockeyState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(AirHockeyContract);

impl WithContractAbi for AirHockeyContract {
    type Abi = air_hockey::AirHockeyAbi;
}

impl Contract for AirHockeyContract {
    type Error = ContractError;
    type Storage = ViewStorageContext;
    type State = AirHockeyState;
    type Message = Message;

    async fn new(state: AirHockeyState, runtime: ContractRuntime<Self>) -> Result<Self, Self::Error> {
        Ok(Self { state, runtime })
    }

    fn state_mut(&mut self) -> &mut Self::State {
        &mut self.state
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Result<(), Self::Error> {
        let timestamp = self.runtime.system_time().micros();
        let caller = self.runtime.authenticated_signer()
            .map(|o| o.to_string())
            .unwrap_or_default();

        match operation {
            Operation::Initialize { owner } => {
                self.state.initialize(owner).await;
                Ok(())
            }

            Operation::CreateGame { stake, room_code } => {
                // Verify caller has sufficient funds
                let balance = self.runtime.owner_balance(Owner::from_str(&caller)?);
                if balance < Amount::from_tokens(stake as u128) {
                    return Err(ContractError::InsufficientFunds);
                }

                // Deduct stake from caller
                self.runtime.transfer(
                    Some(Owner::from_str(&caller)?),
                    None, // Contract holds funds
                    Amount::from_tokens(stake as u128),
                )?;

                // Create game
                let game_id = self.state.create_game(caller.clone(), stake, room_code.clone(), timestamp).await
                    .map_err(|e| ContractError::StateError(e))?;

                // Emit message
                self.runtime.send_message(Message::GameCreated {
                    game_id,
                    creator: caller,
                    stake,
                    room_code,
                });

                Ok(())
            }

            Operation::JoinGame { game_id } => {
                // Get game to check stake
                let game = self.state.games.get(&game_id).await
                    .map_err(|e| ContractError::StateError(e.to_string()))?
                    .ok_or(ContractError::GameNotFound)?;

                let stake = game.stake;

                // Verify caller has sufficient funds
                let balance = self.runtime.owner_balance(Owner::from_str(&caller)?);
                if balance < Amount::from_tokens(stake as u128) {
                    return Err(ContractError::InsufficientFunds);
                }

                // Deduct stake from caller
                self.runtime.transfer(
                    Some(Owner::from_str(&caller)?),
                    None,
                    Amount::from_tokens(stake as u128),
                )?;

                // Join game
                self.state.join_game(game_id, caller.clone(), timestamp).await
                    .map_err(|e| ContractError::StateError(e))?;

                // Emit message
                self.runtime.send_message(Message::GameJoined {
                    game_id,
                    opponent: caller,
                });

                Ok(())
            }

            Operation::SubmitResult {
                game_id,
                player1_score,
                player2_score,
            } => {
                // Verify caller is a participant
                let game = self.state.games.get(&game_id).await
                    .map_err(|e| ContractError::StateError(e.to_string()))?
                    .ok_or(ContractError::GameNotFound)?;

                if game.creator != caller && game.opponent.as_ref() != Some(&caller) {
                    return Err(ContractError::NotAuthorized);
                }

                let total_pot = game.total_pot();

                // Submit result
                let winner = self.state.submit_result(game_id, player1_score, player2_score, timestamp).await
                    .map_err(|e| ContractError::StateError(e))?;

                // Transfer winnings to winner
                if let Some(ref winner_addr) = winner {
                    self.runtime.transfer(
                        None, // From contract
                        Some(Owner::from_str(winner_addr)?),
                        Amount::from_tokens(total_pot),
                    )?;
                }

                // Emit message
                self.runtime.send_message(Message::GameCompleted {
                    game_id,
                    winner,
                    player1_score,
                    player2_score,
                });

                Ok(())
            }

            Operation::CancelGame { game_id } => {
                // Cancel and get refund
                let refund = self.state.cancel_game(game_id, &caller, timestamp).await
                    .map_err(|e| ContractError::StateError(e))?;

                // Refund stake to creator
                self.runtime.transfer(
                    None,
                    Some(Owner::from_str(&caller)?),
                    Amount::from_tokens(refund),
                )?;

                // Emit message
                self.runtime.send_message(Message::GameCancelled { game_id });

                Ok(())
            }

            Operation::ClaimWinnings { game_id } => {
                // This is handled in SubmitResult for simplicity
                // In a more complex system, you might separate claiming
                Ok(())
            }
        }
    }

    async fn execute_message(&mut self, message: Self::Message) -> Result<(), Self::Error> {
        // Handle cross-chain messages if needed
        // For now, messages are just notifications
        Ok(())
    }
}

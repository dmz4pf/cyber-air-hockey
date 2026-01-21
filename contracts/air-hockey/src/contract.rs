//! Air Hockey Contract Implementation
//!
//! This contract handles staked multiplayer game creation, joining,
//! result submission, and prize distribution.

#![cfg_attr(target_arch = "wasm32", no_main)]

mod state;

use air_hockey::{AirHockeyAbi, InstantiationArgument, Message, Operation};
use linera_sdk::{
    abi::WithContractAbi,
    views::{RootView, View},
    Contract, ContractRuntime,
};

use crate::state::{AirHockeyState, Game, GameStatus};

pub struct AirHockeyContract {
    state: AirHockeyState,
    runtime: ContractRuntime<Self>,
}

linera_sdk::contract!(AirHockeyContract);

impl WithContractAbi for AirHockeyContract {
    type Abi = AirHockeyAbi;
}

impl Contract for AirHockeyContract {
    type Message = Message;
    type Parameters = ();
    type InstantiationArgument = InstantiationArgument;
    type EventValue = ();

    async fn load(runtime: ContractRuntime<Self>) -> Self {
        let state = AirHockeyState::load(runtime.root_view_storage_context())
            .await
            .expect("Failed to load state");
        Self { state, runtime }
    }

    async fn instantiate(&mut self, argument: Self::InstantiationArgument) {
        self.state.owner.set(argument.owner);
        self.state.next_game_id.set(1);
        self.state.total_stake_pool.set(0);
    }

    async fn execute_operation(&mut self, operation: Self::Operation) -> Self::Response {
        let timestamp = self.runtime.system_time().micros();
        let caller = self.runtime.authenticated_signer()
            .map(|o| o.to_string())
            .unwrap_or_else(|| "anonymous".to_string());

        match operation {
            Operation::CreateGame { stake, room_code } => {
                // Get next game ID
                let id = *self.state.next_game_id.get();
                self.state.next_game_id.set(id + 1);

                // Create game
                let game = Game::new(id, caller.clone(), stake, room_code.clone(), timestamp);
                self.state.games.insert(&id, game).expect("Failed to insert game");

                // Update total stake pool
                let current_pool = *self.state.total_stake_pool.get();
                self.state.total_stake_pool.set(current_pool + stake);

                id
            }

            Operation::JoinGame { game_id } => {
                let mut game = self.state.games.get(&game_id)
                    .await
                    .expect("Failed to get game")
                    .expect("Game not found");

                if !game.can_join() {
                    return 0;
                }

                if game.creator == caller {
                    return 0; // Cannot join own game
                }

                game.opponent = Some(caller);
                game.status = GameStatus::Active;
                game.started_at = Some(timestamp);

                self.state.games.insert(&game_id, game.clone()).expect("Failed to update game");

                // Update total stake pool
                let current_pool = *self.state.total_stake_pool.get();
                self.state.total_stake_pool.set(current_pool + game.stake);

                game_id
            }

            Operation::SubmitResult {
                game_id,
                player1_score,
                player2_score,
            } => {
                let mut game = self.state.games.get(&game_id)
                    .await
                    .expect("Failed to get game")
                    .expect("Game not found");

                if !game.is_active() {
                    return 0;
                }

                // Verify caller is a participant
                if game.creator != caller && game.opponent.as_ref() != Some(&caller) {
                    return 0;
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
                self.update_player_stats(&game).await;

                // Update total stake pool (remove both stakes)
                let current_pool = *self.state.total_stake_pool.get();
                self.state.total_stake_pool.set(current_pool.saturating_sub(game.total_pot()));

                self.state.games.insert(&game_id, game).expect("Failed to update game");

                game_id
            }

            Operation::CancelGame { game_id } => {
                let mut game = self.state.games.get(&game_id)
                    .await
                    .expect("Failed to get game")
                    .expect("Game not found");

                if game.status != GameStatus::Waiting {
                    return 0; // Can only cancel waiting games
                }

                if game.creator != caller {
                    return 0; // Only creator can cancel
                }

                game.status = GameStatus::Cancelled;
                game.ended_at = Some(timestamp);

                // Update total stake pool
                let current_pool = *self.state.total_stake_pool.get();
                self.state.total_stake_pool.set(current_pool.saturating_sub(game.stake));

                self.state.games.insert(&game_id, game).expect("Failed to update game");

                game_id
            }
        }
    }

    async fn execute_message(&mut self, _message: Self::Message) {
        // Handle cross-chain messages if needed
        // For now, messages are just notifications
    }

    async fn store(mut self) {
        self.state.save().await.expect("Failed to save state");
    }
}

impl AirHockeyContract {
    /// Update player statistics after a game
    async fn update_player_stats(&mut self, game: &Game) {
        let opponent = match game.opponent.as_ref() {
            Some(o) => o.clone(),
            None => return,
        };

        // Update creator stats
        let mut creator_stats = self.state.player_stats.get(&game.creator)
            .await
            .expect("Failed to get stats")
            .unwrap_or_default();

        creator_stats.games_played += 1;

        if game.winner.as_ref() == Some(&game.creator) {
            creator_stats.wins += 1;
            creator_stats.tokens_won += game.stake;
        } else if game.winner.is_some() {
            creator_stats.losses += 1;
            creator_stats.tokens_lost += game.stake;
        }

        self.state.player_stats.insert(&game.creator, creator_stats).expect("Failed to update stats");

        // Update opponent stats
        let mut opponent_stats = self.state.player_stats.get(&opponent)
            .await
            .expect("Failed to get stats")
            .unwrap_or_default();

        opponent_stats.games_played += 1;

        if game.winner.as_ref() == Some(&opponent) {
            opponent_stats.wins += 1;
            opponent_stats.tokens_won += game.stake;
        } else if game.winner.is_some() {
            opponent_stats.losses += 1;
            opponent_stats.tokens_lost += game.stake;
        }

        self.state.player_stats.insert(&opponent, opponent_stats).expect("Failed to update stats");
    }
}

#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Map};

const ROYALTY_MAP_KEY: u32 = 0;
const PENDING_ROYALTIES_KEY: u32 = 1;

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    InvalidInput = 1,
    NotFound = 2,
}

#[contract]
pub struct RoyaltyManager;

#[contractimpl]
impl RoyaltyManager {
    pub fn set_royalty(
        env: Env,
        token_id: u128,
        creator: Address,
        royalty_percentage: u32,
    ) -> Result<(), Error> {
        if royalty_percentage > 10000 {
            return Err(Error::InvalidInput);
        }

        let mut royalties: Map<u128, (Address, u32)> = env
            .storage()
            .instance()
            .get(&ROYALTY_MAP_KEY)
            .unwrap_or_else(|| Map::new(&env));
        royalties.set(token_id, (creator, royalty_percentage));
        env.storage().instance().set(&ROYALTY_MAP_KEY, &royalties);
        Ok(())
    }

    pub fn calculate_royalty(amount: i128, royalty_percentage: u32) -> i128 {
        (amount * (royalty_percentage as i128)) / 10000
    }

    pub fn distribute_royalty(env: Env, token_id: u128, sale_amount: i128) -> Result<i128, Error> {
        let royalties: Map<u128, (Address, u32)> = env
            .storage()
            .instance()
            .get(&ROYALTY_MAP_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let (_, royalty_percentage) = royalties.get(token_id).ok_or(Error::NotFound)?;
        let royalty_amount = Self::calculate_royalty(sale_amount, royalty_percentage);

        let mut pending: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&PENDING_ROYALTIES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let current_pending = pending
            .get(royalties.get(token_id).unwrap().0.clone())
            .unwrap_or(0);
        pending.set(
            royalties.get(token_id).unwrap().0,
            current_pending + royalty_amount,
        );
        env.storage()
            .instance()
            .set(&PENDING_ROYALTIES_KEY, &pending);
        Ok(royalty_amount)
    }

    pub fn claim_royalty(env: Env, creator: Address) -> Result<i128, Error> {
        let pending: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&PENDING_ROYALTIES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let total_claimable = pending.get(creator.clone()).unwrap_or(0);
        if total_claimable == 0 {
            return Err(Error::NotFound);
        }
        Ok(total_claimable)
    }

    pub fn get_pending_royalties(env: Env, creator: Address) -> i128 {
        let pending: Map<Address, i128> = env
            .storage()
            .instance()
            .get(&PENDING_ROYALTIES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        pending.get(creator).unwrap_or(0)
    }
}

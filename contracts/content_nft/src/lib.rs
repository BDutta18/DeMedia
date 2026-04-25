#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Map, String};

const TOKEN_OWNERS_KEY: u32 = 0;
const TOKEN_METADATA_KEY: u32 = 1;
const TOKEN_COUNT_KEY: u32 = 2;

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    Unauthorized = 1,
    InvalidInput = 2,
    TokenNotFound = 3,
}

#[contract]
pub struct ContentNFT;

#[contractimpl]
impl ContentNFT {
    pub fn mint(
        env: Env,
        creator: Address,
        metadata_hash: String,
        royalty_percentage: u32,
    ) -> Result<u128, Error> {
        if metadata_hash.len() == 0 {
            return Err(Error::InvalidInput);
        }

        let mut count: u128 = env.storage().instance().get(&TOKEN_COUNT_KEY).unwrap_or(0);
        count += 1;
        let token_id = count;

        let mut owners: Map<u128, Address> = env
            .storage()
            .instance()
            .get(&TOKEN_OWNERS_KEY)
            .unwrap_or_else(|| Map::new(&env));
        owners.set(token_id, creator);

        let mut metadata_map: Map<u128, (String, u32)> = env
            .storage()
            .instance()
            .get(&TOKEN_METADATA_KEY)
            .unwrap_or_else(|| Map::new(&env));
        metadata_map.set(token_id, (metadata_hash, royalty_percentage));

        env.storage().instance().set(&TOKEN_COUNT_KEY, &count);
        env.storage().instance().set(&TOKEN_OWNERS_KEY, &owners);
        env.storage()
            .instance()
            .set(&TOKEN_METADATA_KEY, &metadata_map);

        Ok(token_id)
    }

    pub fn transfer(env: Env, from: Address, to: Address, token_id: u128) -> Result<(), Error> {
        let owners: Map<u128, Address> = env
            .storage()
            .instance()
            .get(&TOKEN_OWNERS_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let current_owner = owners.get(token_id).ok_or(Error::TokenNotFound)?;

        if current_owner != from {
            return Err(Error::Unauthorized);
        }

        let mut new_owners = owners;
        new_owners.set(token_id, to);
        env.storage().instance().set(&TOKEN_OWNERS_KEY, &new_owners);
        Ok(())
    }

    pub fn get_owner(env: Env, token_id: u128) -> Result<Address, Error> {
        let owners: Map<u128, Address> = env
            .storage()
            .instance()
            .get(&TOKEN_OWNERS_KEY)
            .unwrap_or_else(|| Map::new(&env));
        owners.get(token_id).ok_or(Error::TokenNotFound)
    }

    pub fn get_metadata(env: Env, token_id: u128) -> Option<(String, u32)> {
        let metadata: Map<u128, (String, u32)> = env
            .storage()
            .instance()
            .get(&TOKEN_METADATA_KEY)
            .unwrap_or_else(|| Map::new(&env));
        metadata.get(token_id)
    }

    pub fn total_supply(env: Env) -> u128 {
        env.storage().instance().get(&TOKEN_COUNT_KEY).unwrap_or(0)
    }
}

#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Map, String};

const CONTENT_MAP_KEY: u32 = 0;
const HASH_SET_KEY: u32 = 1;
const NEXT_ID_KEY: u32 = 2;

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    InvalidInput = 1,
    NotFound = 2,
    DuplicateContent = 3,
}

#[contract]
pub struct ContentRegistry;

#[contractimpl]
impl ContentRegistry {
    pub fn register_content(
        env: Env,
        creator: Address,
        content_hash: String,
        ipfs_hash: String,
    ) -> Result<u128, Error> {
        if content_hash.len() == 0 || ipfs_hash.len() == 0 {
            return Err(Error::InvalidInput);
        }

        let mut hash_set: Map<String, bool> = env
            .storage()
            .instance()
            .get(&HASH_SET_KEY)
            .unwrap_or_else(|| Map::new(&env));

        if hash_set.get(content_hash.clone()).unwrap_or(false) {
            return Err(Error::DuplicateContent);
        }

        let mut next_id: u128 = env.storage().instance().get(&NEXT_ID_KEY).unwrap_or(1);
        let content_id = next_id;
        next_id += 1;

        let timestamp = env.ledger().timestamp();
        let content_data = (creator.clone(), content_hash.clone(), ipfs_hash, timestamp);

        let mut contents: Map<u128, (Address, String, String, u64)> = env
            .storage()
            .instance()
            .get(&CONTENT_MAP_KEY)
            .unwrap_or_else(|| Map::new(&env));

        contents.set(content_id, content_data);
        hash_set.set(content_hash, true);

        env.storage()
            .instance()
            .set(&NEXT_ID_KEY, &(next_id as u128));
        env.storage().instance().set(&CONTENT_MAP_KEY, &contents);
        env.storage().instance().set(&HASH_SET_KEY, &hash_set);
        Ok(content_id)
    }

    pub fn verify_content(env: Env, content_id: u128) -> Result<(), Error> {
        let contents: Map<u128, (Address, String, String, u64)> = env
            .storage()
            .instance()
            .get(&CONTENT_MAP_KEY)
            .unwrap_or_else(|| Map::new(&env));

        if !contents.contains_key(content_id) {
            return Err(Error::NotFound);
        }
        Ok(())
    }

    pub fn check_duplicate(env: Env, content_hash: String) -> bool {
        let hash_set: Map<String, bool> = env
            .storage()
            .instance()
            .get(&HASH_SET_KEY)
            .unwrap_or_else(|| Map::new(&env));
        hash_set.get(content_hash).unwrap_or(false)
    }

    pub fn get_content(env: Env, content_id: u128) -> Option<(Address, String, String, u64)> {
        let contents: Map<u128, (Address, String, String, u64)> = env
            .storage()
            .instance()
            .get(&CONTENT_MAP_KEY)
            .unwrap_or_else(|| Map::new(&env));
        contents.get(content_id)
    }

    pub fn total_contents(env: Env) -> u128 {
        let next_id: u128 = env.storage().instance().get(&NEXT_ID_KEY).unwrap_or(1);
        if next_id > 1 {
            next_id - 1
        } else {
            0
        }
    }
}

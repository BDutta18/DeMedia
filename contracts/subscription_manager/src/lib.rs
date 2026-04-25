#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Map};

const SUBSCRIPTIONS_KEY: u32 = 0;
const NEXT_SUB_ID_KEY: u32 = 1;
const ACCESS_KEY: u32 = 2;

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    NotFound = 1,
}

#[contract]
pub struct SubscriptionManager;

#[contractimpl]
impl SubscriptionManager {
    pub fn subscribe(
        env: Env,
        subscriber: Address,
        tier: u32,
        duration_seconds: u64,
    ) -> Result<u64, Error> {
        let mut next_id: u64 = env.storage().instance().get(&NEXT_SUB_ID_KEY).unwrap_or(1);
        let sub_id = next_id;
        next_id += 1;

        let timestamp = env.ledger().timestamp();
        let end_time = timestamp + duration_seconds;

        let sub_data = (subscriber, tier, timestamp, end_time);

        let mut subs: Map<u64, (Address, u32, u64, u64)> = env
            .storage()
            .instance()
            .get(&SUBSCRIPTIONS_KEY)
            .unwrap_or_else(|| Map::new(&env));
        subs.set(sub_id, sub_data);

        env.storage().instance().set(&NEXT_SUB_ID_KEY, &next_id);
        env.storage().instance().set(&SUBSCRIPTIONS_KEY, &subs);
        Ok(sub_id)
    }

    pub fn grant_content_access(
        env: Env,
        subscriber: Address,
        content_id: u128,
    ) -> Result<(), Error> {
        let mut access: Map<(Address, u128), bool> = env
            .storage()
            .instance()
            .get(&ACCESS_KEY)
            .unwrap_or_else(|| Map::new(&env));

        access.set((subscriber, content_id), true);
        env.storage().instance().set(&ACCESS_KEY, &access);
        Ok(())
    }

    pub fn validate_access(env: Env, subscriber: Address, content_id: u128) -> bool {
        let access: Map<(Address, u128), bool> = env
            .storage()
            .instance()
            .get(&ACCESS_KEY)
            .unwrap_or_else(|| Map::new(&env));

        access.get((subscriber, content_id)).unwrap_or(false)
    }

    pub fn get_subscription(env: Env, sub_id: u64) -> Option<(Address, u32, u64, u64)> {
        let subs: Map<u64, (Address, u32, u64, u64)> = env
            .storage()
            .instance()
            .get(&SUBSCRIPTIONS_KEY)
            .unwrap_or_else(|| Map::new(&env));
        subs.get(sub_id)
    }
}

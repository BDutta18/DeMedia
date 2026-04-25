#![no_std]

use soroban_sdk::{contract, contracterror, contractimpl, Address, Env, Map};

const ROLES_KEY: u32 = 0;
const ADMIN_KEY: u32 = 1;

#[contracterror]
#[derive(Clone, Copy)]
pub enum Error {
    Unauthorized = 1,
    RoleAlreadyAssigned = 2,
    RoleNotAssigned = 3,
}

#[contract]
pub struct AccessControl;

#[contractimpl]
impl AccessControl {
    pub fn has_role(env: Env, address: Address, role: u32) -> bool {
        let roles: Map<Address, u32> = env
            .storage()
            .instance()
            .get(&ROLES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        roles.get(address).unwrap_or(255) == role
    }

    pub fn assign_role(env: Env, admin: Address, address: Address, role: u32) -> Result<(), Error> {
        if !Self::has_role(env.clone(), admin.clone(), Role::Admin as u32) {
            return Err(Error::Unauthorized);
        }

        let mut roles: Map<Address, u32> = env
            .storage()
            .instance()
            .get(&ROLES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let current_role = roles.get(address.clone()).unwrap_or(255);
        if current_role == role {
            return Err(Error::RoleAlreadyAssigned);
        }

        roles.set(address.clone(), role);
        env.storage().instance().set(&ROLES_KEY, &roles);

        if !env.storage().instance().has(&ADMIN_KEY) {
            env.storage().instance().set(&ADMIN_KEY, &address);
            roles.set(address, Role::Admin as u32);
            env.storage().instance().set(&ROLES_KEY, &roles);
        }

        Ok(())
    }

    pub fn revoke_role(env: Env, admin: Address, address: Address, role: u32) -> Result<(), Error> {
        if !Self::has_role(env.clone(), admin, Role::Admin as u32) {
            return Err(Error::Unauthorized);
        }

        let mut roles: Map<Address, u32> = env
            .storage()
            .instance()
            .get(&ROLES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        let current_role = roles.get(address.clone()).unwrap_or(255);
        if current_role != role {
            return Err(Error::RoleNotAssigned);
        }

        roles.remove(address);
        env.storage().instance().set(&ROLES_KEY, &roles);
        Ok(())
    }

    pub fn get_user_role(env: Env, address: Address) -> u32 {
        let roles: Map<Address, u32> = env
            .storage()
            .instance()
            .get(&ROLES_KEY)
            .unwrap_or_else(|| Map::new(&env));
        roles.get(address).unwrap_or(255)
    }

    pub fn is_admin(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Admin as u32)
    }

    pub fn is_creator(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Creator as u32)
    }

    pub fn is_consumer(env: Env, address: Address) -> bool {
        Self::has_role(env, address, Role::Consumer as u32)
    }
}

enum Role {
    Admin = 0,
    Creator = 1,
    Consumer = 2,
    Moderator = 3,
}

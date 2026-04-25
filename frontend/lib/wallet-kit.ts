"use client"

import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit"
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter"
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils"

let initialized = false

const getKit = () => {
  if (!initialized) {
    StellarWalletsKit.init({
      selectedWalletId: FREIGHTER_ID,
      modules: defaultModules(),
      network: Networks.TESTNET,
    })
    initialized = true
  }
  return StellarWalletsKit
}

export const getSupportedWallets = async () => {
  try {
    return await getKit().refreshSupportedWallets()
  } catch {
    // Keep auth screen resilient if wallet-kit module probing fails in browser-specific contexts.
    return []
  }
}

export const connectWallet = async () => {
  const kit = getKit()
  const result = await kit.authModal()

  if (result && typeof result === "object" && "address" in result && typeof result.address === "string") {
    return result
  }

  // Some wallets resolve auth without returning the address payload.
  const fallback = await kit.getAddress()
  if (fallback?.address) return fallback

  throw new Error("Wallet connected but no address was returned")
}

export const getWalletAddress = async () => {
  return getKit().getAddress()
}

export const signWalletMessage = async (message: string, address?: string) => {
  return getKit().signMessage(message, {
    networkPassphrase: Networks.TESTNET,
    address,
  })
}

export const signWalletTransaction = async (xdr: string, address?: string) => {
  return getKit().signTransaction(xdr, {
    networkPassphrase: Networks.TESTNET,
    address,
  })
}

export const getWalletNetwork = async () => {
  return getKit().getNetwork()
}

export const disconnectWallet = async () => {
  return getKit().disconnect()
}

export const isFreighterInstalled = async () => {
  if (typeof window === "undefined") return false

  const hasFreighterOnWindow = Boolean((window as Window & { freighter?: unknown }).freighter)
  if (hasFreighterOnWindow) return true

  // Additional check: try to access window Freighter directly
  try {
    if (typeof (window as any).freighter !== "undefined") return true
  } catch {
    // Ignore errors
  }

  // Try connected wallets from stellar-wallets-kit
  try {
    const kit = getKit()
    const supported = await kit.refreshSupportedWallets()
    const freighter = supported.find(w => w.id === FREIGHTER_ID)
    if (freighter?.isAvailable) return true
  } catch {
    // Ignore errors
  }

  return false
}

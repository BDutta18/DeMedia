"use client"

import {
  StellarWalletsKit,
  Networks,
} from "@creit.tech/stellar-wallets-kit"
import {
  getAddress as freighterGetAddress,
  getNetwork as freighterGetNetwork,
  isConnected as freighterIsConnected,
  requestAccess as freighterRequestAccess,
  signMessage as freighterSignMessage,
  signTransaction as freighterSignTransaction,
} from "@stellar/freighter-api"
import { FREIGHTER_ID } from "@creit.tech/stellar-wallets-kit/modules/freighter"
import { defaultModules } from "@creit.tech/stellar-wallets-kit/modules/utils"

let initialized = false
const TESTNET_PASSPHRASE = Networks.TESTNET

type WalletAddressResult = { address: string }
type WalletSignMessageResult = { signedMessage: string | null; signerAddress: string }
type WalletSignTransactionResult = { signedTxXdr: string; signerAddress: string }
type WalletNetworkResult = { network: string; networkPassphrase: string }
type FreighterResponse = { error?: string } & Record<string, unknown>

const hasFreighterError = (response: FreighterResponse): response is FreighterResponse & { error: string } =>
  typeof response.error === "string" && response.error.length > 0

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
  try {
    const accessResponse = (await freighterRequestAccess()) as FreighterResponse
    if (hasFreighterError(accessResponse)) {
      throw new Error(accessResponse.error)
    }

    const address = typeof accessResponse.address === "string" ? accessResponse.address : ""
    if (address) return { address }
  } catch (error) {
    // If Freighter is installed but access fails, surface the real reason.
    let hasFreighterExtension = false
    try {
      const connectedResponse = (await freighterIsConnected()) as FreighterResponse
      hasFreighterExtension = !hasFreighterError(connectedResponse)
    } catch {
      // Ignore this check and continue with wallet-kit fallback.
    }
    if (hasFreighterExtension) throw error
  }

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
  try {
    const addressResponse = (await freighterGetAddress()) as FreighterResponse
    if (!hasFreighterError(addressResponse) && typeof addressResponse.address === "string" && addressResponse.address) {
      return { address: addressResponse.address } satisfies WalletAddressResult
    }
  } catch {
    // Fall back to wallet-kit below.
  }

  return getKit().getAddress()
}

export const signWalletMessage = async (message: string, address?: string) => {
  try {
    const signMessageCompat = freighterSignMessage as unknown as (
      value: string,
      opts: Record<string, string>
    ) => Promise<unknown>

    const signResponse = (await signMessageCompat(message, {
      networkPassphrase: TESTNET_PASSPHRASE,
      ...(address ? { address } : {}),
    })) as FreighterResponse

    if (hasFreighterError(signResponse)) {
      throw new Error(signResponse.error)
    }

    if (typeof signResponse.signedMessage === "string" && typeof signResponse.signerAddress === "string") {
      return {
        signedMessage: signResponse.signedMessage,
        signerAddress: signResponse.signerAddress,
      } satisfies WalletSignMessageResult
    }
  } catch {
    // Fall back to wallet-kit below.
  }

  return getKit().signMessage(message, {
    networkPassphrase: TESTNET_PASSPHRASE,
    address,
  })
}

export const signWalletTransaction = async (xdr: string, address?: string) => {
  try {
    const signResponse = (await freighterSignTransaction(xdr, {
      networkPassphrase: TESTNET_PASSPHRASE,
      ...(address ? { address } : {}),
    })) as FreighterResponse

    if (hasFreighterError(signResponse)) {
      throw new Error(signResponse.error)
    }

    if (typeof signResponse.signedTxXdr === "string" && typeof signResponse.signerAddress === "string") {
      return {
        signedTxXdr: signResponse.signedTxXdr,
        signerAddress: signResponse.signerAddress,
      } satisfies WalletSignTransactionResult
    }
  } catch {
    // Fall back to wallet-kit below.
  }

  return getKit().signTransaction(xdr, {
    networkPassphrase: TESTNET_PASSPHRASE,
    address,
  })
}

export const getWalletNetwork = async () => {
  try {
    const networkResponse = (await freighterGetNetwork()) as FreighterResponse
    if (
      !hasFreighterError(networkResponse) &&
      typeof networkResponse.network === "string" &&
      typeof networkResponse.networkPassphrase === "string"
    ) {
      return {
        network: networkResponse.network,
        networkPassphrase: networkResponse.networkPassphrase,
      } satisfies WalletNetworkResult
    }
  } catch {
    // Fall back to wallet-kit below.
  }

  return getKit().getNetwork()
}

export const disconnectWallet = async () => {
  return getKit().disconnect()
}

export const isFreighterInstalled = async () => {
  if (typeof window === "undefined") return false

  try {
    const connectedResponse = (await freighterIsConnected()) as FreighterResponse
    if (!hasFreighterError(connectedResponse)) return true
  } catch {
    // Ignore errors and continue with legacy checks.
  }

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

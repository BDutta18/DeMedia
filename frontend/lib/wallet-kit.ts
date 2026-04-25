"use client"

import {
  FREIGHTER_ID,
  StellarWalletsKit,
  WalletNetwork,
  allowAllModules,
  type ISupportedWallet,
} from "@creit.tech/stellar-wallets-kit"
import {
  getAddress as getFreighterAddress,
  getNetwork as getFreighterNetwork,
  isConnected as isFreighterConnected,
  requestAccess as requestFreighterAccess,
  signMessage as signFreighterMessage,
  signTransaction as signFreighterTransaction,
} from "@stellar/freighter-api"

let kit: StellarWalletsKit | null = null

const getKit = () => {
  if (!kit) {
    kit = new StellarWalletsKit({
      selectedWalletId: FREIGHTER_ID,
      modules: allowAllModules(),
      network: WalletNetwork.TESTNET,
    })
  }
  return kit
}

export const getSupportedWallets = async () => {
  try {
    return await getKit().getSupportedWallets()
  } catch {
    // Keep auth screen resilient if wallet-kit module probing fails in browser-specific contexts.
    return []
  }
}

const selectWalletFromModal = async () => {
  const wallet = await new Promise<ISupportedWallet>((resolve, reject) => {
    void getKit().openModal({
      onWalletSelected: (option) => resolve(option),
      onClosed: (error) => reject(error || new Error("Wallet selection was cancelled")),
      modalTitle: "Connect Wallet",
    })
  })

  getKit().setWallet(wallet.id)
}

const getFreighterError = (result: unknown): string | null => {
  if (!result || typeof result !== "object") return null
  const err = (result as { error?: { message?: string; code?: string } }).error
  if (!err) return null
  return err.message || err.code || "Freighter request failed"
}

export const connectWallet = async () => {
  const freighterInstalled = await isFreighterInstalled()
  if (freighterInstalled) {
    try {
      const access = await requestFreighterAccess()
      const accessError = getFreighterError(access)
      if (accessError) throw new Error(accessError)
      if (!access.address) throw new Error("No address returned by Freighter")
      return { address: access.address }
    } catch {
      // Fall through to wallet-kit modal path for parity with legacy app behavior.
    }
  }

  await selectWalletFromModal()
  return getKit().getAddress()
}

export const getWalletAddress = async () => {
  if (await isFreighterInstalled()) {
    try {
      const addressResult = await getFreighterAddress()
      const addressError = getFreighterError(addressResult)
      if (addressError) throw new Error(addressError)
      if (!addressResult.address) throw new Error("No address returned by Freighter")
      return { address: addressResult.address }
    } catch {
      // Fall back to wallet-kit if direct Freighter call is unavailable.
    }
  }
  return getKit().getAddress()
}

export const signWalletMessage = async (message: string, address?: string) => {
  if (await isFreighterInstalled()) {
    try {
      const signed = await signFreighterMessage(message, {
        networkPassphrase: WalletNetwork.TESTNET,
        address,
      })
      const signError = getFreighterError(signed)
      if (signError) throw new Error(signError)
      if (!signed.signedMessage) throw new Error("No signature returned by Freighter")
      return {
        signedMessage: String(signed.signedMessage),
        signerAddress: signed.signerAddress,
      }
    } catch {
      // Fall back to wallet-kit for wallet-agnostic signing support.
    }
  }
  return getKit().signMessage(message, {
    networkPassphrase: WalletNetwork.TESTNET,
    address,
  })
}

export const signWalletTransaction = async (xdr: string, address?: string) => {
  if (await isFreighterInstalled()) {
    try {
      const signed = await signFreighterTransaction(xdr, {
        networkPassphrase: WalletNetwork.TESTNET,
        address,
      })
      const signError = getFreighterError(signed)
      if (signError) throw new Error(signError)
      if (!signed.signedTxXdr) throw new Error("No signed transaction returned by Freighter")
      return {
        signedTxXdr: signed.signedTxXdr,
        signerAddress: signed.signerAddress,
      }
    } catch {
      // Fall back to wallet-kit for extension compatibility.
    }
  }
  return getKit().signTransaction(xdr, {
    networkPassphrase: WalletNetwork.TESTNET,
    address,
  })
}

export const getWalletNetwork = async () => {
  if (await isFreighterInstalled()) {
    try {
      const network = await getFreighterNetwork()
      const networkError = getFreighterError(network)
      if (networkError) throw new Error(networkError)
      return {
        network: network.network,
        networkPassphrase: network.networkPassphrase,
      }
    } catch {
      // Fall back to wallet-kit when direct API is unavailable.
    }
  }
  return getKit().getNetwork()
}

export const disconnectWallet = async () => {
  return getKit().disconnect()
}

export const isFreighterInstalled = async () => {
  if (typeof window === "undefined") return false

  const hasFreighterOnWindow = Boolean((window as Window & { freighter?: unknown }).freighter)
  if (hasFreighterOnWindow) return true

  try {
    const result = await isFreighterConnected()
    if (result && result.isConnected) return true
  } catch {
    // isFreighterConnected may fail, try alternative check
  }

  // Additional check: try to access window Freighter directly
  try {
    if (typeof (window as any).freighter !== "undefined") return true
  } catch {
    // Ignore errors
  }

  // Try connected wallets from stellar-wallets-kit
  try {
    const kit = getKit()
    const supported = await kit.getSupportedWallets()
    const freighter = supported.find(w => w.id === FREIGHTER_ID)
    if (freighter?.isAvailable) return true
  } catch {
    // Ignore errors
  }

  return false
}

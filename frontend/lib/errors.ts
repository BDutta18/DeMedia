export type WalletErrorCode =
  | "WALLET_NOT_FOUND"
  | "WALLET_REJECTED"
  | "INSUFFICIENT_BALANCE"
  | "NETWORK_MISMATCH"
  | "UNKNOWN"

export const mapWalletError = (error: unknown): { code: WalletErrorCode; message: string } => {
  const raw =
    typeof error === "string"
      ? error
      : error instanceof Error
        ? error.message
        : JSON.stringify(error)

  const message = raw.toLowerCase()

  if (
    message.includes("wallet") &&
    (message.includes("not found") || message.includes("not installed") || message.includes("unavailable"))
  ) {
    return { code: "WALLET_NOT_FOUND", message: "Wallet not found. Install or enable a Stellar wallet." }
  }

  if (
    message.includes("rejected") ||
    message.includes("declined") ||
    message.includes("denied") ||
    message.includes("cancel")
  ) {
    return { code: "WALLET_REJECTED", message: "The request was rejected in your wallet." }
  }

  if (
    message.includes("insufficient") ||
    message.includes("underfunded") ||
    message.includes("tx_insufficient_balance")
  ) {
    return { code: "INSUFFICIENT_BALANCE", message: "Insufficient XLM balance for this transaction." }
  }

  if (message.includes("network") || message.includes("passphrase")) {
    return { code: "NETWORK_MISMATCH", message: "Wrong Stellar network selected in your wallet." }
  }

  return { code: "UNKNOWN", message: raw }
}

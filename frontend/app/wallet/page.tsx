"use client"

import { useState, useEffect, useRef } from "react"
import type { ReactNode } from "react"
import { useAuth } from "@/lib/auth-context"
import { Copy, Check, Download, UploadIcon, ExternalLink, Shield, Coins, Clock } from "lucide-react"
import { useRouter } from "next/navigation"
import { Asset, Horizon, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk"
import { mapWalletError } from "@/lib/errors"
import { disconnectWallet, getWalletAddress, signWalletTransaction } from "@/lib/wallet-kit"
import { getBackendApiBaseUrl } from "@/lib/backend-url"

type TxStatus = "pending" | "success" | "fail"

export default function WalletPage() {
  const { address, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [txMessage, setTxMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState<
    Array<{ type: string; amount: string; party: string; time: string; status: TxStatus; txHash?: string }>
  >([])
  const [isFundingWallet, setIsFundingWallet] = useState(false)
  const autoFundAttemptedRef = useRef(false)

  const [xlmBalance, setXlmBalance] = useState<string>("0.00")
  const [usdBalance, setUsdBalance] = useState<string>("$0.00")

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (_error) {
      // no-op
    } finally {
      logout()
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const requestFriendbotFunding = async () => {
    if (!address || isFundingWallet) return
    setIsFundingWallet(true)
    setTxMessage("Requesting testnet funds...")
    try {
      const friendbotUrl = `https://friendbot.stellar.org/?addr=${encodeURIComponent(address.toUpperCase())}`
      const response = await fetch(friendbotUrl)
      if (!response.ok) {
        const text = await response.text()
        throw new Error(text || "Funding failed")
      }
      setTxMessage("Wallet funded from Friendbot. Refreshing balance...")
      await fetchBalance()
    } catch (error) {
      const mapped = mapWalletError(error)
      setTxMessage(mapped.message)
    } finally {
      setIsFundingWallet(false)
    }
  }

  const fetchBalance = async () => {
    if (!address) return

    try {
      const res = await fetch(`https://horizon-testnet.stellar.org/accounts/${address.toUpperCase()}`)
      if (res.ok) {
        autoFundAttemptedRef.current = false
        const data = await res.json()
        const nativeBalance = data.balances.find((b: any) => b.asset_type === "native")?.balance || "0"
        setXlmBalance(Number(nativeBalance).toFixed(4))
        setUsdBalance(`$${(Number(nativeBalance) * 0.12).toFixed(2)}`)
        return
      }

      if ((res.status === 404 || res.status === 400) && !autoFundAttemptedRef.current) {
        autoFundAttemptedRef.current = true
        setTxMessage("Wallet account is not activated on testnet. Funding via Friendbot...")
        await requestFriendbotFunding()
        return
      }

      setTxMessage("Wallet account is not activated on testnet yet. Use 'Fund Testnet Wallet'.")
    } catch (error) {
      console.error("Error fetching balance:", error)
    }
  }

  useEffect(() => {
    void fetchBalance()
    const interval = setInterval(() => {
      void fetchBalance()
    }, 12000)
    return () => clearInterval(interval)
  }, [address])

  useEffect(() => {
    if (!address) return
    const backendUrl = getBackendApiBaseUrl()
    const source = new EventSource(`${backendUrl}/api/tx/events/stream`)

    source.addEventListener("tx_status", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as {
        payload?: { txHash: string; status: TxStatus }
      }
      const tx = data.payload
      if (!tx?.txHash) return

      setTransactions((prev) => prev.map((item) => (item.txHash === tx.txHash ? { ...item, status: tx.status } : item)))
    })

    return () => source.close()
  }, [address])

  const copyAddress = () => {
    if (!address) return
    navigator.clipboard.writeText(address)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const sendXlm = async () => {
    if (!address) return
    if (!recipient || !amount) {
      setTxMessage("Recipient and amount are required")
      return
    }

    setIsSending(true)
    setTxMessage("Preparing transaction...")
    try {
      const { address: signerAddress } = await getWalletAddress()
      if (signerAddress !== address) throw new Error("Connected wallet address mismatch")

      const server = new Horizon.Server("https://horizon-testnet.stellar.org")
      const source = await server.loadAccount(address)

      const tx = new TransactionBuilder(source, {
        fee: "100",
        networkPassphrase: Networks.TESTNET,
      })
        .addOperation(
          Operation.payment({
            destination: recipient,
            asset: Asset.native(),
            amount,
          }),
        )
        .setTimeout(120)
        .build()

      const signed = await signWalletTransaction(tx.toXDR(), address)
      const signedTx = TransactionBuilder.fromXDR(signed.signedTxXdr, Networks.TESTNET)
      const submitted = await server.submitTransaction(signedTx)

      setTransactions((prev) => [
        {
          type: "Transfer",
          amount: `-${amount} XLM`,
          party: `${recipient.slice(0, 4)}...${recipient.slice(-4)}`,
          time: "just now",
          status: "success",
          txHash: submitted.hash,
        },
        ...prev,
      ])

      setTxMessage(`Transaction submitted: ${submitted.hash.slice(0, 10)}...`)
      setShowWithdrawModal(false)
      setRecipient("")
      setAmount("")
      void fetchBalance()
    } catch (error) {
      const mapped = mapWalletError(error)
      setTransactions((prev) => [
        {
          type: "Transfer",
          amount: `-${amount || "0"} XLM`,
          party: recipient ? `${recipient.slice(0, 4)}...${recipient.slice(-4)}` : "unknown",
          time: "just now",
          status: "fail",
        },
        ...prev,
      ])
      setTxMessage(mapped.message)
    } finally {
      setIsSending(false)
    }
  }

  if (!isAuthenticated) return null

  return (
    <main className="min-h-screen bg-[radial-gradient(circle_at_top,#172554_0%,#020617_45%,#000000_100%)] px-4 pb-16 pt-28 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <section className="rounded-3xl border border-cyan-900/40 bg-slate-950/70 p-6 shadow-2xl backdrop-blur md:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">Wallet Console</p>
              <h1 className="mt-2 text-3xl font-semibold text-white md:text-4xl">Digital Vault</h1>
              <p className="mt-2 text-sm text-slate-300">Manage balance, testnet funding, and transfers in one place.</p>
            </div>
            <button
              onClick={handleDisconnect}
              className="rounded-xl border border-rose-500/40 bg-rose-500/10 px-4 py-2 text-sm font-medium text-rose-300 transition hover:bg-rose-500/20"
            >
              Disconnect
            </button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 md:col-span-2">
              <p className="text-xs text-slate-400">Connected Address</p>
              <div className="mt-2 flex items-center gap-2">
                <code className="truncate font-mono text-sm text-cyan-300">{address}</code>
                <button onClick={copyAddress} className="rounded-md p-1.5 text-slate-300 hover:bg-slate-800">
                  {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
                </button>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
              <p className="text-xs text-slate-400">Network</p>
              <p className="mt-2 text-sm font-medium text-amber-300">Stellar Testnet</p>
            </div>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Stat title="Balance" value={`${xlmBalance} XLM`} />
            <Stat title="Estimated USD" value={usdBalance} />
            <Stat title="Transactions" value={String(transactions.length)} />
            <Stat title="Security" value="Protected" icon={<Shield className="h-4 w-4 text-emerald-400" />} />
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              onClick={() => setShowDepositModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 transition hover:bg-cyan-400"
            >
              <Download className="h-4 w-4" /> Deposit
            </button>
            <button
              onClick={() => setShowWithdrawModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-400"
            >
              <UploadIcon className="h-4 w-4" /> Withdraw
            </button>
            <button
              onClick={requestFriendbotFunding}
              disabled={isFundingWallet}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-semibold text-slate-200 transition hover:bg-slate-800 disabled:opacity-60"
            >
              {isFundingWallet ? "Funding..." : "Fund Testnet Wallet"}
            </button>
          </div>
          {txMessage && <p className="mt-3 text-sm text-cyan-200">{txMessage}</p>}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="rounded-3xl border border-slate-800 bg-slate-950/65 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Coins className="h-5 w-5 text-cyan-300" /> Assets
            </h2>
            <div className="space-y-3">
              <AssetRow symbol="XLM" name="Stellar Lumens" amount={xlmBalance} value={usdBalance} />
              <AssetRow symbol="MATIC" name="Polygon" amount="0.00" value="$0.00" />
              <AssetRow symbol="DeMedia" name="DeMedia Token" amount="0.00" value="$0.00" />
            </div>
          </div>

          <div className="rounded-3xl border border-slate-800 bg-slate-950/65 p-6">
            <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-white">
              <Clock className="h-5 w-5 text-amber-300" /> Transaction Timeline
            </h2>
            <div className="max-h-[420px] space-y-3 overflow-auto pr-1">
              {transactions.length === 0 && <p className="text-sm text-slate-400">No transactions yet.</p>}
              {transactions.map((tx, i) => (
                <div key={i} className="rounded-xl border border-slate-800 bg-slate-900/70 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-white">{tx.type}</p>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                        tx.status === "success"
                          ? "bg-emerald-500/20 text-emerald-300"
                          : tx.status === "pending"
                            ? "bg-amber-500/20 text-amber-300"
                            : "bg-rose-500/20 text-rose-300"
                      }`}
                    >
                      {tx.status}
                    </span>
                  </div>
                  <p className={`mt-1 text-sm ${tx.amount.startsWith("+") ? "text-emerald-300" : "text-rose-300"}`}>{tx.amount}</p>
                  <p className="mt-1 text-xs text-slate-400">
                    {tx.party} • {tx.time}
                  </p>
                  {tx.txHash && (
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${tx.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs text-cyan-300 hover:underline"
                    >
                      View on Explorer <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

      {showDepositModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowDepositModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-cyan-300">Deposit Funds</h3>
            <p className="mt-2 text-sm text-slate-400">Copy your address or fund your testnet wallet via Friendbot.</p>
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900 p-3">
              <code className="flex-1 truncate text-xs text-cyan-200">{address}</code>
              <button onClick={copyAddress} className="rounded p-1.5 text-slate-300 hover:bg-slate-800">
                {copied ? <Check className="h-4 w-4 text-emerald-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>
            <button
              onClick={requestFriendbotFunding}
              disabled={isFundingWallet}
              className="mt-4 w-full rounded-xl bg-cyan-500 px-4 py-2.5 text-sm font-semibold text-slate-950 disabled:opacity-60"
            >
              {isFundingWallet ? "Funding Testnet Wallet..." : "Fund Testnet Wallet"}
            </button>
          </div>
        </div>
      )}

      {showWithdrawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" onClick={() => setShowWithdrawModal(false)}>
          <div className="w-full max-w-md rounded-2xl border border-slate-700 bg-slate-950 p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-xl font-semibold text-violet-300">Withdraw Funds</h3>
            <div className="mt-4 space-y-3">
              <input
                type="text"
                placeholder="Recipient address (G...)"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Amount (XLM)"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 text-sm text-white placeholder:text-slate-500 focus:border-cyan-500 focus:outline-none"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={() => setShowWithdrawModal(false)} className="flex-1 rounded-xl border border-slate-700 bg-slate-900 px-4 py-2.5 text-sm font-medium text-slate-200">
                Cancel
              </button>
              <button onClick={sendXlm} disabled={isSending} className="flex-1 rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60">
                {isSending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

function Stat({ title, value, icon }: { title: string; value: string; icon?: ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4">
      <p className="text-xs text-slate-400">{title}</p>
      <div className="mt-2 flex items-center gap-2">
        {icon}
        <p className="text-lg font-semibold text-white">{value}</p>
      </div>
    </div>
  )
}

function AssetRow({ symbol, name, amount, value }: { symbol: string; name: string; amount: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 p-3">
      <div>
        <p className="text-sm font-medium text-white">{symbol}</p>
        <p className="text-xs text-slate-400">{name}</p>
      </div>
      <div className="text-right">
        <p className="text-sm font-semibold text-slate-100">{amount}</p>
        <p className="text-xs text-emerald-300">{value}</p>
      </div>
    </div>
  )
}

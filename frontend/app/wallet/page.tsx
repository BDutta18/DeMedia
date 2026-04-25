"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import FuturisticNavbar from "@/components/futuristic-navbar"
import { Copy, Check, Download, UploadIcon, ExternalLink, Shield, Key, Coins, Clock, DollarSign } from "lucide-react"
import { useRouter } from "next/navigation"
import { Asset, Horizon, Networks, Operation, TransactionBuilder } from "@stellar/stellar-sdk"
import { mapWalletError } from "@/lib/errors"
import { disconnectWallet, getWalletAddress, signWalletTransaction } from "@/lib/wallet-kit"
import { getBackendApiBaseUrl } from "@/lib/backend-url"

export default function WalletPage() {
  const { address, isAuthenticated, logout } = useAuth()
  const router = useRouter()
  const [copied, setCopied] = useState(false)
  const [selectedAsset, setSelectedAsset] = useState<string | null>(null)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [txMessage, setTxMessage] = useState<string | null>(null)
  const [isSending, setIsSending] = useState(false)
  const [recipient, setRecipient] = useState("")
  const [amount, setAmount] = useState("")
  const [transactions, setTransactions] = useState<Array<{ type: string; amount: string; party: string; time: string; status: "pending" | "success" | "fail"; txHash?: string }>>([])
  const [isFundingWallet, setIsFundingWallet] = useState(false)
  const autoFundAttemptedRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement>(null)

  const handleDisconnect = async () => {
    try {
      await disconnectWallet()
    } catch (_error) {
      // Keep local logout resilient even if wallet extension disconnect fails.
    } finally {
      logout()
    }
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  const [xlmBalance, setXlmBalance] = useState<string>("0.00")
  const [usdBalance, setUsdBalance] = useState<string>("$0.00")

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

      // Unfunded testnet accounts return 404/400 on horizon account lookup.
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
    const streamUrl = `${backendUrl}/api/tx/events/stream`
    const source = new EventSource(streamUrl)

    source.addEventListener("tx_status", (event) => {
      const data = JSON.parse((event as MessageEvent).data) as {
        payload?: { txHash: string; status: "pending" | "success" | "fail" }
      }

      const tx = data.payload
      if (!tx?.txHash) return

      setTransactions((prev) =>
        prev.map((item) =>
          item.txHash === tx.txHash
            ? {
                ...item,
                status: tx.status,
              }
            : item,
        ),
      )
    })

    return () => {
      source.close()
    }
  }, [address])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const particles: Array<{
      x: number
      y: number
      vx: number
      vy: number
      size: number
      color: string
    }> = []

    for (let i = 0; i < 50; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        size: Math.random() * 2 + 0.5,
        color: ["#00d4ff", "#7c3aed", "#fbbf24"][Math.floor(Math.random() * 3)],
      })
    }

    let frame: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((p) => {
        p.x += p.vx
        p.y += p.vy

        if (p.x < 0 || p.x > canvas.width) p.vx *= -1
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1

        ctx.beginPath()
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2)
        ctx.fillStyle = p.color
        ctx.globalAlpha = 0.6
        ctx.fill()
      })

      ctx.globalAlpha = 1
      frame = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const assets = [
    {
      symbol: "XLM",
      name: "Stellar Lumens",
      amount: xlmBalance,
      value: usdBalance,
      icon: "✶",
      color: "from-blue-500 to-cyan-500",
    },
    {
      symbol: "MATIC",
      name: "Polygon",
      amount: "0.00",
      value: "$0.00",
      icon: "⬡",
      color: "from-purple-500 to-pink-500",
    },
    {
      symbol: "DeMedia",
      name: "DeMedia Token",
      amount: "0.00",
      value: "$0.00",
      icon: "◈",
      color: "from-cyan-500 to-blue-500",
    },
  ]

  const requestFriendbotFunding = async () => {
    if (!address) return
    if (isFundingWallet) return
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
      if (signerAddress !== address) {
        throw new Error("Connected wallet address mismatch")
      }

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

  if (!isAuthenticated) {
    return null
  }

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a2e]">
      <canvas ref={canvasRef} className="fixed inset-0 z-0" style={{ mixBlendMode: "screen" }} />

      {/* Cursor spotlight */}
      <div
        className="pointer-events-none fixed z-10 h-96 w-96 rounded-full opacity-10 blur-3xl transition-all duration-300"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.6) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      <FuturisticNavbar />

      <div className="relative z-20 px-4 pt-32 pb-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          {/* Page title */}
          <div className="mb-12 text-center">
            <h1 className="mb-4 bg-gradient-to-r from-[#fbbf24] via-[#eab308] to-[#ca8a04] bg-clip-text text-5xl font-bold tracking-tight text-transparent md:text-6xl lg:text-7xl">
              Digital Vault
            </h1>
            <p className="text-lg text-gray-400">Manage your crypto assets and transactions</p>
          </div>

          {/* Panel 1: Connected Wallet */}
          <div className="mb-8 transform transition-all duration-500 hover:scale-[1.01]">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-purple-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              <div className="relative">
                <div className="mb-6 flex flex-col items-start justify-between gap-4 md:flex-row md:items-center">
                  <div>
                    <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">Connected Wallet</p>
                    <div className="flex items-center gap-3">
                      <code className="text-lg font-mono text-blue-400 md:text-xl">
                        {address?.slice(0, 10)}...{address?.slice(-8)}
                      </code>
                      <button
                        onClick={copyAddress}
                        className="rounded-lg p-2 transition-all hover:bg-white/10 hover:scale-110 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                      >
                        {copied ? (
                          <Check className="h-5 w-5 text-green-400" />
                        ) : (
                          <Copy className="h-5 w-5 text-gray-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <button
                    onClick={handleDisconnect}
                    className="group/btn rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-2 text-sm font-semibold text-red-400 transition-all hover:scale-105 hover:border-red-500/60 hover:bg-red-500/20 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  >
                    Disconnect
                  </button>
                </div>

                <div className="mb-6">
                  <div className="mb-2 text-sm text-gray-400">Total Balance</div>
                  <div className="bg-gradient-to-r from-[#fbbf24] via-[#eab308] to-[#ca8a04] bg-clip-text text-5xl font-bold text-transparent md:text-6xl">
                    {xlmBalance} XLM
                  </div>
                  <div className="mt-2 text-xl text-gray-500">{usdBalance} USD</div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row">
                  <button
                    onClick={() => setShowDepositModal(true)}
                    className="group/btn relative flex-1 overflow-hidden rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Download className="h-5 w-5" />
                      Deposit
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  </button>

                  <button
                    onClick={() => setShowWithdrawModal(true)}
                    className="group/btn relative flex-1 overflow-hidden rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-4 font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:scale-105 hover:shadow-[0_0_40px_rgba(124,58,237,0.5)]"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <UploadIcon className="h-5 w-5" />
                      Withdraw
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  </button>
                </div>
                {txMessage && <p className="mt-3 text-sm text-cyan-300">{txMessage}</p>}
              </div>
            </div>
          </div>

          {/* Panel 2: Assets */}
          <div className="mb-8">
            <h2 className="mb-4 text-2xl font-bold text-white">Assets</h2>
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {assets.map((asset, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedAsset(asset.symbol)}
                  className="group relative cursor-pointer transform transition-all duration-300 hover:scale-105 hover:-translate-y-2"
                >
                  <div
                    className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${asset.color} opacity-0 blur-xl transition-opacity duration-300 group-hover:opacity-50`}
                  />

                  <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_10px_30px_rgba(0,0,0,0.3)] backdrop-blur-xl">
                    <div className="mb-4 flex items-start justify-between">
                      <div
                        className={`flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${asset.color} text-3xl font-bold text-white shadow-lg`}
                      >
                        {asset.icon}
                      </div>
                      <ExternalLink className="h-5 w-5 text-gray-400 opacity-0 transition-opacity group-hover:opacity-100" />
                    </div>

                    <div className="mb-2">
                      <div className="text-2xl font-bold text-white">{asset.amount}</div>
                      <div className="text-sm text-gray-400">{asset.symbol}</div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500">{asset.name}</span>
                      <span className="font-semibold text-green-400">{asset.value}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Panel 3: Royalties */}
          <div className="mb-8">
            <div className="group relative overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_20px_40px_rgba(0,0,0,0.4)] backdrop-blur-2xl md:p-8">
              <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/10 via-transparent to-orange-500/10" />

              <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
                <div>
                  <h3 className="mb-2 flex items-center gap-2 text-xl font-bold text-white">
                    <Coins className="h-6 w-6 text-yellow-400" />
                    Pending Royalties
                  </h3>
                  <div className="mb-2 bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent md:text-5xl">
                    2.3 XLM
                  </div>
                  <div className="text-gray-400">≈ $4,315 USD</div>
                </div>

                <button className="group/btn relative overflow-hidden rounded-xl border border-yellow-500/50 bg-gradient-to-r from-yellow-600 to-orange-600 px-8 py-4 font-bold text-white shadow-[0_0_30px_rgba(251,191,36,0.4)] transition-all hover:scale-105 hover:shadow-[0_0_50px_rgba(251,191,36,0.6)]">
                  <span className="relative z-10 flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Claim All
                  </span>
                  <div className="absolute inset-0 animate-pulse bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                </button>
              </div>

              {/* Animated earnings graph line */}
              <div className="relative mt-6 h-20 overflow-hidden rounded-lg border border-white/5 bg-black/20">
                <svg className="h-full w-full" viewBox="0 0 400 80" preserveAspectRatio="none">
                  <path
                    d="M 0 60 Q 50 40, 100 50 T 200 45 T 300 35 T 400 30"
                    fill="none"
                    stroke="url(#gradient)"
                    strokeWidth="2"
                    className="animate-pulse"
                  />
                  <defs>
                    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00d4ff" />
                      <stop offset="50%" stopColor="#7c3aed" />
                      <stop offset="100%" stopColor="#fbbf24" />
                    </linearGradient>
                  </defs>
                </svg>
              </div>
            </div>
          </div>

          {/* Panel 4: Transaction History */}
          <div>
            <h2 className="mb-4 flex items-center gap-2 text-2xl font-bold text-white">
              <Clock className="h-6 w-6 text-blue-400" />
              Transaction Timeline
            </h2>

            <div className="relative">
              {/* Glowing vertical timeline */}
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-purple-500 to-transparent" />

              <div className="space-y-4">
                {transactions.map((tx, i) => (
                  <div
                    key={i}
                    className="group relative pl-16 transition-all duration-300 hover:translate-x-2"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    {/* Timeline dot */}
                    <div
                      className={`absolute left-4 top-6 h-4 w-4 rounded-full ${
                        tx.status === "success"
                          ? "bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.8)]"
                          : tx.status === "pending"
                            ? "bg-yellow-500 shadow-[0_0_10px_rgba(251,191,36,0.8)] animate-pulse"
                            : "bg-red-500 shadow-[0_0_10px_rgba(239,68,68,0.8)]"
                      }`}
                    />

                    {/* Transaction card */}
                    <div className="overflow-hidden rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-xl transition-all duration-300 hover:border-white/20 hover:bg-white/10 hover:shadow-[0_10px_30px_rgba(59,130,246,0.2)]">
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                        <div className="flex-1">
                          <div className="mb-1 flex items-center gap-2">
                            <span className="font-semibold text-white">{tx.type}</span>
                            <span
                              className={`text-lg font-bold ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}
                            >
                              {tx.amount}
                            </span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-400">
                            <code className="font-mono">{tx.party}</code>
                            <span>•</span>
                            <span>{tx.time}</span>
                          </div>
                        </div>

                        <button className="group/link flex items-center gap-1 text-sm text-blue-400 transition-colors hover:text-blue-300">
                          View
                          <ExternalLink className="h-4 w-4 transition-transform group-hover/link:translate-x-1" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Security Console (Floating Sidebar) */}
          <div className="fixed right-4 top-32 hidden w-64 lg:block">
            <div className="group overflow-hidden rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-2xl transition-all duration-300 hover:w-72 hover:border-green-500/30 hover:shadow-[0_0_30px_rgba(34,197,94,0.2)]">
              <div className="mb-4 flex items-center gap-3">
                <Shield className="h-6 w-6 text-green-500" />
                <h3 className="font-bold text-white">Security</h3>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">2FA Status</span>
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs text-green-400">Active</span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Backup Phrase</span>
                  <button className="text-xs text-blue-400 hover:text-blue-300">
                    <Key className="h-4 w-4" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">Risk Level</span>
                  <span className="text-xs font-bold text-green-400">Low</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Deposit Modal */}
      {showDepositModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowDepositModal(false)}
        >
          <div
            className="w-full max-w-md transform rounded-2xl border border-white/10 bg-black/90 p-8 shadow-2xl backdrop-blur-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-2xl font-bold text-transparent">
              Deposit Funds
            </h3>

            <div className="mb-6 flex justify-center">
              <div className="rounded-xl border-4 border-blue-500/50 bg-white p-4 shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                {/* Placeholder QR code */}
                <div className="h-48 w-48 bg-gradient-to-br from-blue-500 to-purple-500" />
              </div>
            </div>

            <p className="mb-4 text-center text-sm text-gray-400">Scan QR code or copy wallet address to deposit</p>

            <button
              onClick={requestFriendbotFunding}
              disabled={isFundingWallet}
              className="mb-4 w-full rounded-xl border border-blue-500/40 bg-blue-500/10 px-6 py-3 font-semibold text-blue-300 transition-all hover:bg-blue-500/20 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isFundingWallet ? "Funding Testnet Wallet..." : "Fund Testnet Wallet (Friendbot)"}
            </button>

            <div className="mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 p-3">
              <code className="flex-1 truncate text-sm text-blue-400">{address}</code>
              <button
                onClick={copyAddress}
                className="rounded-lg p-2 text-gray-400 transition-all hover:bg-white/10 hover:text-white"
              >
                {copied ? <Check className="h-4 w-4 text-green-400" /> : <Copy className="h-4 w-4" />}
              </button>
            </div>

            <button
              onClick={() => setShowDepositModal(false)}
              className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Withdraw Modal */}
      {showWithdrawModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
          onClick={() => setShowWithdrawModal(false)}
        >
          <div
            className="w-full max-w-md transform rounded-2xl border border-white/10 bg-black/90 p-8 shadow-2xl backdrop-blur-2xl transition-all"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-6 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-2xl font-bold text-transparent">
              Withdraw Funds
            </h3>

            <div className="mb-4">
              <label className="mb-2 block text-sm text-gray-400">Recipient Address</label>
              <input
                type="text"
                placeholder="G..."
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="mb-6">
              <label className="mb-2 block text-sm text-gray-400">Amount (XLM)</label>
              <input
                type="text"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-white placeholder-gray-500 transition-all focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              />
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowWithdrawModal(false)}
                className="flex-1 rounded-xl border border-white/10 bg-white/5 px-6 py-3 font-semibold text-white transition-all hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                onClick={sendXlm}
                disabled={isSending}
                className="flex-1 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-pink-600 px-6 py-3 font-semibold text-white shadow-[0_0_20px_rgba(124,58,237,0.3)] transition-all hover:shadow-[0_0_40px_rgba(124,58,237,0.5)] disabled:opacity-60"
              >
                {isSending ? "Sending..." : "Confirm"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

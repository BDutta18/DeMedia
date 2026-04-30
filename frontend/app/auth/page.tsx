"use client"

import { useState, useEffect, useRef } from "react"
import { Wallet, ExternalLink, Copy, Check, AlertCircle } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { connectWallet, getSupportedWallets, getWalletNetwork, isFreighterInstalled, signWalletMessage } from "@/lib/wallet-kit"
import { mapWalletError } from "@/lib/errors"

type AuthStatus =
  | "detect"
  | "connect"
  | "sign"
  | "connecting"
  | "wrong-network"
  | "awaiting-signature"
  | "verifying"
  | "success"
  | "error"

interface Toast {
  id: number
  message: string
  type: "error" | "success"
}

const TESTNET_PASSPHRASE = "Test SDF Network ; September 2015"

export default function AuthPage() {
  const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "")
  const [hasFreighter, setHasFreighter] = useState(false)
  const [address, setAddress] = useState<string | null>(null)
  const [status, setStatus] = useState<AuthStatus>("connect")
  const [toasts, setToasts] = useState<Toast[]>([])
  const [copiedAddress, setCopiedAddress] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const { login } = useAuth()
  const router = useRouter()
  const [walletCount, setWalletCount] = useState(0)
  const [isCheckingWallets, setIsCheckingWallets] = useState(true)

  // Liquid light wave background animation
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
      opacity: number
    }> = []

    // Create liquid light particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 3 + 1,
        color: ["#00d4ff", "#b624ff", "#00ffa3"][Math.floor(Math.random() * 3)],
        opacity: Math.random() * 0.5 + 0.3,
      })
    }

    let animationFrame: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle, i) => {
        particle.x += particle.vx
        particle.y += particle.vy

        if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1

        // Draw particle
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = particle.color
        ctx.globalAlpha = particle.opacity
        ctx.fill()

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x
          const dy = particle.y - otherParticle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(otherParticle.x, otherParticle.y)
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = (1 - distance / 150) * 0.2
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })

      ctx.globalAlpha = 1
      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  // Track mouse position for cursor spotlight
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  // Check for Freighter
  const detectWallets = async () => {
    try {
      if (typeof window === "undefined") return
      setIsCheckingWallets(true)

      const [wallets, freighterInstalled] = await Promise.all([getSupportedWallets(), isFreighterInstalled()])
      const available = wallets.filter((wallet) => wallet.isAvailable)
      const totalDetectedWallets = Math.max(available.length, freighterInstalled ? 1 : 0)
      const hasDetectedWallet = totalDetectedWallets > 0

      setWalletCount(totalDetectedWallets)
      setHasFreighter(freighterInstalled)
      setStatus(hasDetectedWallet ? "connect" : "detect")
    } catch (error) {
      console.error("Freighter detection error", error)
      setHasFreighter(false)
      setWalletCount(0)
      setStatus("detect")
    } finally {
      setIsCheckingWallets(false)
    }
  }

  useEffect(() => {
    void detectWallets()
  }, [])

  const addToast = (message: string, type: "error" | "success") => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, message, type }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 5000)
  }

  const handleInstall = () => {
    window.open("https://freighter.app/", "_blank")
  }

  const handleConnect = async () => {
    if (walletCount === 0 && !hasFreighter) {
      setStatus("detect")
      addToast("No compatible Stellar wallet detected. Please install or enable Freighter.", "error")
      return
    }

    setStatus("connecting")
    try {
      const result = await connectWallet()
      const publicKey = result.address
      
      if (!publicKey) throw new Error("No address returned")

      try {
        const walletNetwork = await getWalletNetwork()
        if (walletNetwork.networkPassphrase !== TESTNET_PASSPHRASE) {
          setStatus("wrong-network")
          addToast("Please switch wallet network to Stellar Testnet", "error")
          setTimeout(() => setStatus("connect"), 2000)
          return
        }
      } catch {
        // Some extension versions intermittently fail this read; proceed to sign step.
      }

      setAddress(publicKey)
      setStatus("sign")
      addToast("Wallet connected!", "success")
    } catch (error) {
      const mapped = mapWalletError(error)
      setStatus("error")
      addToast(mapped.message || "Connection rejected", "error")
      setTimeout(() => setStatus("connect"), 2000)
    }
  }

  const handleSign = async () => {
    setStatus("awaiting-signature")
    try {
      const timestamp = new Date().toISOString()
      const message = `Login verification at ${timestamp}`

      const signResponse = await signWalletMessage(message, address ?? undefined)
      const responseRecord =
        signResponse && typeof signResponse === "object"
          ? (signResponse as Record<string, unknown>)
          : {}

      const resolvedAddress =
        (typeof responseRecord.signerAddress === "string" && responseRecord.signerAddress) ||
        (typeof responseRecord.address === "string" && responseRecord.address) ||
        address

      const resolvedSignature =
        (typeof responseRecord.signedMessage === "string" && responseRecord.signedMessage) ||
        (typeof responseRecord.signature === "string" && responseRecord.signature) ||
        (typeof signResponse === "string" ? signResponse : "")

      if (!resolvedAddress || !resolvedSignature) {
        throw new Error("Wallet returned an invalid signature response")
      }

      const decodeBase64 = (value: string): Uint8Array | null => {
        try {
          const binary = atob(value.trim())
          const bytes = new Uint8Array(binary.length)
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
          return bytes
        } catch {
          return null
        }
      }

      const decodeHex = (value: string): Uint8Array | null => {
        const cleaned = value.trim().toLowerCase().replace(/^0x/, "")
        if (!/^[0-9a-f]+$/.test(cleaned) || cleaned.length % 2 !== 0) return null
        const bytes = new Uint8Array(cleaned.length / 2)
        for (let i = 0; i < cleaned.length; i += 2) {
          bytes[i / 2] = Number.parseInt(cleaned.slice(i, i + 2), 16)
        }
        return bytes
      }

      const encodeBase64 = (bytes: Uint8Array): string => {
        let binary = ""
        for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
        return btoa(binary)
      }

      const normalizeSignatureForLegacyVerify = (value: string): string => {
        const base64Bytes = decodeBase64(value)
        if (base64Bytes) {
          if (base64Bytes.length === 64) return encodeBase64(base64Bytes)
          if (base64Bytes.length === 68) return encodeBase64(base64Bytes.slice(4))
          if (base64Bytes.length > 64) return encodeBase64(base64Bytes.slice(base64Bytes.length - 64))
        }

        const hexBytes = decodeHex(value)
        if (hexBytes) {
          if (hexBytes.length === 64) return encodeBase64(hexBytes)
          if (hexBytes.length === 68) return encodeBase64(hexBytes.slice(4))
          if (hexBytes.length > 64) return encodeBase64(hexBytes.slice(hexBytes.length - 64))
        }

        return value
      }

      const normalizedSignature = normalizeSignatureForLegacyVerify(resolvedSignature)

      setStatus("verifying")

      const verifyPayload = {
        address: resolvedAddress,
        message,
        signature: normalizedSignature,
        signedMessage: resolvedSignature,
      }

      const tryVerify = async (url: string) =>
        fetch(url, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(verifyPayload),
        })

      const primaryVerifyUrl = backendBaseUrl ? `${backendBaseUrl}/api/wallet/verify` : "/api/auth/verify"
      let response: globalThis.Response
      try {
        response = await tryVerify(primaryVerifyUrl)
      } catch {
        // If direct backend call fails in browser (network/CORS/adblock), fallback to local proxy route.
        response = await tryVerify("/api/auth/verify")
      }

      let data: any = {}
      try {
        data = await response.json()
      } catch {
        data = {}
      }

      if (response.ok && data.token) {
        login(data.address, data.token)
        setStatus("success")
        addToast("Authentication successful!", "success")

        setTimeout(() => {
          router.push("/dashboard")
        }, 2000)
      } else {
        const detail =
          (typeof data?.detail === "string" && data.detail) ||
          (typeof data?.error === "string" && data.error) ||
          (typeof data?.message === "string" && data.message) ||
          "Verification failed"
        throw new Error(detail)
      }
    } catch (error) {
      const mapped = mapWalletError(error)
      setStatus("error")
      addToast(mapped.message || "Signature declined", "error")
      setTimeout(() => setStatus("sign"), 2000)
    }
  }

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      setCopiedAddress(true)
      setTimeout(() => setCopiedAddress(false), 2000)
    }
  }

  const getStatusText = () => {
    switch (status) {
      case "detect":
        return "No Wallet Detected"
      case "connect":
        return "Ready to Connect"
      case "connecting":
        return "Connecting..."
      case "sign":
        return "Ready to Sign"
      case "awaiting-signature":
        return "Awaiting Signature..."
      case "verifying":
        return "Verifying..."
      case "wrong-network":
        return "Wrong Network"
      case "success":
        return "Authentication Successful"
      case "error":
        return "Connection Failed"
      default:
        return ""
    }
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-gradient-to-br from-[#0a0a0f] via-[#12121a] to-[#1a1a2e]">
      {/* Animated liquid background canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 z-0" style={{ mixBlendMode: "screen" }} />

      {/* Cursor spotlight effect */}
      <div
        className="pointer-events-none fixed z-10 h-96 w-96 rounded-full opacity-20 blur-3xl transition-all duration-300"
        style={{
          background: "radial-gradient(circle, rgba(0, 212, 255, 0.4) 0%, transparent 70%)",
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
        }}
      />

      {/* Main content */}
      <div className="relative z-20 flex min-h-screen items-center justify-center px-4 py-12">
        {status !== "success" ? (
          /* Glass authentication panel */
          <div
            className="group relative w-full max-w-lg transform transition-all duration-700 hover:scale-[1.02]"
            style={{
              animation: "fadeIn 0.8s ease-out",
            }}
          >
            {/* Glow effect behind card */}
            <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-100" />

            {/* Main glass card */}
            <div className="relative rounded-3xl border border-white/10 bg-black/40 p-8 shadow-[0_20px_80px_rgba(0,0,0,0.8)] backdrop-blur-2xl sm:p-12">
              {/* Logo/Brand */}
              <div className="mb-8 text-center">
                <h1 className="mb-2 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-4xl font-bold tracking-wider text-transparent sm:text-5xl">
                  DeMedia
                </h1>
                <p className="text-sm text-gray-400">Decentralized Content Platform</p>
              </div>

              {/* Detect State - No Freighter */}
              {status === "detect" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full border-2 border-dashed border-purple-500/40 bg-purple-500/5">
                    <Wallet className="h-12 w-12 text-purple-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">{isCheckingWallets ? "Checking Wallet..." : "Install Freighter"}</h2>
                  <p className="text-sm text-gray-400">
                    {isCheckingWallets
                      ? "Detecting your browser wallets..."
                      : "You need a Stellar wallet to access DeMedia. Freighter is free and takes less than a minute."}
                  </p>

                  <button
                    onClick={handleInstall}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 font-semibold text-white shadow-[0_0_20px_rgba(182,36,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(182,36,255,0.5)] focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      Install Freighter
                      <ExternalLink className="h-4 w-4" />
                    </span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  </button>

                  <button
                    onClick={() => void detectWallets()}
                    className="w-full rounded-xl border border-white/10 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition-all duration-300 hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/20"
                  >
                    Retry Wallet Detection
                  </button>

                  <a
                    href="https://stellar.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300"
                  >
                    What is a wallet? <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}

              {/* Connect State */}
              {status === "connect" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 ring-2 ring-blue-500/40 ring-offset-4 ring-offset-transparent">
                    <Wallet className="h-12 w-12 text-blue-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Connect Wallet</h2>
                  <p className="text-sm text-gray-400">
                    Connect your Stellar wallet to access your decentralized content universe.
                   </p>

                  <button
                    onClick={handleConnect}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-blue-500/50 bg-gradient-to-r from-blue-600 to-cyan-600 px-6 py-4 font-semibold text-white shadow-[0_0_20px_rgba(0,212,255,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.5)] focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    aria-label="Connect Stellar wallet"
                  >
                    <span className="relative z-10">Connect Wallet ({walletCount})</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  </button>
                </div>
              )}

              {/* Connecting State */}
              {status === "connecting" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Connecting...</h2>
                  <p className="text-sm text-gray-400">Please check Freighter</p>
                </div>
              )}

              {/* Sign State */}
              {status === "sign" && address && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-gradient-to-br from-green-500/20 to-blue-500/20 ring-2 ring-green-500/40 ring-offset-4 ring-offset-transparent">
                    <Check className="h-12 w-12 text-green-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Sign to Continue</h2>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm">
                    <p className="mb-2 text-xs uppercase tracking-wider text-gray-400">Connected Address</p>
                    <div className="flex items-center justify-between gap-2">
                      <code className="flex-1 truncate text-sm text-blue-400">{address}</code>
                      <button
                        onClick={copyAddress}
                        className="rounded-lg p-2 text-gray-400 transition-colors hover:bg-white/10 hover:text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                        aria-label="Copy address"
                      >
                        {copiedAddress ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Chain UI removed for simplicity as Freighter connects to Testnet/Futurenet based on extension */}
                  </div>

                  <p className="text-xs text-gray-500">Gasless | This only proves wallet ownership</p>

                  <button
                    onClick={handleSign}
                    className="group/btn relative w-full overflow-hidden rounded-xl border border-green-500/50 bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4 font-semibold text-white shadow-[0_0_20px_rgba(0,255,163,0.3)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,255,163,0.5)] focus:outline-none focus:ring-2 focus:ring-green-500/50"
                  >
                    <span className="relative z-10">Sign Message</span>
                    <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
                  </button>
                </div>
              )}

              {/* Awaiting Signature State */}
              {status === "awaiting-signature" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="h-16 w-16 animate-spin rounded-full border-4 border-green-500/20 border-t-green-500" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Awaiting Signature...</h2>
                  <p className="text-sm text-gray-400">Please sign the message in Freighter</p>
                </div>
              )}

              {/* Verifying State */}
              {status === "verifying" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center">
                    <div className="h-16 w-16 animate-pulse rounded-full bg-gradient-to-br from-blue-500/40 to-purple-500/40" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Verifying...</h2>
                  <p className="text-sm text-gray-400">Confirming your identity</p>
                </div>
              )}

              {/* Error State */}
              {status === "error" && (
                <div className="space-y-6 text-center">
                  <div className="mx-auto mb-6 flex h-24 w-24 items-center justify-center rounded-full bg-red-500/10 ring-2 ring-red-500/40">
                    <AlertCircle className="h-12 w-12 text-red-400" />
                  </div>
                  <h2 className="text-2xl font-semibold text-white">Connection Failed</h2>
                  <p className="text-sm text-gray-400">Please try again</p>
                </div>
              )}

              {/* Status strip at bottom */}
              <div className="mt-8 rounded-lg border border-white/5 bg-white/5 px-4 py-3 text-center backdrop-blur-sm">
                <p className="text-xs text-gray-400">
                  {getStatusText()}
                  {["connecting", "awaiting-signature", "verifying"].includes(status) && (
                    <span className="ml-1 inline-flex gap-1">
                      <span className="animate-pulse">.</span>
                      <span className="animate-pulse delay-100">.</span>
                      <span className="animate-pulse delay-200">.</span>
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* Success State */
          <div className="w-full max-w-md transform text-center transition-all duration-700">
            <div className="relative mx-auto mb-8 h-32 w-32">
              {/* Animated expanding rings */}
              <div
                className="absolute inset-0 animate-ping rounded-full bg-green-500/20"
                style={{ animationDuration: "2s" }}
              />
              <div
                className="absolute inset-4 animate-ping rounded-full bg-green-500/30"
                style={{ animationDuration: "2s", animationDelay: "0.3s" }}
              />
              <div
                className="absolute inset-8 animate-ping rounded-full bg-green-500/40"
                style={{ animationDuration: "2s", animationDelay: "0.6s" }}
              />

              {/* Liquid checkmark */}
              <div className="absolute inset-0 flex items-center justify-center rounded-full bg-gradient-to-br from-green-500/40 to-blue-500/40 backdrop-blur-xl">
                <Check className="h-16 w-16 animate-pulse text-green-400" />
              </div>
            </div>

            <h2 className="mb-4 bg-gradient-to-r from-green-400 to-blue-400 bg-clip-text text-4xl font-bold text-transparent">
              Welcome to DeMedia
            </h2>
            <p className="mb-8 text-gray-400">Authentication successful</p>

            <a
              href="/dashboard"
              className="group/btn relative inline-flex overflow-hidden rounded-xl border border-green-500/50 bg-gradient-to-r from-green-600 to-blue-600 px-8 py-4 font-semibold text-white shadow-[0_0_30px_rgba(0,255,163,0.4)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_60px_rgba(0,255,163,0.6)] focus:outline-none focus:ring-2 focus:ring-green-500/50"
            >
              <span className="relative z-10">Enter Dashboard</span>
              <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-500 group-hover/btn:translate-x-full" />
            </a>
          </div>
        )}
      </div>

      {/* Toast notifications */}
      <div className="fixed right-4 top-4 z-50 space-y-2">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-[slideIn_0.3s_ease-out] rounded-xl border px-6 py-4 shadow-2xl backdrop-blur-2xl ${
              toast.type === "error"
                ? "border-red-500/50 bg-red-500/10 text-red-300"
                : "border-green-500/50 bg-green-500/10 text-green-300"
            }`}
          >
            <p className="text-sm font-medium">{toast.message}</p>
          </div>
        ))}
      </div>
    </div>
  )
}



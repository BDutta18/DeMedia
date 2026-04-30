"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Check, ExternalLink, Heart, Share2 } from "lucide-react"
import { mapWalletError } from "@/lib/errors"
import { cacheGet, cacheSet } from "@/lib/cache"
import { resolveMediaUrl } from "@/lib/media"

interface NFT {
  _id: string
  owner: string
  name: string
  description: string
  imageURL: string
  metadataURL: string
  ipfsHash: string
  tokenId: string
  txHash: string
  createdAt: string
  artistName?: string
}

export default function PostDetail({ postId }: { postId: string }) {
  const [nft, setNft] = useState<NFT | null>(null)
  const [loading, setLoading] = useState(true)
  const [copied, setCopied] = useState(false)
  const [purchaseStatus, setPurchaseStatus] = useState<"idle" | "pending" | "success" | "fail">("idle")
  const [purchaseMessage, setPurchaseMessage] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    const fetchNFT = async () => {
      try {
        const cached = cacheGet<NFT>(`demedia_cache_nft_${postId}`)
        if (cached) {
          setNft(cached)
          setLoading(false)
        }

        const response = await fetch("/api/nfts/all")
        const data = await response.json()

        if (data.success) {
          const found = data.data.find((n: NFT) => n._id === postId)

          if (found) {
            const profileResponse = await fetch(`/api/user/profile/${found.owner}`)
            const profileData = await profileResponse.json()

            const enriched = {
              ...found,
              artistName:
                profileData.success && profileData.user?.name
                  ? profileData.user.name
                  : `${found.owner.slice(0, 6)}...${found.owner.slice(-4)}`,
            }

            setNft(enriched)
            cacheSet(`demedia_cache_nft_${postId}`, enriched, 60_000)
          }
        }
      } catch (error) {
        console.error("Failed to fetch NFT:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [postId])

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const sharePost = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft?.name,
          text: nft?.description,
          url,
        })
      } catch {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const buyNow = async () => {
    if (!nft) return
    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setPurchaseStatus("fail")
      setPurchaseMessage("Please authenticate to purchase this NFT")
      return
    }

    const storedCosignerToken = localStorage.getItem("demedia_cosigner_token")
    const cosignerTokenInput = window.prompt(
      "Enter cosigner JWT token (must be a different authenticated wallet):",
      storedCosignerToken || "",
    )

    const cosignerToken = cosignerTokenInput?.trim()
    if (!cosignerToken) {
      setPurchaseStatus("fail")
      setPurchaseMessage("Cosigner token is required for multisig purchase")
      return
    }

    localStorage.setItem("demedia_cosigner_token", cosignerToken)

    setPurchaseStatus("pending")
    setPurchaseMessage("Submitting purchase transaction...")

    try {
      const response = await fetch("/api/nft/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          "x-cosigner-authorization": `Bearer ${cosignerToken}`,
        },
        body: JSON.stringify({ tokenId: Number(nft.tokenId), priceInXLM: "1" }),
      })

      const data = await response.json()
      if (!response.ok || !data.success) {
        throw new Error(data.message || data.detail || "Purchase failed")
      }

      const txHash = data.txHash as string
      let finalStatus: "pending" | "success" | "fail" = "pending"

      for (let i = 0; i < 15; i += 1) {
        const statusRes = await fetch(`/api/tx/status/${txHash}`)
        const statusData = await statusRes.json()
        finalStatus = statusData.status ?? "pending"
        if (finalStatus !== "pending") break
        await new Promise((resolve) => setTimeout(resolve, 1500))
      }

      if (finalStatus === "success") {
        setPurchaseStatus("success")
        setPurchaseMessage(`Purchase confirmed: ${txHash.slice(0, 10)}...`)
      } else {
        setPurchaseStatus("fail")
        setPurchaseMessage("Purchase transaction failed")
      }
    } catch (error) {
      const mapped = mapWalletError(error)
      setPurchaseStatus("fail")
      setPurchaseMessage(mapped.message)
    }
  }

  if (loading) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center py-16">
        <div className="panel-elevated w-full max-w-md p-8 text-center">
          <div className="mx-auto h-12 w-12 animate-spin rounded-full border-4 border-primary/35 border-t-primary" />
          <p className="mt-4 text-sm text-muted-foreground">Loading post...</p>
        </div>
      </main>
    )
  }

  if (!nft) {
    return (
      <main className="page-shell flex min-h-screen items-center justify-center py-16">
        <div className="panel-elevated w-full max-w-lg p-8 text-center">
          <h1 className="font-[family-name:var(--font-display)] text-3xl font-semibold">Post not found</h1>
          <p className="mt-2 text-sm text-muted-foreground">The requested post may have been removed or has an invalid URL.</p>
          <button
            onClick={() => router.push("/gallery")}
            className="mt-6 inline-flex items-center rounded-xl bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground"
          >
            Back to gallery
          </button>
        </div>
      </main>
    )
  }

  return (
    <main className="page-shell min-h-screen py-8 sm:py-10">
      <button
        onClick={() => router.back()}
        className="mb-5 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        Back
      </button>

      <div className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <section className="panel-elevated p-4 sm:p-5">
          <div className="overflow-hidden rounded-2xl border border-border/70">
            <img
              src={resolveMediaUrl(nft.imageURL)}
              alt={nft.name}
              className="aspect-square w-full object-cover"
              onError={(e) => {
                e.currentTarget.src = "/placeholder.svg"
              }}
            />
          </div>

          <div className="mt-4 grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
            <button
              onClick={buyNow}
              disabled={purchaseStatus === "pending"}
              className="inline-flex items-center justify-center rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground disabled:opacity-70"
            >
              {purchaseStatus === "pending" ? "Buying..." : "Buy for 1 XLM"}
            </button>

            <button
              onClick={sharePost}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold"
            >
              {copied ? <Check className="h-4 w-4" /> : <Share2 className="h-4 w-4" />}
              {copied ? "Copied" : "Share"}
            </button>

            <button className="inline-flex items-center justify-center rounded-xl border border-border/80 bg-card px-4 py-3 text-sm font-semibold">
              <Heart className="h-4 w-4" />
            </button>
          </div>

          {purchaseMessage && (
            <p
              className={`mt-3 text-sm ${
                purchaseStatus === "success"
                  ? "text-green-400"
                  : purchaseStatus === "fail"
                    ? "text-red-400"
                    : "text-yellow-300"
              }`}
            >
              {purchaseMessage}
            </p>
          )}
        </section>

        <section className="space-y-5">
          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Post</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">{nft.name}</h1>
            <p className="mt-4 text-sm leading-relaxed text-muted-foreground sm:text-base">{nft.description}</p>
          </div>

          <div className="panel p-6">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Creator</p>
            <div className="mt-3 flex items-center justify-between gap-4">
              <div>
                <p className="text-lg font-semibold">{nft.artistName}</p>
                <p className="mt-1 font-mono text-xs text-muted-foreground">{`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}</p>
              </div>
              <button
                onClick={() => router.push(`/profile/${nft.owner}`)}
                className="inline-flex rounded-xl border border-border/80 bg-card px-4 py-2 text-sm font-semibold hover:bg-secondary"
              >
                View profile
              </button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="panel p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Created</p>
              <p className="mt-2 text-sm font-medium">
                {new Date(nft.createdAt).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </p>
            </div>
            <div className="panel p-5">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Token ID</p>
              <p className="mt-2 font-mono text-sm">#{nft.tokenId}</p>
            </div>
          </div>

          <div className="panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">IPFS Metadata</p>
            <a href={nft.metadataURL} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex items-center gap-2 text-sm text-primary hover:underline">
              {nft.ipfsHash.slice(0, 28)}...
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>

          <div className="panel p-5">
            <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Transaction</p>
            <a
              href={`https://stellar.expert/explorer/testnet/tx/${nft.txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-2 font-mono text-sm text-primary hover:underline"
            >
              {nft.txHash.slice(0, 20)}...{nft.txHash.slice(-8)}
              <ExternalLink className="h-4 w-4" />
            </a>
          </div>
        </section>
      </div>
    </main>
  )
}

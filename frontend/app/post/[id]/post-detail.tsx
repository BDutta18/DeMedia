"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { ExternalLink, Share2, Heart, ArrowLeft, Check } from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
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

        console.log("[v0] Fetching NFT with ID:", postId)
        const response = await fetch("/api/nfts/all")
        const data = await response.json()
        console.log("[v0] All NFTs response:", data)

        if (data.success) {
          const found = data.data.find((n: NFT) => n._id === postId)
          console.log("[v0] Found NFT:", found)

          if (found) {
            // Fetch artist name
            const profileResponse = await fetch(`/api/user/profile/${found.owner}`)
            const profileData = await profileResponse.json()
            console.log("[v0] Profile data:", profileData)

            setNft({
              ...found,
              artistName:
                profileData.success && profileData.user?.name
                  ? profileData.user.name
                  : `${found.owner.slice(0, 6)}...${found.owner.slice(-4)}`,
            })

            cacheSet(
              `demedia_cache_nft_${postId}`,
              {
                ...found,
                artistName:
                  profileData.success && profileData.user?.name
                    ? profileData.user.name
                    : `${found.owner.slice(0, 6)}...${found.owner.slice(-4)}`,
              },
              60_000,
            )
          } else {
            console.log("[v0] NFT not found with ID:", postId)
          }
        }
      } catch (error) {
        console.error("[v0] Failed to fetch NFT:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFT()
  }, [postId])

  const sharePost = async () => {
    const url = window.location.href
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft?.name,
          text: nft?.description,
          url: url,
        })
      } catch (error) {
        copyToClipboard(url)
      }
    } else {
      copyToClipboard(url)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const buyNow = async () => {
    if (!nft) return
    const token = localStorage.getItem("demedia_token")
    if (!token) {
      setPurchaseStatus("fail")
      setPurchaseMessage("Please authenticate to purchase this NFT")
      return
    }

    setPurchaseStatus("pending")
    setPurchaseMessage("Submitting purchase transaction...")

    try {
      const response = await fetch("/api/nft/buy", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          tokenId: Number(nft.tokenId),
          priceInXLM: "1",
        }),
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
      <>
        <ParallaxOrbBackground />
        <FuturisticNavbar />
        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Loading NFT...</p>
          </div>
        </main>
      </>
    )
  }

  if (!nft) {
    return (
      <>
        <ParallaxOrbBackground />
        <FuturisticNavbar />
        <main className="relative min-h-screen flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-4xl font-bold text-white mb-4">Post Not Found</h1>
            <button
              onClick={() => router.push("/gallery")}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform"
            >
              Back to Gallery
            </button>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <ParallaxOrbBackground />
      <FuturisticNavbar />

      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-6xl mx-auto">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white transition-colors mb-8"
          >
            <ArrowLeft className="w-5 h-5" />
            Back
          </button>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Image Section */}
            <div className="relative">
              <div className="sticky top-32">
                <div className="relative aspect-square rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                  <img
                    src={resolveMediaUrl(nft.imageURL)}
                    alt={nft.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>

                {/* Action Buttons */}
                <div className="flex gap-4 mt-6">
                  <button
                    onClick={buyNow}
                    disabled={purchaseStatus === "pending"}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-green-600 to-cyan-600 text-white font-semibold hover:scale-105 transition-transform disabled:opacity-70"
                  >
                    {purchaseStatus === "pending" ? "Buying..." : "Buy (1 XLM)"}
                  </button>
                  <button
                    onClick={sharePost}
                    className="flex-1 flex items-center justify-center gap-2 px-6 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform"
                  >
                    {copied ? <Check className="w-5 h-5" /> : <Share2 className="w-5 h-5" />}
                    {copied ? "Copied!" : "Share"}
                  </button>
                  <button className="px-6 py-4 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all">
                    <Heart className="w-5 h-5" />
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
              </div>
            </div>

            {/* Details Section */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl sm:text-5xl font-black text-white mb-4">{nft.name}</h1>
                <p className="text-lg text-gray-400 leading-relaxed">{nft.description}</p>
              </div>

              {/* Artist Info */}
              <div className="glass rounded-2xl p-6">
                <p className="text-sm text-gray-500 mb-2">Created by</p>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-xl font-bold text-white">
                      {nft.artistName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-white">{nft.artistName}</h3>
                      <p className="text-sm text-gray-500 font-mono">{`${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => router.push(`/profile/${nft.owner}`)}
                    className="px-6 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all"
                  >
                    View Profile
                  </button>
                </div>
              </div>

              {/* NFT Details */}
              <div className="space-y-4">
                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-2">Created</p>
                  <p className="text-white font-semibold">
                    {new Date(nft.createdAt).toLocaleDateString("en-US", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>

                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-2">IPFS Hash</p>
                  <a
                    href={nft.metadataURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 font-mono text-sm hover:underline flex items-center gap-2"
                  >
                    {nft.ipfsHash.slice(0, 20)}...
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>

                <div className="glass rounded-2xl p-6">
                  <p className="text-sm text-gray-500 mb-2">Transaction Hash</p>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${nft.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 font-mono text-sm hover:underline flex items-center gap-2"
                  >
                    {nft.txHash.slice(0, 20)}...
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </>
  )
}

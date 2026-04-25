"use client"

import type React from "react"
import { useRouter } from "next/navigation"

import { useState, useEffect, useRef } from "react"
import { ExternalLink, Heart, Share2 } from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
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

export default function GalleryPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const cardsRef = useRef<(HTMLDivElement | null)[]>([])
  const router = useRouter()

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        console.log("[v0] Fetching NFTs from /api/nfts/all")
        const response = await fetch("/api/nfts/all")
        const data = await response.json()
        console.log("[v0] NFTs response:", data)

        if (data.success) {
          const nftsWithArtists = await Promise.all(
            data.data.map(async (nft: NFT) => {
              try {
                console.log(`[v0] Fetching profile for owner: ${nft.owner}`)
                const profileResponse = await fetch(`/api/user/profile/${nft.owner}`)
                const profileData = await profileResponse.json()
                console.log(`[v0] Profile data for ${nft.owner}:`, profileData)

                // Check if we got a valid user with a name
                const artistName =
                  profileData.success && profileData.user?.name
                    ? profileData.user.name
                    : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`

                console.log(`[v0] Artist name for ${nft.owner}: ${artistName}`)

                return {
                  ...nft,
                  artistName,
                }
              } catch (error) {
                console.error(`[v0] Error fetching profile for ${nft.owner}:`, error)
                return {
                  ...nft,
                  artistName: `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`,
                }
              }
            }),
          )
          console.log("[v0] NFTs with artist names:", nftsWithArtists)
          setNfts(nftsWithArtists)
        }
      } catch (error) {
        console.error("[v0] Failed to fetch NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [])

  // Intersection Observer for entrance animations
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, index) => {
          if (entry.isIntersecting) {
            entry.target.setAttribute("data-in", "true")
          } else {
            entry.target.removeAttribute("data-in")
          }
        })
      },
      { threshold: 0.1 },
    )

    cardsRef.current.forEach((card) => {
      if (card) observer.observe(card)
    })

    return () => observer.disconnect()
  }, [nfts])

  // 3D tilt effect on hover
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>, index: number) => {
    const card = cardsRef.current[index]
    if (!card) return

    const rect = card.getBoundingClientRect()
    const x = e.clientX - rect.left
    const y = e.clientY - rect.top

    const centerX = rect.width / 2
    const centerY = rect.height / 2

    const rotateX = ((y - centerY) / centerY) * 10
    const rotateY = ((x - centerX) / centerX) * 10

    card.style.transform = `perspective(1000px) rotateX(${-rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`
  }

  const handleMouseLeave = (index: number) => {
    const card = cardsRef.current[index]
    if (!card) return
    card.style.transform = "perspective(1000px) rotateX(0) rotateY(0) translateZ(0)"
  }

  const sharePost = async (nft: NFT) => {
    const url = `${window.location.origin}/post/${nft._id}`
    if (navigator.share) {
      try {
        await navigator.share({
          title: nft.name,
          text: nft.description,
          url: url,
        })
      } catch (error) {
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  return (
    <>
      <ParallaxOrbBackground />

      <FuturisticNavbar />

      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl sm:text-6xl md:text-7xl font-black tracking-wider mb-4 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Liquid Parallax Gallery
            </h1>
            <p className="text-gray-400 text-lg">Collect the light. Walk the archive.</p>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-20">
              <div className="inline-block h-16 w-16 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              <p className="mt-4">Loading NFTs...</p>
            </div>
          ) : (
            <div
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8"
              style={{ perspective: "1000px", transformStyle: "preserve-3d" }}
            >
              {nfts.map((nft, index) => (
                <div
                  key={nft._id}
                  ref={(el) => {
                    cardsRef.current[index] = el
                  }}
                  className="group relative opacity-0 translate-y-6 transition-all duration-700 data-[in=true]:opacity-100 data-[in=true]:translate-y-0"
                  style={{
                    transitionDelay: `${index * 100}ms`,
                    animation: `float ${6 + (index % 3)}s ease-in-out infinite`,
                    animationDelay: `${index * 0.5}s`,
                  }}
                  onMouseMove={(e) => handleMouseMove(e, index)}
                  onMouseLeave={() => handleMouseLeave(index)}
                >
                  {/* Magnetic hover glow */}
                  <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/20 via-purple-500/20 to-cyan-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />

                  {/* Glass card */}
                  <div
                    className="relative rounded-3xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl shadow-[0_20px_40px_rgba(0,0,0,0.45)] transition-all duration-300 hover:shadow-[0_30px_60px_rgba(0,0,0,0.6)] cursor-pointer"
                    onClick={() => setSelectedNFT(nft)}
                  >
                    {/* Gradient accent ring on hover */}
                    <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-blue-400 via-purple-500 to-blue-400 blur-sm" />

                    {/* Inner content */}
                    <div className="relative">
                      {/* Image */}
                      <div className="relative aspect-square rounded-2xl overflow-hidden mb-4 shadow-2xl">
                        <img
                          src={resolveMediaUrl(nft.imageURL)}
                          alt={nft.name}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      </div>

                      {/* Metadata */}
                      <div className="space-y-2 mb-4">
                        <h3 className="text-xl font-bold text-white truncate">{nft.name}</h3>
                        <p className="text-sm text-gray-400 line-clamp-2">{nft.description}</p>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-500 uppercase">Artist</span>
                            <span className="text-sm text-white font-semibold">{nft.artistName}</span>
                          </div>
                          <div className="flex flex-col items-end">
                            <span className="text-xs text-gray-500 uppercase">Token</span>
                            <span className="text-sm text-blue-400 font-mono">#{nft.tokenId}</span>
                          </div>
                        </div>
                      </div>

                      {/* CTA buttons */}
                      <div className="flex gap-2">
                        <button
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 text-sm hover:bg-blue-500/20 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            router.push(`/post/${nft._id}`)
                          }}
                        >
                          <ExternalLink className="w-4 h-4" />
                          View
                        </button>
                        <button
                          className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-pink-400 hover:bg-pink-500/10 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                          }}
                        >
                          <Heart className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-blue-400 hover:bg-blue-500/10 transition-all"
                          onClick={(e) => {
                            e.stopPropagation()
                            sharePost(nft)
                          }}
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Detail Modal */}
      {selectedNFT && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xl animate-in fade-in duration-300"
          onClick={() => setSelectedNFT(null)}
        >
          <div
            className="relative max-w-5xl w-full rounded-3xl border border-white/10 bg-black/60 backdrop-blur-2xl p-8 shadow-2xl animate-in zoom-in-95 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={() => setSelectedNFT(null)}
              className="absolute top-4 right-4 w-10 h-10 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
            >
              ✕
            </button>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden shadow-2xl">
                <img
                  src={resolveMediaUrl(selectedNFT.imageURL)}
                  alt={selectedNFT.name}
                  className="w-full h-full object-cover"
                  style={{ animation: "subtle-rotate 20s linear infinite" }}
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
              </div>

              {/* Details */}
              <div className="space-y-6">
                <div>
                  <h2 className="text-3xl font-bold text-white mb-2">{selectedNFT.name}</h2>
                  <p className="text-gray-400">{selectedNFT.description}</p>
                </div>

                <div className="space-y-3">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Artist</p>
                    <p className="text-white font-semibold text-lg">{selectedNFT.artistName}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Token ID</p>
                    <p className="text-blue-400 font-mono text-sm">#{selectedNFT.tokenId}</p>
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="text-xs text-gray-500 uppercase mb-1">Transaction</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${selectedNFT.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 font-mono text-sm hover:underline flex items-center gap-2"
                    >
                      {selectedNFT.txHash.slice(0, 10)}...{selectedNFT.txHash.slice(-8)}
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                <button className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold hover:scale-105 transition-transform">
                  View on Marketplace
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

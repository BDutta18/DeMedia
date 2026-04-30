"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, Filter, FileText, ImageIcon, Clock, TrendingUp, ExternalLink, Share2 } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
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
  updatedAt: string
}

type MediaKind = "image" | "video" | "audio" | "document"

export default function ContentLibraryPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [hoveredNode, setHoveredNode] = useState<number | null>(null)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [viewMode, setViewMode] = useState<"spatial" | "timeline">("spatial")
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const [mediaKindById, setMediaKindById] = useState<Record<string, MediaKind>>({})

  const inferMediaKind = (url: string): MediaKind => {
    const value = url.toLowerCase()
    if (value.includes(".mp4") || value.includes(".webm") || value.includes(".mov") || value.includes(".mkv")) return "video"
    if (value.includes(".mp3") || value.includes(".wav") || value.includes(".ogg") || value.includes(".m4a")) return "audio"
    if (value.includes(".pdf") || value.includes(".doc") || value.includes(".docx") || value.includes(".txt")) return "document"
    return "image"
  }

  const renderNftMedia = (nft: NFT, compact = false) => {
    const mediaUrl = resolveMediaUrl(nft.imageURL)
    const mediaKind = mediaKindById[nft._id] || inferMediaKind(mediaUrl)

    if (mediaKind === "document") {
      return (
        <div className="w-full h-full bg-slate-950/80 flex flex-col items-center justify-center gap-2 p-3">
          <FileText className={compact ? "w-6 h-6 text-blue-400" : "w-10 h-10 text-blue-400"} />
          {!compact && <span className="text-xs text-gray-300">Document uploaded</span>}
        </div>
      )
    }

    if (mediaKind === "video") {
      return <video src={mediaUrl} className="w-full h-full object-cover" muted playsInline controls={!compact} />
    }

    if (mediaKind === "audio") {
      return (
        <div className="w-full h-full bg-slate-950/80 flex items-center justify-center p-3">
          <FileText className={compact ? "w-6 h-6 text-blue-400" : "w-10 h-10 text-blue-400"} />
        </div>
      )
    }

    return (
      <img
        src={mediaUrl}
        alt={nft.name}
        className="w-full h-full object-cover"
        onError={(e) => {
          if (mediaKindById[nft._id] !== "document") {
            setMediaKindById((prev) => ({ ...prev, [nft._id]: "document" }))
            return
          }
          e.currentTarget.src = "/placeholder.svg"
        }}
      />
    )
  }

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const fetchMyNFTs = async () => {
      try {
        setLoading(true)
        const cached = cacheGet<NFT[]>("demedia_cache_my_nfts")
        if (cached) {
          setNfts(cached)
          setLoading(false)
        }
        const token = localStorage.getItem("demedia_token")
        if (!token) {
          router.push("/auth")
          return
        }

        const response = await fetch("/api/nfts/my-nfts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        const data = await response.json()

        console.log("[v0] My NFTs response:", data)

        if (data.success) {
          const next = data.data || []
          setNfts(next)
          cacheSet("demedia_cache_my_nfts", next, 60_000)
        }
      } catch (error) {
        console.error("[v0] Error fetching NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    if (isAuthenticated) {
      fetchMyNFTs()
    }
  }, [isAuthenticated])

  const filteredNfts = nfts.filter(
    (nft) =>
      nft.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      nft.description.toLowerCase().includes(searchQuery.toLowerCase()),
  )

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

  if (loading) {
    return (
      <>
        <div className="fixed inset-0 bg-[#0a0a0f]" />        <main className="relative min-h-screen pt-32 flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="text-gray-400 text-lg">Loading your creations...</p>
          </div>
        </main>
      </>
    )
  }

  return (
    <>
      <div
        className="fixed inset-0 bg-[#0a0a0f] overflow-hidden"
        onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}
      >
        <div
          className="absolute w-[600px] h-[600px] rounded-full opacity-15 blur-3xl transition-all duration-500 pointer-events-none"
          style={{
            background: "radial-gradient(circle, #3b82f6 0%, transparent 70%)",
            left: mousePosition.x - 300,
            top: mousePosition.y - 300,
          }}
        />

        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className="absolute h-px opacity-10 animate-float"
            style={{
              width: "200%",
              left: "-50%",
              top: `${(i / 8) * 100}%`,
              background: `linear-gradient(90deg, transparent 0%, ${i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#b624ff" : "#00ffa3"} 50%, transparent 100%)`,
              animationDelay: `${i * 0.5}s`,
              animationDuration: `${15 + i * 2}s`,
            }}
          />
        ))}

        {[...Array(60)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full opacity-30 animate-float"
            style={{
              width: Math.random() * 3 + 1 + "px",
              height: Math.random() * 3 + 1 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: i % 4 === 0 ? "#3b82f6" : i % 4 === 1 ? "#b624ff" : i % 4 === 2 ? "#00ffa3" : "#fbbf24",
              animationDelay: Math.random() * 10 + "s",
              animationDuration: Math.random() * 25 + 20 + "s",
              filter: "blur(1px)",
            }}
          />
        ))}

        <div
          className="absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(circle at 20% 80%, #3b82f620 0%, transparent 50%), radial-gradient(circle at 80% 20%, #b624ff20 0%, transparent 50%)",
            animation: "gradient-shift 20s ease infinite",
          }}
        />
      </div>
      <main className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12 sm:mb-16">
            <h1
              className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-wider mb-4 animate-glow-pulse"
              style={{
                letterSpacing: "0.1em",
                background: "linear-gradient(135deg, #3b82f6 0%, #b624ff 50%, #00ffa3 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradient-shift 8s ease infinite",
              }}
            >
              LIVING ARCHIVE
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-400 font-light">
              Your digital creations, alive in the metaverse
            </p>
            <p className="text-sm text-gray-500 mt-2">
              {nfts.length} {nfts.length === 1 ? "creation" : "creations"} minted
            </p>
          </div>

          <div className="mb-12 max-w-3xl mx-auto">
            <div
              className="relative group"
              style={{
                transform: hoveredNode !== null ? "scale(0.98)" : "scale(1)",
                transition: "transform 0.5s ease",
              }}
            >
              <div
                className="relative rounded-full p-1 overflow-hidden transition-all duration-500"
                style={{
                  background: "linear-gradient(135deg, rgba(59, 130, 246, 0.3) 0%, rgba(182, 36, 255, 0.3) 100%)",
                  boxShadow: "0 10px 60px rgba(59, 130, 246, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.3)",
                }}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-[#3b82f6] via-[#b624ff] to-[#00ffa3] opacity-50 animate-spin-slow" />

                <div
                  className="relative flex items-center gap-4 px-6 py-4 rounded-full"
                  style={{
                    background: "linear-gradient(135deg, rgba(10, 10, 15, 0.95) 0%, rgba(18, 18, 26, 0.95) 100%)",
                    backdropFilter: "blur(40px)",
                  }}
                >
                  <Search className="w-6 h-6 text-[#3b82f6] animate-pulse" />
                  <input
                    type="text"
                    placeholder="Search your universe..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="flex-1 bg-transparent text-white placeholder-gray-500 outline-none text-lg"
                  />
                  <button
                    className="p-3 rounded-full transition-all duration-300 hover:scale-110 hover:rotate-180"
                    style={{
                      background: "linear-gradient(135deg, #3b82f6 0%, #b624ff 100%)",
                      boxShadow: "0 5px 20px rgba(59, 130, 246, 0.4)",
                    }}
                  >
                    <Filter className="w-5 h-5 text-white" />
                  </button>
                </div>
              </div>

              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-[#3b82f6] opacity-0 group-hover:opacity-100 animate-ping"
                  style={{
                    animationDelay: `${i * 0.3}s`,
                    animationDuration: "2s",
                  }}
                />
              ))}
            </div>
          </div>

          <div className="flex justify-center gap-4 mb-12">
            <button
              onClick={() => setViewMode("spatial")}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-500 ${
                viewMode === "spatial" ? "scale-110" : "scale-100 opacity-60"
              }`}
              style={{
                background:
                  viewMode === "spatial"
                    ? "linear-gradient(135deg, #3b82f6 0%, #0284c7 100%)"
                    : "rgba(59, 130, 246, 0.1)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${viewMode === "spatial" ? "#3b82f6" : "rgba(59, 130, 246, 0.3)"}`,
                boxShadow: viewMode === "spatial" ? "0 10px 40px rgba(59, 130, 246, 0.4)" : "none",
                color: "white",
              }}
            >
              Spatial Grid
            </button>
            <button
              onClick={() => setViewMode("timeline")}
              className={`px-8 py-3 rounded-2xl font-semibold transition-all duration-500 ${
                viewMode === "timeline" ? "scale-110" : "scale-100 opacity-60"
              }`}
              style={{
                background:
                  viewMode === "timeline"
                    ? "linear-gradient(135deg, #b624ff 0%, #dc2626 100%)"
                    : "rgba(182, 36, 255, 0.1)",
                backdropFilter: "blur(20px)",
                border: `2px solid ${viewMode === "timeline" ? "#b624ff" : "rgba(182, 36, 255, 0.3)"}`,
                boxShadow: viewMode === "timeline" ? "0 10px 40px rgba(182, 36, 255, 0.4)" : "none",
                color: "white",
              }}
            >
              Timescape
            </button>
          </div>

          {filteredNfts.length === 0 && (
            <div className="text-center py-20">
              <div className="w-32 h-32 mx-auto mb-6 rounded-full bg-gradient-to-br from-[#3b82f6]/20 to-[#b624ff]/20 flex items-center justify-center">
                <ImageIcon className="w-16 h-16 text-gray-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-400 mb-2">
                {searchQuery ? "No results found" : "No creations yet"}
              </h3>
              <p className="text-gray-500 mb-6">
                {searchQuery ? "Try a different search term" : "Start creating your first NFT"}
              </p>
              {!searchQuery && (
                <button
                  onClick={() => router.push("/upload")}
                  className="px-8 py-3 rounded-2xl font-semibold transition-all duration-300 hover:scale-110"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #b624ff 100%)",
                    boxShadow: "0 10px 40px rgba(59, 130, 246, 0.4)",
                    color: "white",
                  }}
                >
                  Create Your First NFT
                </button>
              )}
            </div>
          )}

          {viewMode === "spatial" && filteredNfts.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 sm:gap-12">
              {filteredNfts.map((nft, i) => {
                const color = ["#3b82f6", "#b624ff", "#00ffa3", "#fbbf24", "#dc2626"][i % 5]
                return (
                  <div
                    key={nft._id}
                    className="group relative"
                    onMouseEnter={() => setHoveredNode(i)}
                    onMouseLeave={() => setHoveredNode(null)}
                    style={{
                      transform:
                        hoveredNode === i
                          ? "translateZ(80px) scale(1.08) translateY(-20px)"
                          : hoveredNode !== null
                            ? `translateZ(${-30 + i * 10}px) scale(0.95)`
                            : "translateZ(0px)",
                      transition: "transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      transformStyle: "preserve-3d",
                    }}
                  >
                    <div
                      className="relative rounded-3xl overflow-hidden cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${color}15 0%, rgba(10, 10, 15, 0.95) 100%)`,
                        backdropFilter: "blur(60px)",
                        border: `2px solid ${hoveredNode === i ? color + "80" : color + "20"}`,
                        boxShadow:
                          hoveredNode === i
                            ? `0 40px 120px rgba(0, 0, 0, 0.9), 0 0 80px ${color}60, inset 0 2px 20px rgba(255, 255, 255, 0.05)`
                            : "0 20px 60px rgba(0, 0, 0, 0.8), inset 0 2px 10px rgba(255, 255, 255, 0.02)",
                        transform: hoveredNode === i ? "rotateX(5deg) rotateY(-5deg)" : "rotateX(0deg) rotateY(0deg)",
                        transition: "all 0.6s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <div
                        className="relative h-56 overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${color}30 0%, ${color}10 100%)`,
                        }}
                      >
                        <div className="w-full h-full transition-transform duration-700 group-hover:scale-110">
                          {renderNftMedia(nft)}
                        </div>

                        <div
                          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
                          style={{
                            background: `linear-gradient(135deg, ${color}20 0%, transparent 100%)`,
                          }}
                        />

                        <div
                          className="absolute top-4 left-4 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl"
                          style={{
                            background: `${color}30`,
                            border: `1px solid ${color}`,
                            color: color,
                            boxShadow: `0 5px 20px ${color}40`,
                          }}
                        >
                          NFT
                        </div>

                        <div
                          className="absolute top-4 right-4 px-4 py-1.5 rounded-full text-xs font-bold backdrop-blur-xl"
                          style={{
                            background: `${color}30`,
                            border: `1px solid ${color}`,
                            color: color,
                          }}
                        >
                          Minted
                        </div>
                      </div>

                      <div className="p-6 space-y-4">
                        <h3
                          className="text-xl font-bold text-white line-clamp-2 mb-3"
                          style={{
                            textShadow: `0 0 20px ${color}40`,
                          }}
                        >
                          {nft.name}
                        </h3>

                        <p className="text-sm text-gray-400 line-clamp-2 mb-4">{nft.description}</p>

                        <div className="flex items-center justify-between text-sm">
                          <div>
                            <div className="text-gray-500 text-xs mb-1">Token ID</div>
                            <div
                              className="font-mono font-bold text-lg"
                              style={{
                                color: color,
                                textShadow: `0 0 10px ${color}60`,
                              }}
                            >
                              #{nft.tokenId}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-gray-500 text-xs mb-1">IPFS</div>
                            <a
                              href={nft.metadataURL}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="font-mono text-sm hover:underline"
                              style={{ color: color }}
                            >
                              View
                            </a>
                          </div>
                        </div>

                        <div
                          className="flex items-center justify-between pt-3 border-t text-sm"
                          style={{ borderColor: `${color}20` }}
                        >
                          <div className="flex items-center gap-2 text-gray-400">
                            <Clock className="w-4 h-4" />
                            <span>{new Date(nft.createdAt).toLocaleDateString()}</span>
                          </div>
                          <a
                            href={`https://stellar.expert/explorer/testnet/tx/${nft.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 hover:underline"
                            style={{ color: color }}
                          >
                            <ExternalLink className="w-3 h-3" />
                            <span className="text-xs">Stellar Expert</span>
                          </a>
                        </div>
                      </div>

                      <div
                        className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none blur-3xl -z-10"
                        style={{ background: color }}
                      />
                    </div>

                    {hoveredNode === i && (
                      <>
                        {[
                          { icon: ExternalLink, angle: 0, label: "View on IPFS", url: nft.imageURL },
                          { icon: Share2, angle: 90, label: "Share", action: () => sharePost(nft) },
                          { icon: FileText, angle: 180, label: "Metadata", url: nft.metadataURL },
                          {
                            icon: TrendingUp,
                            angle: 270,
                            label: "Transaction",
                            url: `https://stellar.expert/explorer/testnet/tx/${nft.txHash}`,
                          },
                        ].map((action, idx) => {
                          const radius = 120
                          const angleRad = (action.angle * Math.PI) / 180
                          return (
                            <button
                              key={idx}
                              onClick={() => (action.action ? action.action() : window.open(action.url, "_blank"))}
                              className="absolute w-12 h-12 rounded-full flex items-center justify-center backdrop-blur-xl transition-all duration-500 hover:scale-125 animate-fade-in"
                              style={{
                                background: `linear-gradient(135deg, ${color}40 0%, rgba(10, 10, 15, 0.9) 100%)`,
                                border: `2px solid ${color}`,
                                boxShadow: `0 10px 30px ${color}40`,
                                top: `calc(50% + ${Math.sin(angleRad) * radius}px)`,
                                left: `calc(50% + ${Math.cos(angleRad) * radius}px)`,
                                transform: "translate(-50%, -50%)",
                                color: color,
                                animationDelay: `${idx * 0.1}s`,
                              }}
                              title={action.label}
                            >
                              <action.icon className="w-5 h-5" />
                            </button>
                          )
                        })}
                      </>
                    )}
                  </div>
                )
              })}
            </div>
          )}

          {viewMode === "timeline" && filteredNfts.length > 0 && (
            <div className="relative">
              <div
                className="absolute top-1/2 left-0 right-0 h-1 -translate-y-1/2"
                style={{
                  background: "linear-gradient(90deg, #3b82f6 0%, #b624ff 50%, #dc2626 100%)",
                  boxShadow: "0 0 30px rgba(59, 130, 246, 0.5)",
                  borderRadius: "50%",
                }}
              />

              <div className="flex items-center gap-16 overflow-x-auto pb-8 scrollbar-hide">
                {filteredNfts.map((nft, i) => {
                  const color = ["#3b82f6", "#b624ff", "#00ffa3", "#fbbf24", "#dc2626"][i % 5]
                  return (
                    <div
                      key={nft._id}
                      className="relative flex-shrink-0 w-80 group"
                      onMouseEnter={() => setHoveredNode(i)}
                      onMouseLeave={() => setHoveredNode(null)}
                      style={{
                        transform: hoveredNode === i ? "translateY(-40px) scale(1.1)" : "translateY(0) scale(1)",
                        transition: "transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)",
                      }}
                    >
                      <div
                        className="absolute -top-8 left-1/2 -translate-x-1/2 w-16 h-16 rounded-full flex items-center justify-center animate-pulse overflow-hidden"
                        style={{
                          background: `linear-gradient(135deg, ${color} 0%, ${color}80 100%)`,
                          boxShadow: `0 0 40px ${color}, 0 10px 30px rgba(0, 0, 0, 0.5)`,
                          border: `3px solid ${color}`,
                        }}
                      >
                        {renderNftMedia(nft, true)}
                      </div>

                      <div
                        className="mt-12 rounded-3xl p-6 cursor-pointer"
                        style={{
                          background: `linear-gradient(135deg, ${color}15 0%, rgba(10, 10, 15, 0.95) 100%)`,
                          backdropFilter: "blur(40px)",
                          border: `2px solid ${color}40`,
                          boxShadow:
                            hoveredNode === i
                              ? `0 30px 80px rgba(0, 0, 0, 0.9), 0 0 60px ${color}60`
                              : "0 20px 60px rgba(0, 0, 0, 0.7)",
                        }}
                      >
                        <h3 className="text-lg font-bold text-white mb-2 line-clamp-1">{nft.name}</h3>
                        <div className="text-sm text-gray-400 mb-3 line-clamp-2">{nft.description}</div>
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm" style={{ color: color }}>
                            #{nft.tokenId}
                          </span>
                          <a
                            href={nft.metadataURL}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-bold text-sm hover:underline"
                            style={{ color: color }}
                          >
                            IPFS →
                          </a>
                        </div>
                        <div className="mt-3 text-xs text-gray-500 flex items-center gap-2">
                          <Clock className="w-3 h-3" />
                          {new Date(nft.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}



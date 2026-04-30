"use client"

import { useRouter } from "next/navigation"
import { useEffect, useMemo, useState } from "react"
import { ArrowRight, ExternalLink, FileText, Search, Share2, SlidersHorizontal, X } from "lucide-react"
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

type MediaKind = "image" | "video" | "audio" | "document"

export default function GalleryPage() {
  const [nfts, setNfts] = useState<NFT[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedNFT, setSelectedNFT] = useState<NFT | null>(null)
  const [mediaKindById, setMediaKindById] = useState<Record<string, MediaKind>>({})
  const [query, setQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name" | "tokenAsc" | "tokenDesc" | "creator">("newest")
  const router = useRouter()
  const totalAssets = nfts.length
  const totalCreators = useMemo(() => new Set(nfts.map((nft) => nft.owner)).size, [nfts])
  const latestMintedLabel = useMemo(() => {
    if (!nfts.length) return "N/A"
    const latestTs = Math.max(...nfts.map((nft) => new Date(nft.createdAt).getTime()))
    return new Date(latestTs).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" })
  }, [nfts])

  useEffect(() => {
    const fetchNFTs = async () => {
      try {
        const response = await fetch("/api/nfts/all")
        const data = await response.json()

        if (data.success) {
          const nftsWithArtists = await Promise.all(
            data.data.map(async (nft: NFT) => {
              try {
                const profileResponse = await fetch(`/api/user/profile/${nft.owner}`)
                const profileData = await profileResponse.json()
                const artistName =
                  profileData.success && profileData.user?.name
                    ? profileData.user.name
                    : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`

                return { ...nft, artistName }
              } catch {
                return {
                  ...nft,
                  artistName: `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`,
                }
              }
            }),
          )
          setNfts(nftsWithArtists)
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchNFTs()
  }, [])

  useEffect(() => {
    const inferFromUrl = (url: string): MediaKind => {
      const value = url.toLowerCase()
      if (value.includes(".mp4") || value.includes(".webm") || value.includes(".mov") || value.includes(".mkv")) return "video"
      if (value.includes(".mp3") || value.includes(".wav") || value.includes(".ogg") || value.includes(".m4a")) return "audio"
      if (value.includes(".pdf") || value.includes(".doc") || value.includes(".docx") || value.includes(".txt")) return "document"
      return "image"
    }

    const detectMediaKinds = async () => {
      if (!nfts.length) return
      const entries = nfts.map((nft) => [nft._id, inferFromUrl(resolveMediaUrl(nft.imageURL))] as const)
      setMediaKindById(Object.fromEntries(entries))
    }

    detectMediaKinds()
  }, [nfts])

  const filteredNFTs = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    const filtered = nfts.filter((nft) => {
      if (!normalized) return true
      return (
        nft.name.toLowerCase().includes(normalized) ||
        nft.description.toLowerCase().includes(normalized) ||
        (nft.artistName || "").toLowerCase().includes(normalized)
      )
    })

    filtered.sort((a, b) => {
      if (sortBy === "creator") return (a.artistName || "").localeCompare(b.artistName || "")
      if (sortBy === "name") return a.name.localeCompare(b.name)
      if (sortBy === "tokenAsc") return Number(a.tokenId) - Number(b.tokenId)
      if (sortBy === "tokenDesc") return Number(b.tokenId) - Number(a.tokenId)
      if (sortBy === "oldest") return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    })

    return filtered
  }, [nfts, query, sortBy])

  const sharePost = async (nft: NFT) => {
    const url = `${window.location.origin}/post/${nft._id}`
    if (navigator.share) {
      try {
        await navigator.share({ title: nft.name, text: nft.description, url })
      } catch {
        navigator.clipboard.writeText(url)
      }
    } else {
      navigator.clipboard.writeText(url)
    }
  }

  const renderMediaPreview = (nft: NFT, mode: "card" | "modal") => {
    const mediaUrl = resolveMediaUrl(nft.imageURL)
    const mediaKind = mediaKindById[nft._id] || "image"
    const baseClass = mode === "card" ? "h-full w-full object-cover" : "h-full w-full object-cover"

    if (mediaKind === "video") return <video src={mediaUrl} className={baseClass} muted playsInline controls={mode === "modal"} />
    if (mediaKind === "audio") {
      return (
        <div className="flex h-full w-full items-center justify-center bg-secondary p-5">
          <audio src={mediaUrl} controls className="w-full" />
        </div>
      )
    }
    if (mediaKind === "document") {
      return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-3 bg-secondary p-5 text-center">
          <FileText className="h-10 w-10 text-primary" />
          <span className="text-sm text-muted-foreground">Document asset</span>
        </div>
      )
    }

    return (
      <img
        src={mediaUrl}
        alt={nft.name}
        className={baseClass}
        onError={(e) => {
          e.currentTarget.src = "/placeholder.svg"
        }}
      />
    )
  }

  const getMediaKindLabel = (nft: NFT) => {
    const kind = mediaKindById[nft._id] || "image"
    if (kind === "video") return "Video"
    if (kind === "audio") return "Audio"
    if (kind === "document") return "Document"
    return "Image"
  }

  return (
    <main className="page-shell min-h-screen py-8 sm:py-10">
      <section className="panel-elevated p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Gallery</p>
            <h1 className="mt-2 font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">DeMedia Asset Gallery</h1>
            <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Browse tokenized media, discover creators, and inspect collectible metadata across the marketplace.
            </p>
          </div>

          <div className="grid w-full gap-3 sm:grid-cols-[1fr_auto] lg:w-auto">
            <label className="relative block min-w-[260px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search name, artist, description"
                className="w-full rounded-xl border border-border/70 bg-background pl-9 pr-3 py-2.5 text-sm outline-none ring-0 focus:border-primary"
              />
            </label>
            <label className="inline-flex items-center gap-2 rounded-xl border border-border/70 bg-card px-3">
              <SlidersHorizontal className="h-4 w-4 text-muted-foreground" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as "newest" | "oldest" | "name" | "tokenAsc" | "tokenDesc" | "creator")}
                className="bg-transparent py-2.5 text-sm outline-none"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
                <option value="name">Name A-Z</option>
                <option value="creator">Creator A-Z</option>
                <option value="tokenAsc">Token ID Low-High</option>
                <option value="tokenDesc">Token ID High-Low</option>
              </select>
            </label>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Assets</p>
            <p className="mt-1 text-xl font-semibold">{totalAssets}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Creators</p>
            <p className="mt-1 text-xl font-semibold">{totalCreators}</p>
          </div>
          <div className="rounded-xl border border-border/70 bg-background/70 p-3">
            <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Latest Mint</p>
            <p className="mt-1 text-xl font-semibold">{latestMintedLabel}</p>
          </div>
        </div>
      </section>

      <section className="mt-5">
        {loading ? (
          <div className="panel p-10 text-center text-muted-foreground">Loading assets...</div>
        ) : filteredNFTs.length === 0 ? (
          <div className="panel p-10 text-center">
            <h2 className="text-lg font-semibold">No assets found</h2>
            <p className="mt-2 text-sm text-muted-foreground">Try another search term or clear filters.</p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {filteredNFTs.map((nft) => (
              <article key={nft._id} className="panel group overflow-hidden transition hover:-translate-y-0.5 hover:bg-secondary/45 hover:shadow-[0_14px_30px_rgba(6,18,35,0.16)]">
                <button onClick={() => setSelectedNFT(nft)} className="block w-full text-left">
                  <div className="relative aspect-square overflow-hidden">
                    {renderMediaPreview(nft, "card")}
                    <div className="pointer-events-none absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 to-transparent p-3 text-[11px] text-white/95 opacity-90 transition group-hover:opacity-100">
                      <span className="rounded-full border border-white/25 bg-black/35 px-2 py-0.5 uppercase tracking-[0.08em]">
                        {getMediaKindLabel(nft)}
                      </span>
                      <span className="font-mono">#{nft.tokenId}</span>
                    </div>
                  </div>
                </button>

                <div className="space-y-3 p-4">
                  <div>
                    <h3 className="line-clamp-1 text-base font-semibold">{nft.name}</h3>
                    <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">{nft.description}</p>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="uppercase tracking-[0.08em]">{nft.artistName}</span>
                    <span>{new Date(nft.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="flex gap-2">
                    <button
                      className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-border/70 bg-card px-3 py-2 text-sm font-medium hover:bg-secondary"
                      onClick={() => router.push(`/post/${nft._id}`)}
                    >
                      <ExternalLink className="h-4 w-4" />
                      View post
                    </button>
                    <button
                      className="inline-flex items-center justify-center rounded-lg border border-border/70 bg-card px-3 py-2 text-sm font-medium hover:bg-secondary"
                      onClick={() => sharePost(nft)}
                    >
                      <Share2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {selectedNFT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/55 p-4" onClick={() => setSelectedNFT(null)}>
          <div className="panel-elevated max-h-[90vh] w-full max-w-4xl overflow-auto p-6 sm:p-8" onClick={(e) => e.stopPropagation()}>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-xl font-semibold">Asset details</h2>
              <button
                onClick={() => setSelectedNFT(null)}
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-border/70 bg-card"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <div className="aspect-square overflow-hidden rounded-xl border border-border/70">
                {renderMediaPreview(selectedNFT, "modal")}
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-2xl font-semibold">{selectedNFT.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{selectedNFT.description}</p>
                </div>

                <div className="space-y-3 text-sm">
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Artist</p>
                    <p className="mt-1 font-medium">{selectedNFT.artistName}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Token ID</p>
                    <p className="mt-1 font-mono">#{selectedNFT.tokenId}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Minted</p>
                    <p className="mt-1 font-medium">{new Date(selectedNFT.createdAt).toLocaleString()}</p>
                  </div>
                  <div className="rounded-xl border border-border/70 bg-background/80 p-3">
                    <p className="text-xs uppercase tracking-[0.1em] text-muted-foreground">Transaction</p>
                    <a
                      href={`https://stellar.expert/explorer/testnet/tx/${selectedNFT.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-2 font-mono text-primary hover:underline"
                    >
                      {selectedNFT.txHash.slice(0, 10)}...{selectedNFT.txHash.slice(-8)}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>

                <button
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground"
                  onClick={() => router.push(`/post/${selectedNFT._id}`)}
                >
                  Open full post
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </main>
  )
}

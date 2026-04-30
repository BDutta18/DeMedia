"use client"

import { useEffect, useState } from "react"
import { ArrowRight, CheckCircle2, Coins, Lock, Rocket, Sparkles, Users } from "lucide-react"
import Link from "next/link"
import { resolveMediaUrl } from "@/lib/media"

interface NFT {
  _id: string
  name: string
  imageURL: string
  owner: string
  artistName?: string
}

export default function HomePage() {
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([])

  useEffect(() => {
    const fetchFeaturedNFTs = async () => {
      try {
        const response = await fetch("/api/nfts/all")
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          const nftsWithArtists = await Promise.all(
            data.data.slice(0, 4).map(async (nft: NFT) => {
              try {
                const profileResponse = await fetch(`/api/user/profile/${nft.owner}`)
                const profileData = await profileResponse.json()
                return {
                  ...nft,
                  artistName:
                    profileData.success && profileData.user?.name
                      ? profileData.user.name
                      : `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`,
                }
              } catch {
                return {
                  ...nft,
                  artistName: `${nft.owner.slice(0, 6)}...${nft.owner.slice(-4)}`,
                }
              }
            }),
          )
          setFeaturedNFTs(nftsWithArtists)
        }
      } catch (error) {
        console.error("Failed to fetch NFTs:", error)
      }
    }

    fetchFeaturedNFTs()
  }, [])

  return (
    <main className="min-h-screen pb-16">
      <section className="page-shell py-12 sm:py-16 lg:py-20">
        <div className="panel-elevated overflow-hidden p-8 sm:p-10 lg:p-14">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-secondary px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                Production-grade creator infrastructure
              </span>

              <h1 className="mt-5 text-balance font-[family-name:var(--font-display)] text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">
                Run your digital media business on-chain, without compromise.
              </h1>

              <p className="mt-5 max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
                DeMedia helps creators and teams publish content, tokenize ownership, and automate royalties through a single operational platform.
              </p>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                <Link
                  href="/upload"
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground"
                >
                  Start publishing
                  <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/gallery"
                  className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary"
                >
                  Explore marketplace
                </Link>
              </div>

              <div className="mt-8 grid gap-3 sm:grid-cols-2">
                {[
                  "On-chain provenance and custody",
                  "Automated royalty distribution",
                  "Creator-friendly licensing rails",
                  "Built for teams and studios",
                ].map((point) => (
                  <div key={point} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle2 className="h-4 w-4 text-primary" />
                    {point}
                  </div>
                ))}
              </div>
            </div>

            <div className="panel grid gap-4 p-5">
              {["Active creators|127K+", "Tokenized assets|1.2M", "Royalties distributed|$45M+", "Partner communities|320+"].map((row) => {
                const [label, value] = row.split("|")
                return (
                  <div key={label} className="rounded-xl border border-border/70 bg-background/80 p-4">
                    <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">{label}</p>
                    <p className="mt-2 text-2xl font-semibold">{value}</p>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </section>

      <section className="page-shell py-6 sm:py-10">
        <div className="grid gap-4 md:grid-cols-3">
          {[
            {
              title: "Ownership-first architecture",
              text: "Every publication carries immutable provenance and transparent custody history.",
              icon: Lock,
            },
            {
              title: "Monetization by design",
              text: "Programmable royalties and payout rails built directly into the asset lifecycle.",
              icon: Coins,
            },
            {
              title: "Enterprise-ready operations",
              text: "A scalable foundation for creator collectives, studios, and digital brands.",
              icon: Rocket,
            },
          ].map((feature) => (
            <article key={feature.title} className="panel p-6">
              <feature.icon className="h-5 w-5 text-primary" />
              <h2 className="mt-4 text-lg font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.text}</p>
            </article>
          ))}
        </div>
      </section>

      {featuredNFTs.length > 0 && (
        <section className="page-shell py-10 sm:py-14">
          <div className="mb-6 flex items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.14em] text-muted-foreground">Featured</p>
              <h2 className="mt-2 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">
                Marketplace highlights
              </h2>
            </div>
            <Link href="/gallery" className="text-sm font-medium text-primary hover:opacity-80">
              View all
            </Link>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {featuredNFTs.map((nft) => (
              <a key={nft._id} href={`/post/${nft._id}`} className="panel overflow-hidden transition hover:bg-secondary/45">
                <img
                  src={resolveMediaUrl(nft.imageURL)}
                  alt={nft.name}
                  className="h-48 w-full object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/placeholder.svg"
                  }}
                />
                <div className="space-y-2 p-4">
                  <h3 className="line-clamp-1 font-medium">{nft.name}</h3>
                  <p className="text-xs uppercase tracking-[0.08em] text-muted-foreground">{nft.artistName}</p>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}

      <section className="page-shell py-14">
        <div className="panel-elevated p-8 text-center sm:p-10">
          <Users className="mx-auto h-6 w-6 text-primary" />
          <h2 className="mt-4 font-[family-name:var(--font-display)] text-2xl font-semibold sm:text-3xl">
            Ready to scale your media catalog?
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Move from one-off drops to a durable content business with programmable ownership and revenue rails.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link href="/auth" className="rounded-xl bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground">
              Create account
            </Link>
            <Link href="/content" className="rounded-xl border border-border/80 bg-card px-5 py-3 text-sm font-semibold hover:bg-secondary">
              See content tools
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

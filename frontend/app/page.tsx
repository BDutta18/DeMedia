"use client"

import { useEffect, useState } from "react"
import { Users, Coins, ArrowRight, Rocket, Star, Lock } from "lucide-react"
import LoadingAnimation from "@/components/loading-animation"
import FuturisticNavbar from "@/components/futuristic-navbar"
import AnimatedBackground from "@/components/animated-background"
import { resolveMediaUrl } from "@/lib/media"

interface NFT {
  _id: string
  name: string
  description: string
  imageURL: string
  owner: string
  artistName?: string
  tokenId: string
}

const useScrollReveal = () => {
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setVisibleElements((prev) => new Set([...prev, entry.target.id]))
          }
        })
      },
      { threshold: 0.1 }
    )

    const elements = document.querySelectorAll("[data-scroll-reveal]")
    elements.forEach((el) => observer.observe(el))

    return () => {
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

  return visibleElements
}

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true)
  const [featuredNFTs, setFeaturedNFTs] = useState<NFT[]>([])
  const visibleElements = useScrollReveal()

  useEffect(() => {
    const fetchFeaturedNFTs = async () => {
      try {
        const response = await fetch("/api/nfts/all")
        const data = await response.json()

        if (data.success && data.data.length > 0) {
          const nftsWithArtists = await Promise.all(
            data.data.slice(0, 8).map(async (nft: NFT) => {
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
              } catch (error) {
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
    <>
      {isLoading && <LoadingAnimation onComplete={() => setIsLoading(false)} />}

      <AnimatedBackground />

      <FuturisticNavbar />

      <main className="relative min-h-screen max-w-[100vw] overflow-x-hidden">
        {/* Hero Section - Clean and Professional */}
        <section className="relative min-h-screen flex items-center justify-center px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          {/* Atmospheric background elements */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div
              className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-[#3b82f6]/5 blur-[120px]"
              style={{ animation: "float 20s ease-in-out infinite" }}
            />
            <div
              className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-[#0284c7]/5 blur-[120px]"
              style={{ animation: "float 25s ease-in-out infinite reverse" }}
            />
          </div>

          {/* Main content */}
          <div className="relative z-10 max-w-6xl mx-auto text-center space-y-8 w-full">
            {/* Main title */}
            <div
              className="space-y-6 animate-fadeInScale"
              style={{ animationDelay: "0.4s" }}
            >
              <h1
                className="font-[family-name:var(--font-display)] text-6xl sm:text-7xl md:text-8xl lg:text-9xl font-black tracking-wider"
                style={{
                  letterSpacing: "0.08em",
                  background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  filter: "drop-shadow(0 0 40px rgba(251, 191, 36, 0.3))",
                }}
              >
                DeMedia
              </h1>
              <p
                className="font-[family-name:var(--font-display)] text-xl sm:text-2xl md:text-3xl font-bold text-gray-300 tracking-widest"
                style={{ letterSpacing: "0.1em" }}
              >
                DECENTRALIZED PUBLISHING
              </p>
              <p className="text-base sm:text-lg md:text-xl text-gray-400 max-w-3xl mx-auto leading-relaxed px-4">
                Tokenize your creativity, connect with the creator economy, and build sustainable digital ownership on the blockchain.
              </p>
            </div>

            {/* CTA Button */}
            <div
              className="flex justify-center pt-8 animate-fadeInScale"
              style={{ animationDelay: "0.6s" }}
            >
              <a href="/gallery" className="group relative px-8 md:px-12 py-4 md:py-6 font-[family-name:var(--font-display)] text-sm md:text-lg font-bold tracking-wider overflow-hidden transition-all duration-500 hover:scale-110">
                <div
                  className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#0284c7] to-[#06b6d4] animate-gradient-shift opacity-100"
                  style={{ filter: "blur(1px)" }}
                />
                <div className="absolute inset-[2px] bg-[#0a0a0f] group-hover:bg-[#0f1419] transition-colors duration-300" />
                <span className="relative flex items-center gap-3 text-white group-hover:text-[#06b6d4] transition-colors duration-300 whitespace-nowrap">
                  EXPLORE GALLERY
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
                </span>
              </a>
            </div>

            {/* Key Statistics */}
            <div
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-24 px-4 max-w-4xl mx-auto animate-fadeInScale stagger-children"
              style={{ animationDelay: "0.8s" }}
            >
              {[
                { icon: Users, label: "Active Creators", value: "127K+", color: "#3b82f6" },
                { icon: Coins, label: "Assets Tokenized", value: "1.2M", color: "#0284c7" },
                { icon: Rocket, label: "Value Distributed", value: "$45M+", color: "#06b6d4" },
              ].map((stat, i) => (
                <div
                  key={i}
                  data-scroll-reveal
                  id={`stat-${i}`}
                  className={`glass rounded-2xl p-6 sm:p-8 transition-all duration-500 hover:scale-[1.08] hover:-translate-y-3 cursor-pointer group ${
                    visibleElements.has(`stat-${i}`)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    boxShadow: `0 20px 40px rgba(0, 0, 0, 0.4)`,
                  }}
                >
                  <div className="space-y-3">
                    <stat.icon
                      className="w-10 h-10 mx-auto transition-all duration-300 group-hover:scale-125 group-hover:rotate-12"
                      style={{ color: stat.color }}
                    />
                    <div
                      className="font-[family-name:var(--font-display)] text-3xl sm:text-4xl font-black animate-number-counter"
                      style={{ color: stat.color }}
                    >
                      {stat.value}
                    </div>
                    <div className="font-[family-name:var(--font-display)] text-xs sm:text-sm tracking-widest text-gray-400 group-hover:text-gray-300 transition-colors">
                      {stat.label}
                    </div>
                  </div>

                  {/* Glow background on hover */}
                  <div
                    className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"
                    style={{
                      background: `radial-gradient(circle, ${stat.color}20, transparent 70%)`,
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#3b82f6] to-transparent opacity-50" />

          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2
                data-scroll-reveal
                id="features-title"
                className={`font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-black tracking-wider mb-6 transition-all duration-500 ${
                  visibleElements.has("features-title")
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
                style={{
                  letterSpacing: "0.1em",
                  background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                CORE FEATURES
              </h2>
              <p className="text-base sm:text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
                Everything you need to publish, monetize, and grow on the blockchain
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 stagger-children">
              {[
                {
                  icon: Lock,
                  title: "Decentralized Control",
                  description: "Full ownership and control over your content with blockchain-backed security",
                  color: "#3b82f6",
                  delay: "0s",
                },
                {
                  icon: Coins,
                  title: "Tokenize Assets",
                  description: "Transform any content into tradable tokens and generate passive income",
                  color: "#0284c7",
                  delay: "0.1s",
                },
                {
                  icon: Star,
                  title: "Creator Economy",
                  description: "Connect directly with your audience and build sustainable communities",
                  color: "#06b6d4",
                  delay: "0.2s",
                },
              ].map((feature, i) => (
                <div
                  key={i}
                  data-scroll-reveal
                  id={`feature-${i}`}
                  className={`group card-premium rounded-2xl p-8 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 ${
                    visibleElements.has(`feature-${i}`)
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                >
                  <div className="space-y-4">
                    <feature.icon
                      className="w-12 h-12 transition-all duration-300 group-hover:scale-110"
                      style={{ color: feature.color }}
                    />
                    <h3 className="text-xl font-bold text-yellow-300">{feature.title}</h3>
                    <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Featured Content Section */}
        {featuredNFTs.length > 0 && (
          <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-transparent via-[#0284c7]/5 to-transparent">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#0284c7] to-transparent opacity-50" />

            <div className="max-w-7xl mx-auto">
              <div className="text-center mb-16">
                <h2
                  data-scroll-reveal
                  id="featured-title"
                  className={`font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-black tracking-wider transition-all duration-500 ${
                    visibleElements.has("featured-title")
                      ? "opacity-100 translate-y-0"
                      : "opacity-0 translate-y-10"
                  }`}
                  style={{
                    letterSpacing: "0.1em",
                    background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
                    WebkitBackgroundClip: "text",
                    backgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                  }}
                >
                  FEATURED CONTENT
                </h2>
                <p className="text-gray-400 mt-4">Discover the latest creations from our community</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 stagger-children">
                {featuredNFTs.map((nft, i) => (
                  <a
                    key={nft._id}
                    href={`/post/${nft._id}`}
                    data-scroll-reveal
                    id={`nft-${i}`}
                    className={`group card-premium rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer ${
                      visibleElements.has(`nft-${i}`)
                        ? "opacity-100 translate-y-0"
                        : "opacity-0 translate-y-10"
                    }`}
                  >
                    <div className="relative h-48 overflow-hidden">
                      <img
                        src={resolveMediaUrl(nft.imageURL)}
                        alt={nft.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                        onError={(e) => {
                          e.currentTarget.src = "/placeholder.svg"
                        }}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity duration-300" />
                    </div>

                    <div className="p-4 space-y-3">
                      <h3 className="text-lg font-semibold text-yellow-300 line-clamp-2 group-hover:text-yellow-400 transition-colors">
                        {nft.name}
                      </h3>
                      <p className="text-sm text-gray-400">{nft.artistName}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </section>
        )}

        {/* CTA Section */}
        <section className="relative py-20 md:py-32 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center space-y-8">
            <h2
              data-scroll-reveal
              id="cta-title"
              className={`font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-black tracking-wider transition-all duration-500 ${
                visibleElements.has("cta-title")
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-10"
              }`}
              style={{
                letterSpacing: "0.1em",
                background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              Ready to Create?
            </h2>

            <p className="text-lg text-gray-400 max-w-2xl mx-auto">
              Join thousands of creators revolutionizing digital ownership. Start tokenizing your content today.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a href="/upload" className="group relative px-8 py-4 font-[family-name:var(--font-display)] font-bold tracking-wider overflow-hidden transition-all duration-500 hover:scale-105">
                <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#0284c7] to-[#06b6d4] animate-gradient-shift opacity-100" style={{ filter: "blur(1px)" }} />
                <div className="absolute inset-[2px] bg-[#0a0a0f] group-hover:bg-[#0f1419] transition-colors duration-300" />
                <span className="relative text-white group-hover:text-[#06b6d4] transition-colors duration-300">
                  GET STARTED
                </span>
              </a>
              <a href="/gallery" className="group relative px-8 py-4 font-[family-name:var(--font-display)] font-bold tracking-wider border border-[#3b82f6]/50 rounded-lg transition-all duration-300 hover:scale-105">
                <span className="text-[#3b82f6] group-hover:text-[#06b6d4] transition-colors duration-300">
                  EXPLORE
                </span>
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  )
}

"use client"

import Link from "next/link"
import { useEffect, useState } from "react"
import {
  ArrowUpRight,
  BarChart3,
  Coins,
  Eye,
  FileText,
  ImageIcon,
  Rocket,
  ShieldCheck,
  Sparkles,
  Users,
} from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import WaveGridBackground from "@/components/wave-grid-background"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { isAuthenticated, address } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

  const kpiCards = [
    { label: "Published Posts", value: "24", delta: "+6 this month", icon: FileText, color: "#3b82f6" },
    { label: "Portfolio Assets", value: "18", delta: "+2 minted", icon: ImageIcon, color: "#06b6d4" },
    { label: "Total Reach", value: "42.8K", delta: "+14.2%", icon: Eye, color: "#f59e0b" },
    { label: "Royalty Earned", value: "1,280 XLM", delta: "+320 XLM", icon: Coins, color: "#ef4444" },
  ]

  const performance = [
    { name: "Content Quality", value: 84, color: "from-[#3b82f6] to-[#06b6d4]" },
    { name: "Audience Growth", value: 71, color: "from-[#06b6d4] to-[#22d3ee]" },
    { name: "Marketplace Sales", value: 63, color: "from-[#f59e0b] to-[#ef4444]" },
  ]

  const activity = [
    { title: "Article minted", subtitle: "Neural Art Guide #12", time: "2h ago", dotColor: "bg-[#60a5fa]" },
    { title: "Royalty received", subtitle: "48 XLM from resale", time: "5h ago", dotColor: "bg-[#fbbf24]" },
    { title: "New follower", subtitle: "Wallet connected to your profile", time: "8h ago", dotColor: "bg-[#67e8f9]" },
    { title: "Collection update", subtitle: "3 assets listed in gallery", time: "1d ago", dotColor: "bg-[#fda4af]" },
  ]

  return (
    <>
      <div className="fixed inset-0 bg-[#0a0a0f]">
        <WaveGridBackground />
      </div>

      <div
        className="fixed w-96 h-96 rounded-full opacity-10 blur-3xl transition-all duration-700 ease-out pointer-events-none"
        style={{
          left: mousePosition.x - 192,
          top: mousePosition.y - 192,
          background: "radial-gradient(circle, #fbbf24 0%, transparent 70%)",
          zIndex: 1,
        }}
      />

      <FuturisticNavbar />

      <main className="relative min-h-screen pt-24 sm:pt-28 md:pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
        <div className="max-w-7xl mx-auto">
          <section className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-6 mb-8">
            <div className="card-premium p-7 md:p-8">
              <div className="chip-row mb-5">
                <span className="chip chip-subtle">Creator Console</span>
                <span className="chip">{isAuthenticated ? "Authenticated" : "Guest"}</span>
              </div>
              <h1 className="font-[family-name:var(--font-display)] text-4xl sm:text-5xl md:text-6xl font-black tracking-[0.08em] gradient-text">
                DEMEDIA DASHBOARD
              </h1>
              <p className="mt-4 text-gray-300 text-base sm:text-lg max-w-2xl">
                Track your publishing momentum, monitor royalties, and launch new on-chain content from one modern workspace.
              </p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link
                  href="/upload"
                  className="group relative px-6 py-3 font-[family-name:var(--font-display)] text-sm font-bold tracking-wider overflow-hidden transition-all duration-300 hover:scale-[1.03]"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#0284c7] to-[#06b6d4] animate-gradient-shift opacity-100" />
                  <div className="absolute inset-[2px] bg-[#0a0a0f] group-hover:bg-[#0f1419] transition-colors duration-300" />
                  <span className="relative flex items-center gap-2 text-white group-hover:text-[#67e8f9] transition-colors duration-300">
                    Publish Content
                    <ArrowUpRight className="w-4 h-4" />
                  </span>
                </Link>
                <Link href="/my-nfts" className="btn-outline-premium px-6 py-3 font-[family-name:var(--font-display)] text-sm font-bold tracking-wider">
                  Manage Portfolio
                </Link>
              </div>
            </div>

            <div className="card-premium p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white">Account Status</h2>
                <ShieldCheck className="w-5 h-5 text-[#67e8f9]" />
              </div>
              <div className="space-y-4">
                <div className="rounded-xl border border-white/10 bg-[#0a0a0f]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Wallet</p>
                  <p className="text-base font-mono text-[#93c5fd] mt-2">{walletLabel}</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-[#0a0a0f]/70 p-4">
                  <p className="text-xs uppercase tracking-[0.16em] text-gray-500">Profile Strength</p>
                  <div className="mt-2 flex items-center justify-between text-sm">
                    <span className="text-white font-semibold">78%</span>
                    <span className="text-[#67e8f9]">Good</span>
                  </div>
                  <div className="mt-3 h-2 rounded-full bg-white/10 overflow-hidden">
                    <div className="h-full w-[78%] bg-gradient-to-r from-[#3b82f6] to-[#22d3ee]" />
                  </div>
                </div>
                <Link href="/profile" className="inline-flex items-center gap-2 text-sm text-[#67e8f9] hover:text-[#a5f3fc] transition-colors">
                  Complete profile setup
                  <ArrowUpRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
            {kpiCards.map((card) => (
              <article key={card.label} className="card-premium p-5 rounded-2xl hover:-translate-y-1 transition-transform duration-300">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-gray-400">{card.label}</p>
                  <card.icon className="w-5 h-5" style={{ color: card.color }} />
                </div>
                <p className="mt-4 text-3xl font-bold text-white">{card.value}</p>
                <p className="mt-2 text-xs tracking-wide" style={{ color: card.color }}>
                  {card.delta}
                </p>
              </article>
            ))}
          </section>

          <section className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-6 mb-8">
            <div className="card-premium p-6 md:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Performance Overview</h2>
                <BarChart3 className="w-5 h-5 text-[#67e8f9]" />
              </div>
              <div className="space-y-5">
                {performance.map((item) => (
                  <div key={item.name}>
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm text-gray-300">{item.name}</p>
                      <p className="text-sm font-semibold text-white">{item.value}%</p>
                    </div>
                    <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                      <div className={`h-full rounded-full bg-gradient-to-r ${item.color}`} style={{ width: `${item.value}%` }} />
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-6 p-4 rounded-xl border border-white/10 bg-[#0a0a0f]/65 flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-[#fbbf24] mt-0.5" />
                <p className="text-sm text-gray-300">
                  This week your content engagement is up by <span className="text-[#67e8f9] font-semibold">14.2%</span>.
                  Publish one long-form post to push your discovery score above 90%.
                </p>
              </div>
            </div>

            <div className="card-premium p-6 md:p-7">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-white">Recent Activity</h2>
                <Users className="w-5 h-5 text-[#60a5fa]" />
              </div>
              <div className="space-y-4">
                {activity.map((entry) => (
                  <div key={entry.title + entry.time} className="flex items-start gap-3">
                    <span className={`mt-1 inline-flex h-2.5 w-2.5 rounded-full ${entry.dotColor}`} />
                    <div className="min-w-0">
                      <p className="text-sm text-white font-medium">{entry.title}</p>
                      <p className="text-xs text-gray-400">{entry.subtitle}</p>
                    </div>
                    <p className="text-xs text-gray-500 ml-auto whitespace-nowrap">{entry.time}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              { title: "Upload New Post", description: "Publish article, audio, or media pack to mint.", href: "/upload", icon: Rocket, tone: "text-[#67e8f9]" },
              { title: "Open Your Gallery", description: "Review active listings and featured showcases.", href: "/gallery", icon: ImageIcon, tone: "text-[#93c5fd]" },
              { title: "Manage Collections", description: "Track holdings and update pricing instantly.", href: "/my-nfts", icon: Coins, tone: "text-[#fbbf24]" },
            ].map((action) => (
              <Link key={action.title} href={action.href} className="card-premium p-6 rounded-2xl group hover:scale-[1.02] transition-all duration-300">
                <div className="flex items-start justify-between">
                  <action.icon className={`w-6 h-6 ${action.tone}`} />
                  <ArrowUpRight className="w-4 h-4 text-gray-500 group-hover:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-all" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-white">{action.title}</h3>
                <p className="mt-2 text-sm text-gray-400 leading-relaxed">{action.description}</p>
              </Link>
            ))}
          </section>
        </div>
      </main>
    </>
  )
}

"use client"

import Link from "next/link"
import { useMemo } from "react"
import {
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Coins,
  Eye,
  FileText,
  ImageIcon,
  Rocket,
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { isAuthenticated, address } = useAuth()

  const walletLabel = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"

  const kpiCards = useMemo(
    () => [
      { label: "Published Posts", value: "24", delta: "+6 this month", icon: FileText },
      { label: "Portfolio Assets", value: "18", delta: "+2 minted", icon: ImageIcon },
      { label: "Total Reach", value: "42.8K", delta: "+14.2%", icon: Eye },
      { label: "Royalty Earned", value: "1,280 XLM", delta: "+320 XLM", icon: Coins },
    ],
    [],
  )

  const performance = [
    { name: "Content Quality", value: 84 },
    { name: "Audience Growth", value: 71 },
    { name: "Marketplace Sales", value: 63 },
  ]

  const activity = [
    { title: "Article minted", subtitle: "Neural Art Guide #12", time: "2h ago" },
    { title: "Royalty received", subtitle: "48 XLM from resale", time: "5h ago" },
    { title: "New follower", subtitle: "Wallet connected to your profile", time: "8h ago" },
    { title: "Collection update", subtitle: "3 assets listed in gallery", time: "1d ago" },
  ]

  return (
    <main className="page-shell min-h-screen py-8 sm:py-10">
      <section className="grid gap-5 lg:grid-cols-[1.6fr_1fr]">
        <div className="panel-elevated p-6 sm:p-8">
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-border/80 bg-secondary px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              Creator Console
            </span>
            <span className="rounded-full border border-border/80 bg-card px-3 py-1 text-xs font-semibold uppercase tracking-[0.12em] text-muted-foreground">
              {isAuthenticated ? "Authenticated" : "Guest"}
            </span>
          </div>

          <h1 className="text-balance font-[family-name:var(--font-display)] text-3xl font-semibold sm:text-4xl">
            DeMedia Dashboard
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Track publishing momentum, monitor royalties, and manage your on-chain media operations from one workspace.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/upload" className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground">
              Publish content
              <ArrowUpRight className="h-4 w-4" />
            </Link>
            <Link href="/my-nfts" className="inline-flex items-center gap-2 rounded-xl border border-border/80 bg-card px-4 py-2.5 text-sm font-semibold hover:bg-secondary">
              Manage portfolio
            </Link>
          </div>

          <div className="mt-6 grid gap-2 sm:grid-cols-2">
            {[
              "Royalty pipeline health is stable",
              "Creator profile completion improves discoverability",
              "Consistent posting cadence boosts conversion",
              "Collection pricing can be optimized weekly",
            ].map((point) => (
              <div key={point} className="inline-flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                {point}
              </div>
            ))}
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold">Account status</h2>
            <ShieldCheck className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-3">
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Wallet</p>
              <p className="mt-2 font-mono text-sm">{walletLabel}</p>
            </div>
            <div className="rounded-xl border border-border/70 bg-background/80 p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs uppercase tracking-[0.12em] text-muted-foreground">Profile strength</p>
                <p className="text-sm font-semibold">78%</p>
              </div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-secondary">
                <div className="h-full w-[78%] rounded-full bg-primary" />
              </div>
            </div>
            <Link href="/profile" className="inline-flex items-center gap-2 text-sm font-medium text-primary">
              Complete profile setup
              <ArrowUpRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {kpiCards.map((card) => (
          <article key={card.label} className="panel p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">{card.label}</p>
              <card.icon className="h-5 w-5 text-primary" />
            </div>
            <p className="mt-4 text-2xl font-semibold">{card.value}</p>
            <p className="mt-1 text-xs text-muted-foreground">{card.delta}</p>
          </article>
        ))}
      </section>

      <section className="mt-6 grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Performance overview</h2>
            <BarChart3 className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            {performance.map((item) => (
              <div key={item.name}>
                <div className="mb-2 flex items-center justify-between text-sm">
                  <p className="text-muted-foreground">{item.name}</p>
                  <p className="font-semibold">{item.value}%</p>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-secondary">
                  <div className="h-full rounded-full bg-primary" style={{ width: `${item.value}%` }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 rounded-xl border border-border/70 bg-background/80 p-4">
            <p className="flex items-start gap-2 text-sm text-muted-foreground">
              <Sparkles className="mt-0.5 h-4 w-4 text-accent" />
              Engagement is up 14.2% this week. Publish one long-form piece to push your discovery score above 90%.
            </p>
          </div>
        </div>

        <div className="panel p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Recent activity</h2>
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-4">
            {activity.map((entry) => (
              <div key={entry.title + entry.time} className="flex items-start gap-3">
                <span className="mt-1.5 inline-flex h-2 w-2 rounded-full bg-primary" />
                <div className="min-w-0">
                  <p className="text-sm font-medium">{entry.title}</p>
                  <p className="text-xs text-muted-foreground">{entry.subtitle}</p>
                </div>
                <p className="ml-auto whitespace-nowrap text-xs text-muted-foreground">{entry.time}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-3">
        {[
          {
            title: "Upload New Post",
            description: "Publish article, audio, or media pack to mint.",
            href: "/upload",
            icon: Rocket,
          },
          {
            title: "Open Your Gallery",
            description: "Review active listings and featured showcases.",
            href: "/gallery",
            icon: ImageIcon,
          },
          {
            title: "Manage Collections",
            description: "Track holdings and update pricing instantly.",
            href: "/my-nfts",
            icon: Coins,
          },
        ].map((action) => (
          <Link key={action.title} href={action.href} className="panel p-5 transition hover:bg-secondary/60">
            <div className="flex items-start justify-between">
              <action.icon className="h-5 w-5 text-primary" />
              <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
            </div>
            <h3 className="mt-4 font-semibold">{action.title}</h3>
            <p className="mt-1 text-sm text-muted-foreground">{action.description}</p>
          </Link>
        ))}
      </section>

      <section className="mt-6 grid gap-4 md:grid-cols-2">
        <article className="panel p-5">
          <div className="mb-3 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            <h3 className="font-semibold">Growth opportunities</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. Increase upload cadence to 3 posts/week for better discovery.</li>
            <li>2. Convert high-performing content into premium NFT collections.</li>
            <li>3. Use creator collaborations to expand total audience reach.</li>
          </ul>
        </article>

        <article className="panel p-5">
          <div className="mb-3 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-accent" />
            <h3 className="font-semibold">Platform feature points</h3>
          </div>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>1. Built-in royalty tracking and settlement visibility.</li>
            <li>2. On-chain proof of ownership for each published asset.</li>
            <li>3. Marketplace-ready metadata and listing workflow.</li>
          </ul>
        </article>
      </section>
    </main>
  )
}

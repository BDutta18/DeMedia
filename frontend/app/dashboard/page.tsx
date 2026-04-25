"use client"

import { useState, useEffect } from "react"
import { Globe, Lock, Rocket, Users } from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import WaveGridBackground from "@/components/wave-grid-background"
import { useAuth } from "@/lib/auth-context"

export default function DashboardPage() {
  const { isAuthenticated } = useAuth()
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [visibleElements, setVisibleElements] = useState<Set<string>>(new Set())

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Setup scroll reveal observer
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
      window.removeEventListener("mousemove", handleMouseMove)
      elements.forEach((el) => observer.unobserve(el))
    }
  }, [])

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
          {/* Header Section */}
          <div className="mb-16 space-y-4">
            <h1
              className="font-[family-name:var(--font-display)] text-5xl sm:text-6xl md:text-7xl font-black tracking-wider"
              style={{
                letterSpacing: "0.1em",
                background: "linear-gradient(135deg, #fbbf24 0%, #eab308 50%, #ca8a04 100%)",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
              }}
            >
              DeMedia DASHBOARD
            </h1>
            <p className="text-gray-400 text-lg">Your creator hub - manage assets, track performance, and grow your audience</p>
          </div>

          {/* Platform Information Grid - Static, Reliable Content */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 stagger-children">
            {[
              {
                icon: Globe,
                title: "DeMedia Network",
                description: "Decentralized publishing platform",
                details: "Live on Blockchain",
                color: "#fbbf24",
              },
              {
                icon: Users,
                title: "Creator Community",
                description: "Join thousands of creators",
                details: "Active ecosystem",
                color: "#eab308",
              },
              {
                icon: Lock,
                title: "Secure Assets",
                description: "Your content is protected",
                details: "Web3 Security",
                color: "#ca8a04",
              },
              {
                icon: Rocket,
                title: "Get Started",
                description: "Monetize your content today",
                details: "Zero setup fees",
                color: "#f59e0b",
              },
            ].map((item, i) => {
              const IconComponent = item.icon
              return (
              <div
                key={i}
                data-scroll-reveal
                id={`platform-card-${i}`}
                className={`group card-premium rounded-2xl p-8 transition-all duration-500 hover:scale-[1.05] hover:-translate-y-2 ${
                  visibleElements.has(`platform-card-${i}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <div className="space-y-4">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: item.color + "20",
                      border: `1px solid ${item.color}40`,
                    }}
                  >
                    <IconComponent className="w-6 h-6" style={{ color: item.color }} />
                  </div>

                  <div className="space-y-2">
                    <h3 className="text-lg font-bold text-white">{item.title}</h3>
                    <p className="text-sm text-gray-400">{item.description}</p>
                  </div>

                  <div className="pt-3 border-t border-white/5">
                    <span
                      className="text-xs font-mono px-3 py-1 rounded-full inline-block transition-colors duration-300"
                      style={{
                        background: item.color + "15",
                        color: item.color,
                      }}
                    >
                      {item.details}
                    </span>
                  </div>
                </div>

                {/* Glow effect on hover */}
                <div
                  className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl pointer-events-none"
                  style={{ background: `radial-gradient(circle, ${item.color}10, transparent 70%)` }}
                />
              </div>
            )})}
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12 stagger-children">
            {[
              { title: "Upload Content", description: "Publish and tokenize new digital assets", href: "/upload", color: "#fbbf24" },
              { title: "View Analytics", description: "Track performance metrics and reach", href: "/analytics", color: "#eab308" },
              { title: "Manage Assets", description: "View and manage your NFT portfolio", href: "/my-nfts", color: "#ca8a04" },
            ].map((action, i) => (
              <a
                key={i}
                href={action.href}
                data-scroll-reveal
                id={`action-${i}`}
                className={`group card-premium rounded-2xl p-8 transition-all duration-500 hover:scale-[1.02] cursor-pointer ${
                  visibleElements.has(`action-${i}`)
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-10"
                }`}
              >
                <div className="space-y-3">
                  <div
                    className="w-12 h-12 rounded-lg flex items-center justify-center transition-all duration-300 group-hover:scale-110"
                    style={{
                      background: action.color + "15",
                      border: `1px solid ${action.color}30`,
                    }}
                  >
                    <div
                      className="w-6 h-6 rounded-full animate-pulse-glow"
                      style={{ background: action.color }}
                    />
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-[#fbbf24] transition-colors">{action.title}</h3>
                  <p className="text-sm text-gray-400">{action.description}</p>
                </div>

                <div className="mt-4 flex items-center gap-2 text-sm font-mono text-gray-500 group-hover:text-[#eab308] transition-colors">
                  <span>Access</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            ))}
          </div>

          {/* Info Section */}
          <div className="card-premium rounded-2xl p-8 md:p-12 border border-white/5">
            <h2 className="text-2xl font-bold text-white mb-4">Your DeMedia Hub</h2>
            <p className="text-gray-400 leading-relaxed">
              Manage your published content and digital assets on the DeMedia platform. View all your tokenized pages, monitor performance metrics, and access real-time analytics. Upload new content, manage your NFT portfolio, and track your growth across the decentralized publishing ecosystem.
            </p>
          </div>
        </div>
      </main>
    </>
  )
}

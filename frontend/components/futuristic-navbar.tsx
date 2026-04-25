"use client"

import {
  Home,
  Search,
  LogIn,
  Menu,
  X,
  LayoutDashboard,
  Library,
  Upload,
  WalletIcon,
  LogOut,
  UserCircle,
  ImageIcon,
  UserPlus,
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"

export default function FuturisticNavbar() {
  const [hoveredIcon, setHoveredIcon] = useState<number | null>(null)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, address, logout } = useAuth()
  const pathname = usePathname()
  const hideBrandLogo = pathname === "/" || pathname === "/dashboard"

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const iconButtons = [
    { icon: Home, label: "Home", href: "/" },
    { icon: ImageIcon, label: "Gallery", href: "/gallery" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Library, label: "Content", href: "/content" },
    { icon: Upload, label: "Upload", href: "/upload" },
    { icon: WalletIcon, label: "Wallet", href: "/wallet" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
    { icon: Search, label: "Search", href: "/search" },
  ]

  return (
    <>
      <nav className={"fixed top-0 left-0 right-0 z-50 px-4 md:px-6 py-3 md:py-4 transition-all duration-500 " + (isScrolled ? "bg-[#0a0a0f]/80 backdrop-blur-xl border-b border-white/5" : "bg-transparent")}>
        <div className="max-w-7xl mx-auto">
          {/* Desktop Navbar */}
          <div className="hidden md:flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              {!hideBrandLogo && (
                <img src="/logo.png" alt="DeMedia" className="w-10 h-10 md:w-12 md:h-12 drop-shadow-[0_0_20px_rgba(59,130,246,0.4)]" />
              )}
              <span className="font-[family-name:var(--font-display)] text-xl md:text-2xl font-black tracking-wider gradient-text">
                DeMedia
              </span>
            </Link>

            {/* Centered navigation icons */}
            <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-3">
              {iconButtons.map((button, i) => (
                <Link
                  key={i}
                  href={button.href}
                  className="group relative w-12 h-12 md:w-14 md:h-14 rounded-full border border-white/10 backdrop-blur-xl bg-[#12121a]/50 hover:bg-[#1a1a2e]/70 transition-all duration-300 hover:scale-110 hover:border-[#3b82f6]/50 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]"
                  onMouseEnter={() => setHoveredIcon(i)}
                  onMouseLeave={() => setHoveredIcon(null)}
                  aria-label={button.label}
                >
                  <div className="absolute inset-0 flex items-center justify-center">
                    <button.icon className="w-5 h-5 text-gray-400 group-hover:text-[#3b82f6] transition-colors duration-300" />
                  </div>

                  {hoveredIcon === i && (
                    <div className="absolute top-full left-1/2 -translate-x-1/2 mt-3 px-3 py-1.5 rounded-lg bg-[#12121a]/95 backdrop-blur-xl border border-white/10 text-xs text-gray-300 whitespace-nowrap animate-reveal-up">
                      {button.label}
                    </div>
                  )}

                  <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-br from-[#3b82f6]/20 to-[#0284c7]/20 blur-xl" />
                </Link>
              ))}
            </div>

            {/* Auth Buttons */}
            <div className="flex items-center gap-3 flex-shrink-0">
              {isAuthenticated ? (
                <>
                  {/* Show wallet address */}
                  <div className="px-4 py-2 rounded-full border border-[#3b82f6]/30 backdrop-blur-xl bg-[#12121a]/50 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    <span className="text-xs md:text-sm font-mono text-[#3b82f6]">
                      {address?.slice(0, 6)}...{address?.slice(-4)}
                    </span>
                  </div>

                  {/* Logout button */}
                  <button
                    onClick={logout}
                    className="group relative px-4 md:px-6 py-2 md:py-3 rounded-full border border-red-500/30 backdrop-blur-xl bg-[#12121a]/50 hover:bg-red-500/10 transition-all duration-300 hover:scale-105 hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)]"
                  >
                    <div className="relative flex items-center gap-2 text-xs md:text-sm font-[family-name:var(--font-display)] tracking-wider">
                      <LogOut className="w-4 h-4 text-red-500" />
                      <span className="text-red-500 hidden sm:inline">Logout</span>
                    </div>
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/auth"
                    className="group relative px-4 md:px-6 py-2 md:py-3 rounded-full border border-[#3b82f6]/30 backdrop-blur-xl bg-[#12121a]/50 hover:bg-[#1a1a2e]/70 transition-all duration-300 hover:scale-105 hover:border-[#3b82f6]/60 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)] overflow-hidden"
                  >
                    <div className="relative flex items-center gap-2 text-xs md:text-sm font-[family-name:var(--font-display)] tracking-wider">
                      <LogIn className="w-4 h-4 text-[#3b82f6]" />
                      <span className="text-[#3b82f6] hidden sm:inline">Sign In</span>
                    </div>
                  </Link>

            
                </>
              )}
            </div>
          </div>

          <div className="flex md:hidden items-center justify-between">
            <Link href="/" className="flex items-center gap-2">
              {!hideBrandLogo && (
                <img src="/logo.png" alt="DeMedia" className="w-8 h-8 drop-shadow-[0_0_15px_rgba(59,130,246,0.4)]" />
              )}
              <span className="font-[family-name:var(--font-display)] text-xl font-black tracking-wider gradient-text">
                DeMedia
              </span>
            </Link>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="relative w-12 h-12 rounded-full border border-white/10 backdrop-blur-xl bg-[#12121a]/90 flex items-center justify-center transition-all duration-300 hover:scale-110 hover:border-[#3b82f6]/50 z-50"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5 text-[#3b82f6]" /> : <Menu className="w-5 h-5 text-gray-400" />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <>
          {/* Backdrop overlay */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 md:hidden animate-in fade-in duration-300"
            onClick={() => setMobileMenuOpen(false)}
          />

          <div className="fixed top-0 right-0 bottom-0 w-80 max-w-[85vw] z-50 md:hidden animate-in slide-in-from-right duration-300">
            <div className="h-full glass border-l border-white/10 p-6 overflow-y-auto">
              {/* Header */}
              <div className="flex items-center justify-between mb-8">
                <div className="font-[family-name:var(--font-display)] text-2xl font-black gradient-text">DeMedia</div>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-10 h-10 rounded-full border border-white/10 bg-[#12121a]/50 flex items-center justify-center hover:scale-110 transition-transform"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>

              {/* Navigation */}
              <div className="space-y-2 mb-8">
                {iconButtons.map((button, i) => (
                  <Link
                    key={i}
                    href={button.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border border-white/5 bg-[#0a0a0f]/50 hover:bg-[#1a1a2e]/70 hover:border-[#3b82f6]/30 transition-all duration-300 group"
                  >
                    <button.icon className="w-5 h-5 text-gray-400 group-hover:text-[#3b82f6] transition-colors" />
                    <span className="text-gray-300 group-hover:text-white transition-colors">{button.label}</span>
                  </Link>
                ))}
              </div>

              <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8" />

              {/* Auth buttons */}
              <div className="space-y-3">
                {isAuthenticated ? (
                  <>
                    {/* Show wallet address */}
                    <div className="w-full px-4 py-2 rounded-xl border border-[#3b82f6]/30 bg-[#12121a]/50 flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-sm font-mono text-[#3b82f6]">
                        {address?.slice(0, 6)}...{address?.slice(-4)}
                      </span>
                    </div>

                    {/* Logout button */}
                    <button onClick={logout} className="relative w-full py-4 rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-[#0284c7] to-[#dc2626] animate-gradient-shift" />
                      <div className="relative flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-bold tracking-wider">
                        <LogOut className="w-5 h-5 text-white" />
                        <span className="text-white">Logout</span>
                      </div>
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      href="/auth"
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full py-4 rounded-xl border border-[#3b82f6]/30 bg-[#12121a]/50 hover:bg-[#1a1a2e]/70 transition-all duration-300 hover:border-[#3b82f6]/60 block"
                    >
                      <div className="flex items-center justify-center gap-2 font-[family-name:var(--font-display)] tracking-wider">
                        <LogIn className="w-5 h-5 text-[#3b82f6]" />
                        <span className="text-[#3b82f6]">Sign In</span>
                      </div>
                    </Link>

                    <button className="relative w-full py-4 rounded-xl overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3b82f6] via-[#0284c7] to-[#dc2626] animate-gradient-shift" />
                      <div className="relative flex items-center justify-center gap-2 font-[family-name:var(--font-display)] font-bold tracking-wider">
                        <UserPlus className="w-5 h-5 text-white" />
                        <span className="text-white">Sign Up</span>
                      </div>
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  )
}

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
} from "lucide-react"
import { useState, useEffect } from "react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { usePathname } from "next/navigation"

export default function FuturisticNavbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const { isAuthenticated, address, logout } = useAuth()
  const pathname = usePathname()
  const isActivePath = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(`${href}/`)

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 8)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  useEffect(() => {
    setMobileMenuOpen(false)
  }, [pathname])

  const navItems = [
    { icon: Home, label: "Home", href: "/" },
    { icon: Search, label: "Search", href: "/search" },
    { icon: ImageIcon, label: "Gallery", href: "/gallery" },
    { icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" },
    { icon: Library, label: "Content", href: "/content" },
    { icon: Upload, label: "Upload", href: "/upload" },
    { icon: WalletIcon, label: "Wallet", href: "/wallet" },
    { icon: UserCircle, label: "Profile", href: "/profile" },
  ]

  return (
    <>
      <nav
        className={`sticky top-0 z-50 border-b transition-all duration-300 ${
          isScrolled
            ? "border-border/80 bg-background/90 backdrop-blur-xl"
            : "border-transparent bg-background/55 backdrop-blur"
        }`}
      >
        <div className="page-shell flex h-16 items-center justify-between gap-2 sm:gap-4">
          <Link href="/" className="flex items-center gap-3">
            <img src="/demedia-logo.svg" alt="DeMedia" className="h-9 w-9" />
            <span className="hidden font-[family-name:var(--font-display)] text-lg font-semibold tracking-tight text-foreground sm:inline">
              DeMedia
            </span>
          </Link>

          <div className="hidden items-center gap-1 lg:flex">
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActivePath(item.href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          <div className="hidden items-center gap-3 lg:flex">
            {isAuthenticated ? (
              <>
                <div className="rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  {address?.slice(0, 6)}...{address?.slice(-4)}
                </div>
                <button
                  onClick={logout}
                  className="inline-flex items-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground hover:bg-secondary hover:text-foreground"
                >
                  <LogOut className="h-4 w-4" />
                  Logout
                </button>
              </>
            ) : (
              <Link
                href="/auth"
                className="inline-flex items-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:opacity-90"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>

          <button
            onClick={() => setMobileMenuOpen((v) => !v)}
            className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-border/70 bg-card lg:hidden"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="border-b border-border/70 bg-background/95 px-4 py-4 backdrop-blur lg:hidden">
          <div className="page-shell grid gap-2">
            {isAuthenticated && (
              <div className="mb-2 rounded-xl border border-emerald-500/35 bg-emerald-500/10 px-3 py-2 text-center text-xs font-mono text-emerald-600 dark:text-emerald-400">
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </div>
            )}
            {navItems.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={`inline-flex items-center gap-3 rounded-xl px-3 py-2 text-sm font-medium transition ${
                  isActivePath(item.href)
                    ? "bg-primary/15 text-primary"
                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                }`}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            ))}

            {isAuthenticated ? (
              <button
                onClick={logout}
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl border border-border/70 px-3 py-2 text-sm font-medium text-muted-foreground"
              >
                <LogOut className="h-4 w-4" />
                Logout
              </button>
            ) : (
              <Link
                href="/auth"
                className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground"
              >
                <LogIn className="h-4 w-4" />
                Sign in
              </Link>
            )}
          </div>
        </div>
      )}
    </>
  )
}

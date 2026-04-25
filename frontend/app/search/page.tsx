"use client"

import { useState, useEffect } from "react"
import { Search, ExternalLink, ImageIcon } from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import ParallaxOrbBackground from "@/components/parallax-orb-background"
import { useRouter } from "next/navigation"

interface User {
  _id: string
  address: string
  name: string
  avatar: string
  bio: string
}

export default function SearchPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (searchQuery.trim()) {
        searchUsers()
      } else {
        setUsers([])
      }
    }, 300)

    return () => clearTimeout(debounce)
  }, [searchQuery])

  const searchUsers = async () => {
    setLoading(true)
    try {
      console.log("[v0] Searching users with query:", searchQuery)
      const response = await fetch(`/api/user/search?name=${encodeURIComponent(searchQuery)}`)
      const data = await response.json()
      console.log("[v0] Search response:", data)

      if (data.success) {
        console.log("[v0] Found users:", data.data)
        setUsers(data.data)
      } else {
        console.error("[v0] Search failed:", data.message)
        setUsers([])
      }
    } catch (error) {
      console.error("[v0] Failed to search users:", error)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <ParallaxOrbBackground />

      <FuturisticNavbar />

      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-5xl sm:text-6xl font-black tracking-wider mb-6 bg-gradient-to-r from-blue-400 via-purple-400 to-cyan-400 bg-clip-text text-transparent">
              Discover Creators
            </h1>

            {/* Holographic search lens */}
            <div className="relative max-w-2xl mx-auto">
              <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 blur-2xl" />

              <div className="relative rounded-full border border-white/10 bg-black/40 backdrop-blur-xl p-2 shadow-2xl">
                <div className="flex items-center gap-4 px-6">
                  <Search className="w-6 h-6 text-blue-400 flex-shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search creators by name..."
                    className="flex-1 bg-transparent py-4 text-white placeholder-gray-500 outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          {loading ? (
            <div className="text-center text-gray-400 py-12">
              <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-blue-500/20 border-t-blue-500" />
              <p className="mt-4">Searching...</p>
            </div>
          ) : users.length > 0 ? (
            <div className="space-y-4">
              {users.map((user, index) => (
                <div
                  key={user._id}
                  className="group relative animate-in fade-in slide-in-from-bottom-4 duration-500 cursor-pointer"
                  style={{ animationDelay: `${index * 50}ms` }}
                  onClick={() => router.push(`/profile/${user.address}`)}
                >
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 via-purple-500/20 to-cyan-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-xl" />

                  <div className="relative rounded-2xl border border-white/10 bg-black/40 backdrop-blur-xl p-6 shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
                    <div className="flex items-center gap-6">
                      {/* Avatar */}
                      <div className="relative w-16 h-16 rounded-full overflow-hidden border-2 border-blue-500/30 shadow-lg flex-shrink-0">
                        {user.avatar ? (
                          <img
                            src={user.avatar || "/placeholder.svg"}
                            alt={user.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <ImageIcon className="w-8 h-8 text-gray-500" />
                          </div>
                        )}
                      </div>

                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <h3 className="text-xl font-bold text-white mb-1 truncate">{user.name || "Unnamed User"}</h3>
                        <p className="text-sm text-gray-400 font-mono mb-2">
                          {user.address.slice(0, 8)}...{user.address.slice(-6)}
                        </p>
                        {user.bio && <p className="text-sm text-gray-500 line-clamp-1">{user.bio}</p>}
                      </div>

                      {/* View button */}
                      <div className="flex-shrink-0">
                        <button className="p-3 rounded-xl border border-blue-500/30 bg-blue-500/10 text-blue-400 hover:bg-blue-500/20 transition-all group-hover:scale-110">
                          <ExternalLink className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : searchQuery ? (
            <div className="text-center text-gray-400 py-12">
              <p>No creators found matching "{searchQuery}"</p>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-12">
              <p>Start typing to search for creators</p>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

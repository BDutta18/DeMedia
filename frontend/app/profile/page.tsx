"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import IdentityMatrixBackground from "@/components/identity-matrix-background"
import { Upload, Save, RotateCcw, CheckCircle, AlertCircle, User, Mail, FileText, ImageIcon, ExternalLink } from "lucide-react"
import { resolveMediaUrl } from "@/lib/media"
interface ProfileData {
  name: string
  email: string
  avatar: string
  bio: string
  banner: string
  accentColor: string
  showcaseTitle: string
}

interface OwnedNFT {
  _id: string
  name: string
  description: string
  imageURL: string
  tokenId: string
  txHash: string
  createdAt: string
}

export default function ProfilePage() {
  const { isAuthenticated, token, address, isLoading } = useAuth()
  const router = useRouter()
  const [formData, setFormData] = useState<ProfileData>({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    banner: "",
    accentColor: "#3b82f6",
    showcaseTitle: "My Creation Vault",
  })
  const [initialData, setInitialData] = useState<ProfileData>({
    name: "",
    email: "",
    avatar: "",
    bio: "",
    banner: "",
    accentColor: "#3b82f6",
    showcaseTitle: "My Creation Vault",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [charCount, setCharCount] = useState(0)
  const [isDragging, setIsDragging] = useState(false)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarPreview, setAvatarPreview] = useState<string>("")
  const [ownedNfts, setOwnedNfts] = useState<OwnedNFT[]>([])
  const [nftsLoading, setNftsLoading] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    const fetchProfileData = async () => {
      if (!address) return

      try {
        const response = await fetch(`/api/user/profile/${address}`)
        const data = await response.json()

        if (data.success && data.user) {
          const profileData = {
            name: data.user.name || "",
            email: data.user.email || "",
            avatar: data.user.avatar || "",
            bio: data.user.bio || "",
            banner: data.user.banner || "",
            accentColor: data.user.accentColor || "#3b82f6",
            showcaseTitle: data.user.showcaseTitle || "My Creation Vault",
          }
          setFormData(profileData)
          setInitialData(profileData)
          setCharCount(data.user.bio?.length || 0)
          setAvatarPreview(data.user.avatar || "")
        }
      } catch (error) {
        console.error("[v0] Failed to fetch profile:", error)
      }
    }

    if (isAuthenticated && address) {
      fetchProfileData()
    }
  }, [isAuthenticated, address])

  useEffect(() => {
    const fetchOwnedNfts = async () => {
      if (!isAuthenticated || !token) {
        setOwnedNfts([])
        setNftsLoading(false)
        return
      }

      try {
        setNftsLoading(true)
        const response = await fetch("/api/nfts/my-nfts", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok && data.success) {
          setOwnedNfts(data.data || [])
        } else {
          setOwnedNfts([])
        }
      } catch (_error) {
        setOwnedNfts([])
      } finally {
        setNftsLoading(false)
      }
    }

    fetchOwnedNfts()
  }, [isAuthenticated, token])

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, isLoading, router])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (name === "bio") {
      setCharCount(value.length)
    }
    if (name === "avatar") {
      setAvatarPreview(value)
      setAvatarFile(null)
    }
  }

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)

    const file = e.dataTransfer.files[0]
    if (file && file.type.startsWith("image/")) {
      handleFileSelect(file)
    } else {
      setError("Please drop a valid image file")
    }
  }

  const handleFileSelect = (file: File) => {
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onloadend = () => {
      setAvatarPreview(reader.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleReset = () => {
    setFormData(initialData)
    setCharCount(initialData.bio.length)
    setAvatarPreview(initialData.avatar)
    setAvatarFile(null)
    setError(null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError(null)

    try {
      let avatarUrl = formData.avatar

      if (avatarFile) {
        const form = new FormData()
        form.append("file", avatarFile)
        const uploadResponse = await fetch("/api/upload/avatar", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: form,
        })

        const uploadData = await uploadResponse.json()
        if (!uploadResponse.ok || !uploadData?.imageURL) {
          throw new Error(uploadData?.error || "Avatar upload failed")
        }

        avatarUrl = uploadData.imageURL
      }

      const response = await fetch("/api/profile/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          avatar: avatarUrl,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update profile")
      }

      setInitialData((prev) => ({ ...prev, ...formData, avatar: avatarUrl }))
      setFormData((prev) => ({ ...prev, avatar: avatarUrl }))
      setAvatarPreview(avatarUrl)

      setShowSuccess(true)
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update profile")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !isAuthenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <IdentityMatrixBackground />
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-[#3b82f6] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-400 font-mono">Loading profile...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-12 px-4">      <IdentityMatrixBackground />

      <div className="max-w-6xl mx-auto mb-12 text-center animate-in fade-in slide-in-from-top duration-700">
        <h1 className="text-4xl md:text-6xl font-[family-name:var(--font-display)] font-black mb-4 bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#fbbf24] bg-clip-text text-transparent">
          IDENTITY REFORGED
        </h1>
        <p className="text-gray-400 text-sm md:text-base font-mono max-w-2xl mx-auto">
          Customize your decentralized creator identity in the metaverse
        </p>
        <div className="mt-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-[#3b82f6]/30 backdrop-blur-xl bg-[#12121a]/50">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs font-mono text-[#3b82f6]">
            {address?.slice(0, 6)}...{address?.slice(-4)}
          </span>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="max-w-6xl mx-auto">
        <div className="mb-8 rounded-3xl border border-white/10 p-4 md:p-6" style={{ background: "rgba(10,10,15,0.55)" }}>
          <p className="mb-4 text-sm font-semibold uppercase tracking-wider text-gray-400">Profile Preview</p>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <div
              className="h-28 w-full"
              style={{
                backgroundImage: `linear-gradient(135deg, ${formData.accentColor}66, #0a0a0f), url('${resolveMediaUrl(formData.banner)}')`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            />
            <div className="-mt-10 flex items-end gap-4 p-4 md:p-6">
              <img
                src={resolveMediaUrl(avatarPreview || formData.avatar)}
                alt="Preview avatar"
                className="h-20 w-20 rounded-full border-4 border-[#0a0a0f] object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder.svg"
                }}
              />
              <div>
                <h3 className="text-xl font-bold text-white">{formData.name || "Your Name"}</h3>
                <p className="text-sm text-gray-400">{formData.showcaseTitle || "My Creation Vault"}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-6 md:gap-8">
          <div className="space-y-6 animate-in fade-in slide-in-from-left duration-700 delay-100">
            <div className="glass rounded-3xl p-6 md:p-8 group hover:border-[#3b82f6]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Profile Avatar</h2>
              </div>

              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`relative aspect-square w-48 mx-auto mb-6 cursor-pointer transition-all duration-300 ${
                  isDragging ? "scale-105" : ""
                }`}
              >
                <div className="absolute inset-0 rounded-full bg-gradient-to-br from-[#00d4ff] via-[#7c3aed] to-[#fbbf24] animate-spin-slow opacity-50 blur-xl" />
                <div
                  className={`relative w-full h-full rounded-full border-4 ${
                    isDragging ? "border-[#3b82f6] scale-105" : "border-[#3b82f6]/30"
                  } overflow-hidden backdrop-blur-xl bg-[#12121a]/80 flex items-center justify-center group-hover:border-[#3b82f6]/60 transition-all duration-500`}
                >
                  {avatarPreview ? (
                    <img
                      src={resolveMediaUrl(avatarPreview)}
                      alt="Avatar"
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = "/placeholder.svg"
                      }}
                    />
                  ) : (
                    <User className="w-20 h-20 text-gray-600" />
                  )}
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center">
                    <Upload className="w-8 h-8 text-white mb-2" />
                    <span className="text-xs text-white font-mono">Drop image or click</span>
                  </div>
                  {isDragging && (
                    <div className="absolute inset-0 bg-[#3b82f6]/20 flex items-center justify-center">
                      <span className="text-white font-mono text-sm">Drop to upload</span>
                    </div>
                  )}
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileInputChange}
                className="hidden"
              />

              <input
                type="text"
                name="avatar"
                value={formData.avatar}
                onChange={handleInputChange}
                placeholder="Or enter avatar URL (IPFS/https)"
                className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#3b82f6]/20 text-white font-mono text-sm focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30 outline-none transition-all duration-300"
              />
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#3b82f6]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                  <User className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Display Name</h2>
              </div>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Enter your display name"
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-[#3b82f6]/20 text-white text-lg focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30 outline-none transition-all duration-300 hover:-translate-y-0.5"
              />
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#3b82f6]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(59,130,246,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#00d4ff] to-[#7c3aed] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Banner URL</h2>
              </div>
              <input
                type="text"
                name="banner"
                value={formData.banner}
                onChange={handleInputChange}
                placeholder="https://... or ipfs://..."
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-[#3b82f6]/20 text-white text-lg focus:border-[#3b82f6] focus:ring-2 focus:ring-[#3b82f6]/30 outline-none transition-all duration-300 hover:-translate-y-0.5"
              />
            </div>
          </div>

          <div className="space-y-6 animate-in fade-in slide-in-from-right duration-700 delay-200">
            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#7c3aed]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(124,58,237,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#fbbf24] flex items-center justify-center">
                  <Mail className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Email Address</h2>
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                placeholder="your.email@example.com"
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-[#7c3aed]/20 text-white text-lg focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 outline-none transition-all duration-300 hover:-translate-y-0.5"
              />
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#7c3aed]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(124,58,237,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#7c3aed] to-[#fbbf24] flex items-center justify-center">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Showcase Title</h2>
              </div>
              <input
                type="text"
                name="showcaseTitle"
                value={formData.showcaseTitle}
                onChange={handleInputChange}
                placeholder="My Creation Vault"
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-[#7c3aed]/20 text-white text-lg focus:border-[#7c3aed] focus:ring-2 focus:ring-[#7c3aed]/30 outline-none transition-all duration-300 hover:-translate-y-0.5"
              />
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#fbbf24]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(251,191,36,0.2)]">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#00d4ff] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5 text-white" />
                </div>
                <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Accent Color</h2>
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="color"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleInputChange}
                  className="h-12 w-14 rounded-xl border border-white/20 bg-transparent"
                />
                <input
                  type="text"
                  name="accentColor"
                  value={formData.accentColor}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 rounded-xl bg-white/5 border border-[#fbbf24]/20 text-white font-mono focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/30 outline-none"
                />
              </div>
            </div>

            <div className="glass rounded-3xl p-6 md:p-8 hover:border-[#fbbf24]/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(251,191,36,0.2)]">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-[#fbbf24] to-[#00d4ff] flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-[family-name:var(--font-display)] font-bold text-white">Bio</h2>
                </div>
                <span
                  className={`text-xs font-mono ${
                    charCount > 200 ? "text-red-400" : "text-gray-500"
                  } transition-colors duration-300`}
                >
                  {charCount}/250
                </span>
              </div>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                placeholder="Tell the world about yourself... Web3 enthusiast, creator, builder..."
                maxLength={250}
                rows={6}
                className="w-full px-6 py-4 rounded-2xl bg-white/5 border border-[#fbbf24]/20 text-white text-lg focus:border-[#fbbf24] focus:ring-2 focus:ring-[#fbbf24]/30 outline-none transition-all duration-300 resize-none scrollbar-hide hover:-translate-y-0.5"
              />
            </div>
          </div>
        </div>

        <div className="fixed bottom-6 right-6 flex items-center gap-4 z-50 animate-in fade-in slide-in-from-bottom duration-700 delay-300">
          <button
            type="button"
            onClick={handleReset}
            className="px-6 py-3 rounded-full border border-red-500/30 backdrop-blur-xl bg-[#12121a]/90 hover:bg-red-500/10 transition-all duration-300 hover:scale-105 hover:border-red-500/60 hover:shadow-[0_0_20px_rgba(220,38,38,0.3)] group"
          >
            <div className="flex items-center gap-2">
              <RotateCcw className="w-5 h-5 text-red-500 group-hover:rotate-180 transition-transform duration-500" />
              <span className="text-red-500 font-[family-name:var(--font-display)] font-bold">Reset</span>
            </div>
          </button>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-8 py-3 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(59,130,246,0.5)] group relative disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-[#00d4ff] via-[#7c3aed] to-[#fbbf24] animate-gradient-shift" />
            <div className="relative flex items-center gap-2 font-[family-name:var(--font-display)] font-bold text-white">
              {isSubmitting ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Save Changes</span>
                </>
              )}
            </div>
          </button>
        </div>
      </form>

      <section className="max-w-6xl mx-auto mt-10">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-[family-name:var(--font-display)] font-bold text-white">Owned NFTs</h2>
            <p className="text-sm text-gray-400">Everything this profile currently owns</p>
          </div>
          <div className="text-sm text-[#3b82f6] font-mono">{ownedNfts.length} items</div>
        </div>

        {nftsLoading ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">Loading owned NFTs...</div>
        ) : ownedNfts.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-gray-400">No owned NFTs yet.</div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ownedNfts.map((nft) => (
              <article
                key={nft._id}
                className="group rounded-2xl border border-white/10 bg-black/40 p-4 backdrop-blur-xl transition-all duration-300 hover:border-[#3b82f6]/40 hover:shadow-[0_0_25px_rgba(59,130,246,0.25)]"
              >
                <div className="mb-4 overflow-hidden rounded-xl border border-white/10 aspect-square">
                  <img
                    src={resolveMediaUrl(nft.imageURL)}
                    alt={nft.name}
                    className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.src = "/placeholder.svg"
                    }}
                  />
                </div>

                <h3 className="text-lg font-semibold text-white truncate">{nft.name}</h3>
                <p className="mt-1 text-sm text-gray-400 line-clamp-2">{nft.description}</p>

                <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                  <span>Token #{nft.tokenId}</span>
                  <a
                    href={`https://stellar.expert/explorer/testnet/tx/${nft.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[#3b82f6] hover:text-[#60a5fa]"
                  >
                    Tx
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {showSuccess && (
        <div className="fixed top-24 right-6 glass rounded-2xl p-6 max-w-md z-50 animate-in slide-in-from-right duration-500">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center flex-shrink-0">
              <CheckCircle className="w-6 h-6 text-green-500" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-white mb-1">Profile Updated!</h3>
              <p className="text-sm text-gray-400">Your identity has been successfully reforged.</p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="fixed top-24 right-6 glass rounded-2xl p-6 max-w-md z-50 animate-in slide-in-from-right duration-500 border-red-500/30">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center flex-shrink-0">
              <AlertCircle className="w-6 h-6 text-red-500" />
            </div>
            <div>
              <h3 className="font-[family-name:var(--font-display)] font-bold text-white mb-1">Update Failed</h3>
              <p className="text-sm text-gray-400">{error}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}



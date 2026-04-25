"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Upload, Check, FileText, X } from "lucide-react"
import FuturisticNavbar from "@/components/futuristic-navbar"
import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { resolveMediaUrl } from "@/lib/media"

export default function UploadMintPage() {
  const { isAuthenticated } = useAuth()
  const router = useRouter()
  const [isDragging, setIsDragging] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [isUploading, setIsUploading] = useState(false)
  const [uploadSuccess, setUploadSuccess] = useState(false)
  const [uploadedNFT, setUploadedNFT] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth")
    }
  }, [isAuthenticated, router])

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }
    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  const handleFileSelect = (file: File) => {
    setSelectedFile(file)
    setError(null)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files[0]
    if (file) {
      handleFileSelect(file)
    }
  }

  const handleUpload = async () => {
    if (!selectedFile || !name || !description) {
      setError("Please fill all fields")
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      const token = localStorage.getItem("demedia_token")
      if (!token) {
        throw new Error("Authentication token not found. Please sign in again.")
      }

      const formData = new FormData()
      formData.append("file", selectedFile)
      formData.append("name", name)
      formData.append("description", description)

      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const data = await response.json()

      if (!response.ok) {
        const parts = [data.message || data.error || "Upload failed"]
        if (data.code) parts.push(`Code: ${data.code}`)
        if (data.detail) parts.push(`Detail: ${data.detail}`)
        if (data.action) parts.push(data.action)
        throw new Error(parts.filter(Boolean).join(" | "))
      }

      setUploadedNFT(data.nft)
      setUploadSuccess(true)
    } catch (err: any) {
      console.error("[v0] Upload error:", err)
      setError(err.message || "Failed to upload content")
    } finally {
      setIsUploading(false)
    }
  }

  const resetForm = () => {
    setSelectedFile(null)
    setName("")
    setDescription("")
    setUploadSuccess(false)
    setUploadedNFT(null)
    setError(null)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <>
      <div className="fixed inset-0 bg-[#0a0a0f]" onMouseMove={(e) => setMousePosition({ x: e.clientX, y: e.clientY })}>
        {/* Cursor spotlight effect */}
        <div
          className="absolute w-96 h-96 rounded-full opacity-20 blur-3xl transition-all duration-300 pointer-events-none"
          style={{
            background: `radial-gradient(circle, ${"rgba(59, 130, 246, 0.6)"} 0%, transparent 70%)`,
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
          }}
        />

        {/* Ambient gradient based on step */}
        <div
          className="absolute inset-0 transition-all duration-1000"
          style={{
            background: "radial-gradient(circle at 50% 50%, #0284c715 0%, transparent 50%)",
          }}
        />

        {/* Floating light particles with varied sizes and colors */}
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full animate-float opacity-20"
            style={{
              width: Math.random() * 4 + 2 + "px",
              height: Math.random() * 4 + 2 + "px",
              left: Math.random() * 100 + "%",
              top: Math.random() * 100 + "%",
              background: i % 3 === 0 ? "#3b82f6" : i % 3 === 1 ? "#b624ff" : "#00d4ff",
              animationDelay: Math.random() * 5 + "s",
              animationDuration: Math.random() * 20 + 15 + "s",
            }}
          />
        ))}
      </div>

      <FuturisticNavbar />

      <main className="relative min-h-screen pt-32 pb-20 px-4 sm:px-6 lg:px-8 max-w-[100vw] overflow-x-hidden">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1
              className="text-5xl sm:text-6xl md:text-7xl font-black tracking-wider mb-4"
              style={{
                letterSpacing: "0.12em",
                background: "linear-gradient(135deg, #00d4ff 0%, #b624ff 50%, #3b82f6 100%)",
                backgroundSize: "200% 200%",
                WebkitBackgroundClip: "text",
                backgroundClip: "text",
                WebkitTextFillColor: "transparent",
                animation: "gradient-shift 6s ease infinite",
              }}
            >
              {uploadSuccess ? "NFT MINTED!" : "CREATE & MINT"}
            </h1>
            <p className="text-gray-400 text-base">
              {uploadSuccess ? "Your content has been tokenized" : "Tokenize your content on the blockchain"}
            </p>
          </div>

          {!uploadSuccess ? (
            <div
              className="relative rounded-3xl p-8 md:p-12 transition-all duration-700"
              style={{
                background: "linear-gradient(135deg, rgba(18, 18, 26, 0.7) 0%, rgba(10, 10, 15, 0.9) 100%)",
                backdropFilter: "blur(60px)",
                boxShadow:
                  "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 60px rgba(59, 130, 246, 0.15), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(59, 130, 246, 0.2)",
              }}
            >
              {/* File Upload Zone */}
              <div className="space-y-8">
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse" />
                    Upload File
                  </label>
                  <div
                    className={`relative border-2 border-dashed rounded-3xl p-12 transition-all duration-500 cursor-pointer overflow-hidden group ${
                      isDragging
                        ? "border-cyan-400 scale-105 bg-gradient-to-br from-cyan-500/10 to-purple-500/10"
                        : "border-blue-500/40 hover:border-blue-500/80"
                    }`}
                    onDragOver={(e) => {
                      e.preventDefault()
                      setIsDragging(true)
                    }}
                    onDragLeave={() => setIsDragging(false)}
                    onDrop={handleDrop}
                    onClick={() => document.getElementById("fileInput")?.click()}
                    style={{
                      background: isDragging
                        ? "linear-gradient(135deg, rgba(0, 212, 255, 0.1) 0%, rgba(182, 36, 255, 0.1) 100%)"
                        : "linear-gradient(135deg, rgba(10, 10, 15, 0.6) 0%, rgba(17, 17, 34, 0.8) 100%)",
                      boxShadow: isDragging
                        ? "0 0 80px rgba(0, 212, 255, 0.4), inset 0 0 60px rgba(182, 36, 255, 0.1)"
                        : "inset 0 2px 20px rgba(0, 0, 0, 0.3)",
                    }}
                  >
                    <input
                      id="fileInput"
                      type="file"
                      className="hidden"
                      accept="image/*,video/*,audio/*,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileSelect(file)
                      }}
                    />

                    <div className="relative text-center z-10">
                      {selectedFile ? (
                        <div className="flex items-center justify-center gap-4">
                          <FileText className="w-12 h-12 text-blue-400" />
                          <div className="text-left">
                            <div className="text-white font-semibold text-lg">{selectedFile.name}</div>
                            <div className="text-sm text-gray-400">
                              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                            </div>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              setSelectedFile(null)
                            }}
                            className="p-2 rounded-full hover:bg-red-500/20 transition-colors"
                          >
                            <X className="w-5 h-5 text-red-400" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <div className="w-20 h-20 mx-auto mb-6 relative">
                            <Upload className="w-full h-full text-blue-400 animate-float" />
                            <div className="absolute inset-0 blur-xl bg-blue-400/30 animate-glow-pulse" />
                          </div>
                          <p className="text-xl text-white mb-2 font-bold">Drag & drop your file here</p>
                          <p className="text-sm text-gray-400">or click to select from your device</p>
                          <div className="mt-4 flex flex-wrap justify-center gap-2 text-xs text-gray-500">
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Images</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Videos</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Audio</span>
                            <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10">Documents</span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Name Input - Hexagonal Style */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-purple-500 animate-pulse" />
                    NFT Name
                  </label>
                  <div className="relative group">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Enter a captivating name..."
                      className="w-full px-6 py-5 rounded-2xl text-gray-100 outline-none transition-all duration-300 clip-hex"
                      style={{
                        background: "linear-gradient(135deg, rgba(182, 36, 255, 0.05) 0%, rgba(10, 10, 15, 0.8) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(182, 36, 255, 0.2)",
                        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.3)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(182, 36, 255, 0.6)"
                        e.currentTarget.style.boxShadow =
                          "0 0 30px rgba(182, 36, 255, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.3)"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(182, 36, 255, 0.2)"
                        e.currentTarget.style.boxShadow = "inset 0 2px 10px rgba(0, 0, 0, 0.3)"
                      }}
                    />
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-500/0 via-purple-500/20 to-purple-500/0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
                  </div>
                </div>

                {/* Description Textarea - Rounded Corners with Parallax */}
                <div>
                  <label className="block text-sm font-medium text-gray-400 mb-3 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
                    Description
                  </label>
                  <div className="relative group">
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Describe your content's story and vision..."
                      rows={6}
                      className="w-full px-6 py-5 rounded-2xl text-gray-100 outline-none transition-all duration-300 resize-none"
                      style={{
                        background: "linear-gradient(135deg, rgba(0, 212, 255, 0.05) 0%, rgba(10, 10, 15, 0.8) 100%)",
                        backdropFilter: "blur(20px)",
                        border: "1px solid rgba(0, 212, 255, 0.2)",
                        boxShadow: "inset 0 2px 10px rgba(0, 0, 0, 0.3)",
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(0, 212, 255, 0.6)"
                        e.currentTarget.style.boxShadow =
                          "0 0 30px rgba(0, 212, 255, 0.3), inset 0 2px 10px rgba(0, 0, 0, 0.3)"
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.border = "1px solid rgba(0, 212, 255, 0.2)"
                        e.currentTarget.style.boxShadow = "inset 0 2px 10px rgba(0, 0, 0, 0.3)"
                      }}
                    />
                    <div className="absolute bottom-3 right-3 text-xs text-gray-500">
                      {description.length} characters
                    </div>
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
                    {error}
                  </div>
                )}

                {/* Upload Button */}
                <button
                  onClick={handleUpload}
                  disabled={isUploading || !selectedFile || !name || !description}
                  className="relative w-full py-5 rounded-2xl font-bold text-lg overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: "linear-gradient(135deg, #3b82f6 0%, #b624ff 100%)",
                    boxShadow: "0 0 40px rgba(59, 130, 246, 0.6), 0 20px 60px rgba(0, 0, 0, 0.8)",
                  }}
                >
                  <span className="relative z-10 text-white flex items-center justify-center gap-3">
                    {isUploading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Minting NFT...
                      </>
                    ) : (
                      <>
                        <Upload className="w-5 h-5" />
                        Mint NFT
                      </>
                    )}
                  </span>
                  {!isUploading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                  )}
                </button>
              </div>
            </div>
          ) : (
            // Success State
            <div
              className="relative rounded-3xl p-12 text-center"
              style={{
                background: "linear-gradient(135deg, rgba(18, 18, 26, 0.7) 0%, rgba(10, 10, 15, 0.9) 100%)",
                backdropFilter: "blur(60px)",
                boxShadow:
                  "0 30px 80px rgba(0, 0, 0, 0.9), 0 0 60px rgba(34, 197, 94, 0.3), inset 0 1px 1px rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(34, 197, 94, 0.3)",
              }}
            >
              <div className="relative inline-block mb-8">
                <div
                  className="w-24 h-24 mx-auto rounded-full flex items-center justify-center"
                  style={{
                    background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    boxShadow: "0 0 60px rgba(34, 197, 94, 0.8), 0 0 100px rgba(34, 197, 94, 0.4)",
                  }}
                >
                  <Check className="w-12 h-12 text-white" />
                </div>

                {/* Expanding rings */}
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="absolute inset-0 rounded-full border-2 border-green-500 animate-ping"
                    style={{
                      animationDelay: `${i * 0.3}s`,
                      animationDuration: "2s",
                    }}
                  />
                ))}
              </div>

              <h2 className="text-4xl font-bold text-white mb-4">NFT Minted Successfully!</h2>
              <p className="text-gray-400 mb-8">Your content has been tokenized on the blockchain</p>

              {uploadedNFT && (
                <div className="space-y-4 mb-8">
                  <div className="p-6 rounded-xl bg-white/5 border border-white/10 text-left space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Name:</span>
                      <span className="text-white font-semibold">{uploadedNFT.name}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Token ID:</span>
                      <span className="text-cyan-400 font-mono">#{uploadedNFT.tokenId}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-400">Transaction:</span>
                      <a
                        href={`https://stellar.expert/explorer/testnet/tx/${uploadedNFT.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 hover:text-blue-300 font-mono text-sm"
                      >
                        {uploadedNFT.txHash.slice(0, 10)}...{uploadedNFT.txHash.slice(-8)}
                      </a>
                    </div>
                    {uploadedNFT.imageURL && (
                      <div className="pt-4 border-t border-white/10">
                        <img
                          src={resolveMediaUrl(uploadedNFT.imageURL)}
                          alt={uploadedNFT.name}
                          className="w-full h-48 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.src = "/placeholder.svg"
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={() => router.push("/content")}
                  className="flex-1 px-6 py-4 rounded-xl font-bold bg-gradient-to-r from-blue-500 to-cyan-500 text-white hover:shadow-lg transition-all"
                >
                  View in Library
                </button>
                <button
                  onClick={resetForm}
                  className="flex-1 px-6 py-4 rounded-xl font-bold border border-white/10 bg-white/5 text-white hover:bg-white/10 transition-all"
                >
                  Create Another
                </button>
              </div>
            </div>
          )}
        </div>
      </main>
    </>
  )
}

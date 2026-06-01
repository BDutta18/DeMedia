"use client"

import type React from "react"
import { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { AlertCircle, CheckCircle2, ImageIcon, UploadCloud } from "lucide-react"
import { FeatureShell } from "@/components/feature-shell"
import { useAuth } from "@/lib/auth-context"

type UploadState = "idle" | "uploading" | "success" | "error"

export default function UploadPage() {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAuth()
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState("")
  const [status, setStatus] = useState<UploadState>("idle")
  const [message, setMessage] = useState("")

  useEffect(() => {
    if (!isLoading && !isAuthenticated) router.push("/auth")
  }, [isAuthenticated, isLoading, router])

  const previewUrl = useMemo(() => {
    if (!file || !file.type.startsWith("image/")) return ""
    return URL.createObjectURL(file)
  }, [file])

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!file) {
      setStatus("error")
      setMessage("Choose a media file before uploading.")
      return
    }

    setStatus("uploading")
    setMessage("Uploading media, pinning metadata, and minting ownership...")

    try {
      const token = localStorage.getItem("demedia_token")
      if (!token) throw new Error("Sign in again to upload content.")

      const formData = new FormData()
      formData.append("file", file)
      formData.append("name", name.trim())
      formData.append("description", description.trim())
      if (price.trim()) formData.append("price", price.trim())

      const response = await fetch("/api/upload", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await response.json().catch(() => ({}))

      if (!response.ok || !data.success) {
        throw new Error(data.action || data.message || data.error || "Upload failed.")
      }

      setStatus("success")
      setMessage("Upload complete. Your content is now registered and minted.")
      setFile(null)
      setName("")
      setDescription("")
      setPrice("")
    } catch (error) {
      setStatus("error")
      setMessage(error instanceof Error ? error.message : "Upload failed.")
    }
  }

  if (isLoading || !isAuthenticated) return null

  return (
    <FeatureShell
      eyebrow="Creator upload"
      title="Register media, mint ownership, and publish with proof."
      description="Upload your content once and let DeMedia handle file pinning, metadata creation, blockchain registration, and NFT minting."
      stats={[
        ["Storage", "IPFS pinned"],
        ["Proof", "Content hash"],
        ["Mint", "Stellar NFT"],
      ]}
    >
      <form onSubmit={submit} className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <label className="group flex min-h-[420px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-white/20 bg-white/[0.05] p-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.22)] transition hover:border-cyan-300/60 hover:bg-white/[0.08]">
          <input
            type="file"
            accept="image/*,video/*,audio/*"
            className="sr-only"
            onChange={(event) => {
              setFile(event.target.files?.[0] ?? null)
              setStatus("idle")
              setMessage("")
            }}
          />
          {previewUrl ? (
            <img src={previewUrl} alt="Selected media preview" className="h-full max-h-[340px] w-full rounded-2xl object-cover" />
          ) : (
            <>
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl border border-white/10 bg-black/25">
                <UploadCloud className="h-9 w-9 text-cyan-200" />
              </div>
              <h2 className="mt-6 text-2xl font-semibold">Drop your media here</h2>
              <p className="mt-3 max-w-sm text-sm leading-6 text-zinc-400">
                Choose image, video, or audio content to create a verified DeMedia asset.
              </p>
            </>
          )}
          {file ? (
            <div className="mt-5 flex max-w-full items-center gap-2 rounded-full border border-white/10 bg-black/25 px-4 py-2 text-sm text-zinc-300">
              <ImageIcon className="h-4 w-4 text-cyan-200" />
              <span className="truncate">{file.name}</span>
            </div>
          ) : null}
        </label>

        <div className="rounded-2xl border border-white/10 bg-white/[0.05] p-6 shadow-[0_20px_60px_rgba(0,0,0,0.22)] backdrop-blur">
          <div className="grid gap-5">
            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Asset name</span>
              <input
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
                placeholder="Cinematic creator drop"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                required
                rows={6}
                placeholder="Describe the story, rights, or context behind this media."
                className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>

            <label>
              <span className="text-xs uppercase tracking-[0.14em] text-zinc-500">Price in XLM</span>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="decimal"
                placeholder="Optional"
                className="mt-2 w-full rounded-xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-zinc-600 focus:border-cyan-300/60"
              />
            </label>
          </div>

          {message ? (
            <div className={`mt-5 flex gap-3 rounded-2xl border p-4 text-sm ${status === "error" ? "border-red-400/30 bg-red-500/10 text-red-100" : status === "success" ? "border-emerald-400/30 bg-emerald-500/10 text-emerald-100" : "border-white/10 bg-black/25 text-zinc-300"}`}>
              {status === "success" ? <CheckCircle2 className="h-5 w-5 shrink-0" /> : <AlertCircle className="h-5 w-5 shrink-0" />}
              <p>{message}</p>
            </div>
          ) : null}

          <div className="mt-6 flex flex-wrap gap-3">
            <button
              type="submit"
              disabled={status === "uploading"}
              className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-black transition hover:bg-cyan-100 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {status === "uploading" ? "Uploading..." : "Upload and Mint"}
            </button>
            <Link href="/content" className="rounded-full border border-white/15 bg-white/[0.06] px-6 py-3 text-sm font-semibold text-white transition hover:border-cyan-300/50">
              View Library
            </Link>
          </div>
        </div>
      </form>
    </FeatureShell>
  )
}

"use client"

import { useEffect, useRef } from "react"

export default function ArchiveBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Liquid wave particles
    const waves: Array<{
      x: number
      y: number
      radius: number
      vx: number
      vy: number
      color: string
      alpha: number
    }> = []

    for (let i = 0; i < 80; i++) {
      waves.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: 2 + Math.random() * 4,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        color: ["#3b82f6", "#0284c7", "#dc2626", "#1e40af"][Math.floor(Math.random() * 4)],
        alpha: 0.3 + Math.random() * 0.7,
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      waves.forEach((wave, i) => {
        wave.x += wave.vx
        wave.y += wave.vy

        if (wave.x < 0 || wave.x > canvas.width) wave.vx *= -1
        if (wave.y < 0 || wave.y > canvas.height) wave.vy *= -1

        // Draw wave particle with glow
        ctx.beginPath()
        ctx.arc(wave.x, wave.y, wave.radius, 0, Math.PI * 2)
        ctx.fillStyle = wave.color
        ctx.globalAlpha = wave.alpha
        ctx.shadowBlur = 30
        ctx.shadowColor = wave.color
        ctx.fill()
        ctx.shadowBlur = 0
        ctx.globalAlpha = 1

        // Connect nearby particles with gradient lines
        for (let j = i + 1; j < waves.length; j++) {
          const other = waves[j]
          const dx = wave.x - other.x
          const dy = wave.y - other.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 200) {
            const gradient = ctx.createLinearGradient(wave.x, wave.y, other.x, other.y)
            gradient.addColorStop(0, wave.color)
            gradient.addColorStop(1, other.color)

            ctx.beginPath()
            ctx.moveTo(wave.x, wave.y)
            ctx.lineTo(other.x, other.y)
            ctx.strokeStyle = gradient
            ctx.globalAlpha = (1 - distance / 200) * 0.2
            ctx.lineWidth = 1
            ctx.stroke()
            ctx.globalAlpha = 1
          }
        }
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationId)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-60" style={{ zIndex: 0 }} />
}

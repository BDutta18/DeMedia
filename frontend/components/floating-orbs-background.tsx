"use client"

import { useEffect, useRef } from "react"

export default function FloatingOrbsBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    const orbs: Array<{
      x: number
      y: number
      vx: number
      vy: number
      radius: number
      color: string
    }> = []

    for (let i = 0; i < 8; i++) {
      orbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 150 + 100,
        color: ["#3b82f6", "#0284c7", "#dc2626"][Math.floor(Math.random() * 3)],
      })
    }

    let animationId: number

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      orbs.forEach((orb) => {
        orb.x += orb.vx
        orb.y += orb.vy

        if (orb.x - orb.radius < 0 || orb.x + orb.radius > canvas.width) orb.vx *= -1
        if (orb.y - orb.radius < 0 || orb.y + orb.radius > canvas.height) orb.vy *= -1

        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.radius)
        gradient.addColorStop(0, orb.color + "40")
        gradient.addColorStop(0.5, orb.color + "20")
        gradient.addColorStop(1, orb.color + "00")

        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(orb.x, orb.y, orb.radius, 0, Math.PI * 2)
        ctx.fill()
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none" style={{ zIndex: 0 }} />
}

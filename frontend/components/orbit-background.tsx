"use client"

import { useEffect, useRef } from "react"

export default function OrbitBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Orbiting particles in circular paths
    const orbitals: Array<{
      x: number
      y: number
      radius: number
      angle: number
      speed: number
      size: number
      color: string
    }> = []

    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    // Create orbital particles
    for (let i = 0; i < 50; i++) {
      orbitals.push({
        x: centerX,
        y: centerY,
        radius: 100 + Math.random() * 400,
        angle: Math.random() * Math.PI * 2,
        speed: 0.0005 + Math.random() * 0.002,
        size: 1 + Math.random() * 3,
        color: ["#3b82f6", "#0284c7", "#dc2626"][Math.floor(Math.random() * 3)],
      })
    }

    let animationId: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      orbitals.forEach((orbital) => {
        orbital.angle += orbital.speed

        const x = orbital.x + Math.cos(orbital.angle) * orbital.radius
        const y = orbital.y + Math.sin(orbital.angle) * orbital.radius

        ctx.beginPath()
        ctx.arc(x, y, orbital.size, 0, Math.PI * 2)
        ctx.fillStyle = orbital.color
        ctx.shadowBlur = 20
        ctx.shadowColor = orbital.color
        ctx.fill()
        ctx.shadowBlur = 0
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

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none opacity-30" style={{ zIndex: 0 }} />
}

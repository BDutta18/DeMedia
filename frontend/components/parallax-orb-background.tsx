"use client"

import { useEffect, useRef } from "react"

export default function ParallaxOrbBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Far layer - large blurred gradient orbs
    const farOrbs: Array<{
      x: number
      y: number
      radius: number
      color: string
      speedY: number
    }> = []

    for (let i = 0; i < 5; i++) {
      farOrbs.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 300 + 200,
        color: ["#3b82f6", "#7c3aed", "#fbbf24"][Math.floor(Math.random() * 3)],
        speedY: (Math.random() - 0.5) * 0.2,
      })
    }

    // Mid layer - faint diagonal grid
    const gridLines: Array<{ x: number; y: number; length: number; angle: number }> = []
    for (let i = 0; i < 30; i++) {
      gridLines.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        length: Math.random() * 100 + 50,
        angle: Math.random() * Math.PI,
      })
    }

    // Front layer - tiny floating particles
    const particles: Array<{
      x: number
      y: number
      size: number
      speedY: number
      opacity: number
    }> = []

    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 2 + 1,
        speedY: (Math.random() - 0.5) * 1.2,
        opacity: Math.random() * 0.5 + 0.2,
      })
    }

    let scrollY = 0

    const handleScroll = () => {
      scrollY = window.scrollY
    }

    window.addEventListener("scroll", handleScroll)

    let animationFrame: number

    const animate = () => {
      ctx.fillStyle = "rgba(10, 10, 15, 0.08)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw far layer orbs with parallax 0.2x
      farOrbs.forEach((orb) => {
        orb.y += orb.speedY
        if (orb.y < -orb.radius) orb.y = canvas.height + orb.radius
        if (orb.y > canvas.height + orb.radius) orb.y = -orb.radius

        const parallaxY = orb.y - scrollY * 0.2

        const gradient = ctx.createRadialGradient(orb.x, parallaxY, 0, orb.x, parallaxY, orb.radius)
        gradient.addColorStop(0, `${orb.color}40`)
        gradient.addColorStop(0.5, `${orb.color}10`)
        gradient.addColorStop(1, "transparent")

        ctx.fillStyle = gradient
        ctx.filter = "blur(40px)"
        ctx.fillRect(orb.x - orb.radius, parallaxY - orb.radius, orb.radius * 2, orb.radius * 2)
        ctx.filter = "none"
      })

      // Draw mid layer grid with parallax 0.5x
      ctx.strokeStyle = "#ffffff"
      ctx.globalAlpha = 0.05
      ctx.lineWidth = 1

      gridLines.forEach((line) => {
        const parallaxY = line.y - scrollY * 0.5
        ctx.beginPath()
        ctx.moveTo(line.x, parallaxY)
        ctx.lineTo(line.x + Math.cos(line.angle) * line.length, parallaxY + Math.sin(line.angle) * line.length)
        ctx.stroke()
      })

      ctx.globalAlpha = 1

      // Draw front layer particles with parallax 1.2x
      particles.forEach((particle) => {
        particle.y += particle.speedY
        if (particle.y < 0) particle.y = canvas.height
        if (particle.y > canvas.height) particle.y = 0

        const parallaxY = particle.y - scrollY * 1.2

        ctx.beginPath()
        ctx.arc(particle.x, parallaxY, particle.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(255, 255, 255, ${particle.opacity})`
        ctx.fill()
      })

      animationFrame = requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      cancelAnimationFrame(animationFrame)
      window.removeEventListener("resize", handleResize)
      window.removeEventListener("scroll", handleScroll)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 z-0" style={{ mixBlendMode: "screen" }} />
}

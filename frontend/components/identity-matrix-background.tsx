"use client"

import { useEffect, useRef } from "react"

export default function IdentityMatrixBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    canvas.width = window.innerWidth
    canvas.height = window.innerHeight

    // Flowing light particles
    const particles: Array<{
      x: number
      y: number
      size: number
      speedX: number
      speedY: number
      opacity: number
      color: string
    }> = []

    // Create particles
    for (let i = 0; i < 80; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1,
        speedX: (Math.random() - 0.5) * 0.5,
        speedY: (Math.random() - 0.5) * 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: ["#00d4ff", "#7c3aed", "#fbbf24"][Math.floor(Math.random() * 3)],
      })
    }

    // Mouse position for cursor spotlight
    let mouseX = canvas.width / 2
    let mouseY = canvas.height / 2

    const handleMouseMove = (e: MouseEvent) => {
      mouseX = e.clientX
      mouseY = e.clientY
    }

    window.addEventListener("mousemove", handleMouseMove)

    // Animation loop
    const animate = () => {
      // Create trailing effect
      ctx.fillStyle = "rgba(10, 10, 15, 0.05)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw cursor spotlight
      const gradient = ctx.createRadialGradient(mouseX, mouseY, 0, mouseX, mouseY, 200)
      gradient.addColorStop(0, "rgba(59, 130, 246, 0.15)")
      gradient.addColorStop(0.5, "rgba(124, 58, 237, 0.08)")
      gradient.addColorStop(1, "rgba(10, 10, 15, 0)")
      ctx.fillStyle = gradient
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw and update particles
      particles.forEach((particle, i) => {
        // Draw particle with glow
        const particleGradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size * 4,
        )
        particleGradient.addColorStop(0, particle.color)
        particleGradient.addColorStop(1, "rgba(0, 0, 0, 0)")

        ctx.fillStyle = particleGradient
        ctx.globalAlpha = particle.opacity
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()

        // Update particle position
        particle.x += particle.speedX
        particle.y += particle.speedY

        // Bounce off edges
        if (particle.x < 0 || particle.x > canvas.width) particle.speedX *= -1
        if (particle.y < 0 || particle.y > canvas.height) particle.speedY *= -1

        // Draw connections to nearby particles
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[j].x - particle.x
          const dy = particles[j].y - particle.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance < 150) {
            ctx.strokeStyle = particle.color
            ctx.globalAlpha = (1 - distance / 150) * 0.2
            ctx.lineWidth = 0.5
            ctx.beginPath()
            ctx.moveTo(particle.x, particle.y)
            ctx.lineTo(particles[j].x, particles[j].y)
            ctx.stroke()
          }
        }
      })

      ctx.globalAlpha = 1
      requestAnimationFrame(animate)
    }

    animate()

    const handleResize = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }

    window.addEventListener("resize", handleResize)

    return () => {
      window.removeEventListener("mousemove", handleMouseMove)
      window.removeEventListener("resize", handleResize)
    }
  }, [])

  return <canvas ref={canvasRef} className="fixed inset-0 -z-10" />
}

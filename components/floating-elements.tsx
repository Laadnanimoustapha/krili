"use client"

import { useEffect, useState } from "react"

export function FloatingElements() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)
    return () => window.removeEventListener("mousemove", handleMouseMove)
  }, [])

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden">
      {/* Floating orbs that follow mouse */}
      <div
        className="absolute w-4 h-4 bg-primary/20 rounded-full blur-sm transition-all duration-1000 ease-out"
        style={{
          left: mousePosition.x - 8,
          top: mousePosition.y - 8,
          transform: `translate(${mousePosition.x * 0.02}px, ${mousePosition.y * 0.02}px)`,
        }}
      />
      <div
        className="absolute w-2 h-2 bg-secondary/30 rounded-full blur-sm transition-all duration-1500 ease-out"
        style={{
          left: mousePosition.x - 4,
          top: mousePosition.y - 4,
          transform: `translate(${mousePosition.x * 0.01}px, ${mousePosition.y * 0.01}px)`,
        }}
      />

      {/* Static floating elements */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-gradient-to-r from-primary/5 to-secondary/5 rounded-full blur-2xl animate-pulse" />
      <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-gradient-to-r from-secondary/5 to-primary/5 rounded-full blur-2xl animate-pulse delay-1000" />
      <div className="absolute top-1/2 left-3/4 w-16 h-16 bg-gradient-to-r from-primary/10 to-secondary/10 rounded-full blur-xl animate-bounce" />
    </div>
  )
}

'use client'

import { useEffect, useRef } from 'react'

interface Particle {
  x: number
  y: number
  size: number
  speedY: number
  speedX: number
  opacity: number
  pulse: number
}

export default function GoldenParticles() {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Canvas 크기 설정
    const resizeCanvas = () => {
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
    }
    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    // 파티클 생성
    const particleCount = 50 // 파티클 개수 (조절 가능)
    const particles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        size: Math.random() * 3 + 1, // 1-4px
        speedY: Math.random() * 0.5 + 0.2, // 느리게 떨어짐
        speedX: Math.random() * 0.3 - 0.15, // 좌우로 살짝 움직임
        opacity: Math.random() * 0.3 + 0.2, // 은은한 투명도
        pulse: Math.random() * Math.PI * 2 // 반짝임 효과
      })
    }

    // 애니메이션
    let animationFrameId: number
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      particles.forEach((particle) => {
        // 위치 업데이트
        particle.y += particle.speedY
        particle.x += particle.speedX
        particle.pulse += 0.02

        // 화면 밖으로 나가면 위로 다시
        if (particle.y > canvas.height) {
          particle.y = -10
          particle.x = Math.random() * canvas.width
        }
        if (particle.x > canvas.width) particle.x = 0
        if (particle.x < 0) particle.x = canvas.width

        // 반짝임 효과
        const pulseOpacity = particle.opacity + Math.sin(particle.pulse) * 0.1

        // 그라디언트로 황금색 표현
        const gradient = ctx.createRadialGradient(
          particle.x,
          particle.y,
          0,
          particle.x,
          particle.y,
          particle.size
        )
        gradient.addColorStop(0, `rgba(255, 215, 0, ${pulseOpacity})`) // 밝은 금색
        gradient.addColorStop(0.5, `rgba(255, 193, 7, ${pulseOpacity * 0.7})`) // 황금색
        gradient.addColorStop(1, `rgba(255, 193, 7, 0)`) // 투명

        // 파티클 그리기
        ctx.fillStyle = gradient
        ctx.beginPath()
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2)
        ctx.fill()
      })

      animationFrameId = requestAnimationFrame(animate)
    }

    animate()

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      cancelAnimationFrame(animationFrameId)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{
        background: 'transparent'
      }}
    />
  )
}

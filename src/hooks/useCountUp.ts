import { useState, useEffect, useRef } from 'react'

interface UseCountUpOptions {
  duration?: number // 애니메이션 지속 시간 (밀리초)
  delay?: number // 시작 전 대기 시간 (밀리초)
  startOnView?: boolean // 뷰포트에 들어올 때 시작할지 여부
}

export function useCountUp(
  end: number,
  options: UseCountUpOptions = {}
) {
  const {
    duration = 2000,
    delay = 0,
    startOnView = true
  } = options

  const [count, setCount] = useState(0)
  const [isVisible, setIsVisible] = useState(!startOnView)
  const elementRef = useRef<HTMLElement>(null)

  useEffect(() => {
    if (!startOnView) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true)
          }
        })
      },
      { threshold: 0.1 }
    )

    const currentElement = elementRef.current
    if (currentElement) {
      observer.observe(currentElement)
    }

    return () => {
      if (currentElement) {
        observer.unobserve(currentElement)
      }
    }
  }, [startOnView, isVisible])

  useEffect(() => {
    if (!isVisible) return
    if (end === 0) {
      setCount(0)
      return
    }

    const timeoutId = setTimeout(() => {
      let startTime: number | null = null
      const step = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = timestamp - startTime
        const percentage = Math.min(progress / duration, 1)

        // easeOutQuart 이징 함수 적용 (부드러운 감속)
        const eased = 1 - Math.pow(1 - percentage, 4)
        setCount(Math.floor(eased * end))

        if (percentage < 1) {
          requestAnimationFrame(step)
        } else {
          setCount(end)
        }
      }

      requestAnimationFrame(step)
    }, delay)

    return () => clearTimeout(timeoutId)
  }, [end, duration, delay, isVisible])

  return { count, ref: elementRef }
}

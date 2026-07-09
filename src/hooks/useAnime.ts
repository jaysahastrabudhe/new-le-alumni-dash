import { useEffect, useRef } from 'react'
import { animate, stagger } from 'animejs'

export function useEntranceAnimation(deps: unknown[] = []) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const children = Array.from(ref.current.children) as HTMLElement[]
    if (!children.length) return
    animate(children, {
      opacity: [0, 1],
      translateY: [24, 0],
      delay: stagger(80),
      duration: 500,
      ease: 'outCubic',
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps)

  return ref
}

export function useCountUp(target: number, duration = 1200) {
  const ref = useRef<HTMLElement | null>(null)

  useEffect(() => {
    if (!ref.current) return
    const el = ref.current
    const obj = { val: 0 }
    animate(obj, {
      val: target,
      duration,
      ease: 'outExpo',
      onUpdate: () => {
        el.textContent = Math.floor(obj.val).toString()
      },
    })
  }, [target, duration])

  return ref
}

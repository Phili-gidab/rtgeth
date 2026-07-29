// Lenis singleton + smooth anchor navigation shared across components.
let lenis = null

export function setLenis(instance) {
  lenis = instance
}

export function getLenis() {
  return lenis
}

export function scrollToHash(hash) {
  const target = document.querySelector(hash)
  if (!target) return
  if (lenis) {
    lenis.scrollTo(target, { offset: -68 })
  } else {
    target.scrollIntoView({ behavior: 'smooth' })
  }
}

export const prefersReducedMotion = () =>
  window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
  /* test hook: ?noanim renders everything without reveals (screenshot verification) */
  new URLSearchParams(window.location.search).has('noanim')

'use client'

import { useState, useCallback, useMemo } from 'react'
import { workMedia } from '@/lib/assets'

// Manages the three nested levels of the Work gallery:
//   category (pill nav)  →  project (Next Project CTA)  →  image page (up/down arrows)
//
// `categories` is the copy-driven array for the active language (labels + titles);
// media paths are looked up from workMedia by category slug. `perPage` is how many
// images show at once (2 side-by-side on desktop, 1 on mobile) — the up/down
// arrows page through the project in steps of perPage.
export function useWorkGallery(categories, perPage = 1) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [projectIndex, setProjectIndex] = useState(0)
  const [pageStart, setPageStart] = useState(0)
  // Direction (1 = forward, -1 = back) for crossfade enter/exit choreography.
  const [direction, setDirection] = useState(1)

  const activeCategory = categories[categoryIndex]
  const categoryProjects = workMedia[activeCategory.slug] || []
  const projectCount = categoryProjects.length
  const media = categoryProjects[projectIndex]?.media || []
  const imageCount = media.length
  const activeProjectCopy = activeCategory.projects[projectIndex] || {}

  // Clamp the page start to a valid aligned position (handles perPage changing on resize).
  const lastPageStart = Math.max(0, Math.floor((imageCount - 1) / perPage) * perPage)
  const safeStart = Math.min(pageStart, lastPageStart)
  const pageItems = media.slice(safeStart, safeStart + perPage)
  const hasPaging = imageCount > perPage

  const selectCategory = useCallback((index) => {
    setDirection(1)
    setCategoryIndex(index)
    setProjectIndex(0)
    setPageStart(0)
  }, [])

  const nextProject = useCallback(() => {
    setDirection(1)
    setProjectIndex((p) => (p + 1) % projectCount)
    setPageStart(0)
  }, [projectCount])

  const nextImage = useCallback(() => {
    setDirection(1)
    setPageStart((s) => (s + perPage > imageCount - 1 ? 0 : s + perPage))
  }, [perPage, imageCount])

  const prevImage = useCallback(() => {
    setDirection(-1)
    setPageStart((s) => (s - perPage < 0 ? Math.floor((imageCount - 1) / perPage) * perPage : s - perPage))
  }, [perPage, imageCount])

  // Jump straight to a page (carousel dots).
  const goToPage = useCallback(
    (pageIndex) => {
      setDirection(pageIndex * perPage >= safeStart ? 1 : -1)
      setPageStart(pageIndex * perPage)
    },
    [perPage, safeStart]
  )

  // Stable key so AnimatePresence crossfades on any of the three levels changing.
  const mediaKey = useMemo(
    () => `${categoryIndex}-${projectIndex}-${safeStart}`,
    [categoryIndex, projectIndex, safeStart]
  )

  return {
    categoryIndex,
    projectIndex,
    pageStart: safeStart,
    imageCount,
    projectCount,
    pageItems,
    hasPaging,
    activeProjectCopy,
    direction,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
    goToPage,
  }
}

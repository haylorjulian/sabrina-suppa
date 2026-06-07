'use client'

import { useState, useCallback, useMemo } from 'react'
import { workMedia } from '@/lib/assets'

// Manages the three nested levels of the Work gallery:
//   category (pill nav)  →  project (Next Project CTA)  →  image (up/down arrows)
//
// `categories` is the copy-driven array for the active language (labels + titles);
// media paths are looked up from workMedia by category slug. Indices are kept
// aligned between the two.
export function useWorkGallery(categories) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [projectIndex, setProjectIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  // Direction (1 = forward, -1 = back) for crossfade enter/exit choreography.
  const [direction, setDirection] = useState(1)

  const activeCategory = categories[categoryIndex]
  const categoryProjects = workMedia[activeCategory.slug] || []
  const projectCount = categoryProjects.length
  const activeProjectMedia = categoryProjects[projectIndex]?.media || []
  const imageCount = activeProjectMedia.length
  const activeMedia = activeProjectMedia[imageIndex] || null
  const activeProjectCopy = activeCategory.projects[projectIndex] || {}

  const selectCategory = useCallback((index) => {
    setDirection(1)
    setCategoryIndex(index)
    setProjectIndex(0)
    setImageIndex(0)
  }, [])

  const nextProject = useCallback(() => {
    setDirection(1)
    setProjectIndex((p) => (p + 1) % projectCount)
    setImageIndex(0)
  }, [projectCount])

  const nextImage = useCallback(() => {
    setDirection(1)
    setImageIndex((i) => (i + 1) % imageCount)
  }, [imageCount])

  const prevImage = useCallback(() => {
    setDirection(-1)
    setImageIndex((i) => (i - 1 + imageCount) % imageCount)
  }, [imageCount])

  // Stable key so AnimatePresence crossfades on any of the three changing.
  const mediaKey = useMemo(
    () => `${categoryIndex}-${projectIndex}-${imageIndex}`,
    [categoryIndex, projectIndex, imageIndex]
  )

  return {
    categoryIndex,
    projectIndex,
    imageIndex,
    direction,
    imageCount,
    projectCount,
    activeMedia,
    activeProjectCopy,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
  }
}

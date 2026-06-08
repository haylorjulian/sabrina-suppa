'use client'

import { useState, useCallback, useMemo } from 'react'
import { workMedia } from '@/lib/assets'

// Category → project → image model. The bottom nav switches category; the Next
// Project CTA cycles projects within the active category; the side arrows page
// through one image at a time. `categories` is the copy array (labels +
// descriptions + project titles); media is looked up from workMedia by slug.
export function useWorkGallery(categories) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [projectIndex, setProjectIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  // Direction (1 = forward, -1 = back) for crossfade choreography.
  const [direction, setDirection] = useState(1)

  const activeCategory = categories[categoryIndex] || { projects: [], description: [] }
  const catMedia = workMedia[activeCategory.slug] || []
  const projectCount = catMedia.length
  const media = catMedia[projectIndex]?.media || []
  const imageCount = media.length
  const safeImage = imageCount ? Math.min(imageIndex, imageCount - 1) : 0
  const activeMedia = media[safeImage] || null
  const isFirstImage = safeImage === 0
  const hasPaging = imageCount > 1
  const activeProjectCopy = activeCategory.projects?.[projectIndex] || {}

  const selectCategory = useCallback((i) => {
    setDirection(1)
    setCategoryIndex(i)
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
    setImageIndex((x) => (x + 1) % imageCount)
  }, [imageCount])

  const prevImage = useCallback(() => {
    setDirection(-1)
    setImageIndex((x) => (x - 1 + imageCount) % imageCount)
  }, [imageCount])

  const mediaKey = useMemo(
    () => `${categoryIndex}-${projectIndex}-${safeImage}`,
    [categoryIndex, projectIndex, safeImage]
  )

  return {
    categoryIndex,
    projectIndex,
    imageIndex: safeImage,
    projectCount,
    imageCount,
    hasPaging,
    isFirstImage,
    activeCategory,
    activeProjectCopy,
    activeMedia,
    direction,
    mediaKey,
    selectCategory,
    nextProject,
    nextImage,
    prevImage,
  }
}

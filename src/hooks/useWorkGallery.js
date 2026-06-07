'use client'

import { useState, useCallback, useMemo } from 'react'

// Flat gallery model: a single ordered list of projects (each with its category
// label, full description, and media). One image shows at a time; the bottom
// project nav selects a project, the arrows page through that project's images.
export function useWorkGallery(projects) {
  const [projectIndex, setProjectIndex] = useState(0)
  const [imageIndex, setImageIndex] = useState(0)
  // Direction (1 = forward, -1 = back) for crossfade choreography.
  const [direction, setDirection] = useState(1)

  const activeProject = projects[projectIndex] || { media: [], description: [] }
  const media = activeProject.media || []
  const imageCount = media.length
  const safeImage = imageCount ? Math.min(imageIndex, imageCount - 1) : 0
  const activeMedia = media[safeImage] || null
  const isFirstImage = safeImage === 0
  const hasPaging = imageCount > 1

  const selectProject = useCallback((i) => {
    setDirection(1)
    setProjectIndex(i)
    setImageIndex(0)
  }, [])

  const nextImage = useCallback(() => {
    setDirection(1)
    setImageIndex((x) => (x + 1) % imageCount)
  }, [imageCount])

  const prevImage = useCallback(() => {
    setDirection(-1)
    setImageIndex((x) => (x - 1 + imageCount) % imageCount)
  }, [imageCount])

  const mediaKey = useMemo(() => `${projectIndex}-${safeImage}`, [projectIndex, safeImage])

  return {
    projectIndex,
    imageIndex: safeImage,
    imageCount,
    hasPaging,
    isFirstImage,
    activeProject,
    activeMedia,
    direction,
    mediaKey,
    selectProject,
    nextImage,
    prevImage,
  }
}

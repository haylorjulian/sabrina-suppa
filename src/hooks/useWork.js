'use client'

import { useState, useCallback, useMemo } from 'react'
import { workMedia, categoryImages } from '@/lib/assets'

// Drives the redesigned Work section:
//   view 'landing'  → category selector (toggle) + homepage image + "See Projects"
//   view 'projects' → one project at a time, paging through its images
//                     (perPage = 3 on desktop, 1 on mobile)
export function useWork(categories, perPage = 3) {
  const [view, setView] = useState('landing')
  const [categoryIndex, setCategoryIndex] = useState(0)
  const [projectIndex, setProjectIndex] = useState(0)
  const [pageStart, setPageStart] = useState(0)

  const activeCategory = categories[categoryIndex] || { projects: [], description: [] }
  const catMedia = workMedia[activeCategory.slug] || []
  const projectCount = catMedia.length
  const media = catMedia[projectIndex]?.media || []
  const imageCount = media.length

  // Clamp page window (handles perPage changing on resize / project switch).
  const lastStart = Math.max(0, Math.floor(Math.max(0, imageCount - 1) / perPage) * perPage)
  const safeStart = Math.min(pageStart, lastStart)
  const pageItems = media.slice(safeStart, safeStart + perPage)
  const totalPages = Math.max(1, Math.ceil(imageCount / perPage))
  const currentPage = Math.floor(safeStart / perPage) + 1
  const hasPaging = imageCount > perPage

  const activeProjectCopy = activeCategory.projects?.[projectIndex] || {}
  const categoryImage = categoryImages[activeCategory.slug] || {}

  const selectCategory = useCallback((i) => {
    setCategoryIndex(i)
    setProjectIndex(0)
    setPageStart(0)
  }, [])

  const openProjects = useCallback(() => {
    setProjectIndex(0)
    setPageStart(0)
    setView('projects')
  }, [])

  const backToLanding = useCallback(() => setView('landing'), [])

  const selectProject = useCallback((i) => {
    setProjectIndex(i)
    setPageStart(0)
  }, [])

  const nextProject = useCallback(() => {
    setProjectIndex((p) => (p + 1) % projectCount)
    setPageStart(0)
  }, [projectCount])

  const prevProject = useCallback(() => {
    setProjectIndex((p) => (p - 1 + projectCount) % projectCount)
    setPageStart(0)
  }, [projectCount])

  // Page through the current project's images; roll over to the next/previous
  // project (within the category) at the boundaries.
  const nextPage = useCallback(() => {
    if (safeStart + perPage < imageCount) {
      setPageStart(safeStart + perPage)
    } else {
      setProjectIndex((p) => (p + 1) % projectCount)
      setPageStart(0)
    }
  }, [safeStart, perPage, imageCount, projectCount])

  const prevPage = useCallback(() => {
    if (safeStart - perPage >= 0) {
      setPageStart(safeStart - perPage)
    } else {
      const prev = (projectIndex - 1 + projectCount) % projectCount
      const prevCount = (catMedia[prev]?.media || []).length
      setProjectIndex(prev)
      setPageStart(Math.floor(Math.max(0, prevCount - 1) / perPage) * perPage)
    }
  }, [safeStart, perPage, projectIndex, projectCount, catMedia])

  const mediaKey = useMemo(
    () => `${categoryIndex}-${projectIndex}-${safeStart}`,
    [categoryIndex, projectIndex, safeStart]
  )

  return {
    view,
    categoryIndex,
    projectIndex,
    activeCategory,
    activeProjectCopy,
    categoryImage,
    projectCount,
    imageCount,
    pageItems,
    pageStart: safeStart,
    totalPages,
    currentPage,
    hasPaging,
    mediaKey,
    selectCategory,
    openProjects,
    backToLanding,
    selectProject,
    nextProject,
    prevProject,
    nextPage,
    prevPage,
  }
}

'use client'

import { useState, useCallback, useMemo } from 'react'

// Work-section landing state: which category is active, and the active category's
// projects with computed hrefs to their standalone gallery pages. The previous
// in-place carousel/projects view has moved to /work/[category]/[project].
export function useWork(categories) {
  const [categoryIndex, setCategoryIndex] = useState(0)
  const safeIndex = Math.min(categoryIndex, categories.length - 1)
  const activeCategory = categories[safeIndex]

  const selectCategory = useCallback((i) => setCategoryIndex(i), [])

  const projects = useMemo(
    () =>
      (activeCategory.projects || []).map((p) => ({
        ...p,
        href: `/work/${activeCategory.slug}/${p.slug}`,
      })),
    [activeCategory]
  )

  return { categoryIndex: safeIndex, activeCategory, selectCategory, projects }
}

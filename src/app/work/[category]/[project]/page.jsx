import { notFound } from 'next/navigation'
import copy from '@/content/copy.generated.json'
import { workMedia } from '@/lib/assets'
import ProjectGallery from '@/components/work/ProjectGallery'

const categories = copy.en.work.categories

function resolve(categorySlug, projectSlug) {
  const cat = categories.find((c) => c.slug === categorySlug)
  if (!cat) return null
  const pi = cat.projects.findIndex((p) => p.slug === projectSlug)
  if (pi === -1) return null
  return { cat, pi, project: cat.projects[pi] }
}

// Static export needs every route enumerated at build time.
export function generateStaticParams() {
  return categories.flatMap((c) =>
    c.projects.map((p) => ({ category: c.slug, project: p.slug }))
  )
}

export function generateMetadata({ params }) {
  const r = resolve(params.category, params.project)
  if (!r) return {}
  const title = `${r.project.title} — Sabrina Suppa`
  const description = (Array.isArray(r.project.description) ? r.project.description.join(' ') : (r.project.description || '')).replace(/\s+/g, ' ').slice(0, 160)
  return {
    title,
    description,
    openGraph: { title, description, type: 'article' },
  }
}

export default function ProjectPage({ params }) {
  const r = resolve(params.category, params.project)
  if (!r) notFound()

  const { cat, pi, project } = r
  const media = workMedia[cat.slug]?.[pi]?.media || []

  // Within-category siblings for the right-side project nav.
  const siblings = cat.projects.map((p, i) => ({
    href: `/work/${cat.slug}/${p.slug}`,
    title: p.title,
    active: i === pi,
  }))

  // Next project across the whole catalogue (not just this category), wrapping
  // back to the first project after the last — the header arrow is a single
  // forward-only stepper through every project on the site.
  const allProjects = categories.flatMap((c) =>
    c.projects.map((p) => ({ href: `/work/${c.slug}/${p.slug}`, title: p.title }))
  )
  const globalIndex = allProjects.findIndex((p) => p.href === `/work/${cat.slug}/${project.slug}`)
  const nextProject = allProjects.length > 1 ? allProjects[(globalIndex + 1) % allProjects.length] : undefined

  return (
    <ProjectGallery project={project} media={media} siblings={siblings} nextProject={nextProject} />
  )
}

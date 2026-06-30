import { notFound } from 'next/navigation'
import copy from '@/content/copy.json'
import { workMedia } from '@/lib/assets'
import ProjectGallery from '@/components/work/ProjectGallery'

const categories = copy.en.work.categories

// Ordered, flattened project list — used for prev/next cycling across categories.
const flatProjects = categories.flatMap((c) =>
  c.projects.map((p) => ({ href: `/work/${c.slug}/${p.slug}`, title: p.title }))
)

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
  const description = (r.project.description || '').replace(/\s+/g, ' ').slice(0, 160)
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

  const here = `/work/${cat.slug}/${project.slug}`
  const idx = flatProjects.findIndex((f) => f.href === here)
  const prev = flatProjects[(idx - 1 + flatProjects.length) % flatProjects.length]
  const next = flatProjects[(idx + 1) % flatProjects.length]

  return (
    <ProjectGallery
      categoryLabel={cat.label}
      project={project}
      media={media}
      prev={prev}
      next={next}
    />
  )
}

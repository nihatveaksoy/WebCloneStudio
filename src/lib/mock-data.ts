import type { Suggestion } from "@/types/project"

export function getMockSuggestions(url: string): Suggestion[] {
  const hostname = extractHostname(url)

  return [
    {
      id: "sug-ux-001",
      category: "ux",
      priority: "high",
      title: "Add loading skeleton states",
      description:
        "Replace blank loading screens with skeleton placeholders that match the final layout. This reduces perceived load time and prevents layout shift.",
      currentState: `${hostname} shows a blank page or spinner while content loads`,
      suggestedState:
        "Skeleton screens matching each section's layout appear instantly, content fades in when ready",
      effort: "medium",
      applied: false,
    },
    {
      id: "sug-ux-002",
      category: "ux",
      priority: "medium",
      title: "Improve mobile navigation",
      description:
        "The current navigation collapses poorly on small screens. A slide-out drawer with grouped sections would improve discoverability on mobile.",
      currentState: "Navigation links overflow or get hidden behind a basic hamburger menu",
      suggestedState:
        "Full-height slide-out drawer with grouped links, search, and smooth open/close animation",
      effort: "medium",
      applied: false,
    },
    {
      id: "sug-perf-001",
      category: "performance",
      priority: "high",
      title: "Lazy-load below-the-fold images",
      description:
        "Images outside the initial viewport should use native lazy loading to cut initial page weight and improve LCP.",
      currentState: "All images load eagerly on page load, increasing initial transfer size",
      suggestedState:
        'Below-fold images use loading="lazy" and srcset for responsive sizes, cutting initial payload by ~40%',
      effort: "easy",
      applied: false,
    },
    {
      id: "sug-a11y-001",
      category: "accessibility",
      priority: "high",
      title: "Add ARIA labels to interactive elements",
      description:
        "Several buttons and links lack accessible names, making the site difficult to navigate with screen readers.",
      currentState:
        "Icon-only buttons have no aria-label; some images lack alt text; form inputs lack associated labels",
      suggestedState:
        "Every interactive element has an accessible name, images have descriptive alt text, form inputs are properly labeled",
      effort: "easy",
      applied: false,
    },
    {
      id: "sug-modern-001",
      category: "modern-patterns",
      priority: "medium",
      title: "Implement dark mode support",
      description:
        "Add a system-aware dark mode toggle using CSS custom properties and prefers-color-scheme media query.",
      currentState: "Single light-only color scheme with no user preference detection",
      suggestedState:
        "Automatic dark mode based on OS preference with a manual toggle; colors defined as CSS custom properties",
      effort: "medium",
      applied: false,
    },
    {
      id: "sug-design-001",
      category: "design",
      priority: "medium",
      title: "Standardize spacing and typography scale",
      description:
        "The site uses inconsistent spacing values and font sizes. A design token system would create visual harmony.",
      currentState:
        "Mixed pixel values for margins, padding, and font sizes with no clear scale",
      suggestedState:
        "4px base spacing scale (4, 8, 12, 16, 24, 32, 48, 64) and modular type scale applied consistently",
      effort: "medium",
      applied: false,
    },
    {
      id: "sug-seo-001",
      category: "seo",
      priority: "high",
      title: "Add structured data and meta tags",
      description:
        "Missing Open Graph tags, Twitter cards, and JSON-LD structured data reduces search visibility and social sharing quality.",
      currentState:
        "Basic title and meta description only; no OG tags, no structured data, no canonical URL",
      suggestedState:
        "Complete OG/Twitter meta tags, JSON-LD Organization and WebPage schemas, canonical URLs on every page",
      effort: "easy",
      applied: false,
    },
    {
      id: "sug-perf-002",
      category: "performance",
      priority: "low",
      title: "Minify and tree-shake CSS",
      description:
        "The stylesheet contains unused rules that inflate the CSS bundle. Purging unused styles would reduce CSS size.",
      currentState: "Full CSS bundle shipped including unused selectors",
      suggestedState:
        "CSS purged of unused rules at build time, reducing stylesheet size by an estimated 60-70%",
      effort: "easy",
      applied: false,
    },
  ]
}

function extractHostname(url: string): string {
  try {
    return new URL(url).hostname.replace("www.", "")
  } catch {
    return "the site"
  }
}

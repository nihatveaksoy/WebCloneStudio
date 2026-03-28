import { ProjectList } from "@/components/app/ProjectList"
import { getAllProjects } from "@/lib/db"

export const dynamic = "force-dynamic"

export default function DashboardPage() {
  const projects = getAllProjects()

  return (
    <main className="relative mx-auto w-full max-w-7xl flex-1 px-4 py-8">
      <ProjectList projects={projects} />
    </main>
  )
}

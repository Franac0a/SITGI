import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ResearchProject } from '@/types/scientific.types'

interface ProjectsPageProps {
  initialProjects?: ResearchProject[]
  isLoading?: boolean
}

export function ProjectsPage({
  initialProjects = [],
  isLoading = false,
}: ProjectsPageProps) {
  const [projects] = useState<ResearchProject[]>(initialProjects)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
              Líneas de Investigación
            </span>
            <h1 className="text-2xl font-bold text-black mt-2">
              Proyectos de Investigación
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Administración de proyectos científicos, asignación de investigadores y seguimiento de consumo de insumos.
            </p>
          </div>

          <Button variant="primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
            </svg>
            Nuevo Proyecto
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Skeleton className="h-44 rounded-xl" />
            <Skeleton className="h-44 rounded-xl" />
          </div>
        ) : projects.length === 0 ? (
          <EmptyState
            title="No hay proyectos registrados"
            description="No se han cargado líneas de investigación activas en el sistema institucional."
            action={
              <Button variant="primary">
                Crear Primer Proyecto
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {projects.map((proj) => (
              <div
                key={proj.id}
                className="p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 transition-colors shadow-2xs"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold font-mono uppercase px-2 py-0.5 rounded bg-gray-100 text-black border border-gray-200">
                      {proj.code}
                    </span>
                    <h3 className="text-base font-bold text-black mt-2">
                      {proj.title}
                    </h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-gray-100 text-black border border-gray-200 uppercase">
                    {proj.status.replace('_', ' ')}
                  </span>
                </div>
                {proj.description && (
                  <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                    {proj.description}
                  </p>
                )}
                <div className="mt-4 pt-3 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
                  <span>Director: <strong className="text-black">{proj.director}</strong></span>
                  <span className="font-semibold text-bordo-700">{proj.reagentsCount} Insumos Vinculados</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

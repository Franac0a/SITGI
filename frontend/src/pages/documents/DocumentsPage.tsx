import { useState } from 'react'
import { MainLayout } from '@/components/layout/MainLayout'
import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/Skeleton'
import type { ScientificDocument } from '@/types/scientific.types'

interface DocumentsPageProps {
  initialDocuments?: ScientificDocument[]
  isLoading?: boolean
}

export function DocumentsPage({
  initialDocuments = [],
  isLoading = false,
}: DocumentsPageProps) {
  const [documents] = useState<ScientificDocument[]>(initialDocuments)

  return (
    <MainLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-bordo-700 bg-bordo-50 px-2 py-0.5 rounded border border-bordo-200">
              Control Documental
            </span>
            <h1 className="text-2xl font-bold text-black mt-2">
              Documentos Asociados
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Repositorio de Hojas de Datos de Seguridad (MSDS), Protocolos Operativos (SOP) y Certificados de Calidad (COA).
            </p>
          </div>

          <Button variant="primary">
            <svg className="w-4 h-4 mr-1.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
            </svg>
            Subir Documento
          </Button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
        ) : documents.length === 0 ? (
          <EmptyState
            title="No hay documentos para mostrar"
            description="El repositorio documental se encuentra vacío. Suba el primer documento técnico o certificado analítico."
            action={
              <Button variant="primary">
                Subir Primer Documento
              </Button>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {documents.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-xl border border-gray-200 bg-white flex flex-col justify-between shadow-2xs"
              >
                <div>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-gray-100 text-black border border-gray-200 uppercase">
                    {doc.category}
                  </span>
                  <h3 className="font-bold text-black text-base mt-2">
                    {doc.title}
                  </h3>
                  {doc.description && (
                    <p className="text-xs text-gray-600 mt-1">
                      {doc.description}
                    </p>
                  )}
                </div>
                <div className="mt-4 pt-3 border-t border-gray-200 flex justify-between items-center text-xs">
                  <span className="font-mono text-gray-500">{doc.fileSize}</span>
                  <a
                    href={doc.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-bordo-700 font-bold hover:underline"
                  >
                    Descargar
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  )
}

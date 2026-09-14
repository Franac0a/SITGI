import { apiClient, API_BASE_URL } from '@/services/api/client'
import type { Documento } from '@/types/scientific.types'

const BASE = '/documentos'

export interface UploadDocumentoPayload {
  titulo: string
  categoria: string
  codigo?: string
  descripcion?: string
  archivo?: File
}

export async function getDocumentos(): Promise<Documento[]> {
  return apiClient<Documento[]>(BASE, {
    method: 'GET',
  })
}

export async function uploadDocumento(
  payload: UploadDocumentoPayload,
): Promise<{ mensaje?: string; documento?: Documento }> {
  const formData = new FormData()
  formData.append('titulo', payload.titulo)
  formData.append('categoria', payload.categoria)
  if (payload.codigo) formData.append('codigo', payload.codigo)
  if (payload.descripcion) formData.append('descripcion', payload.descripcion)
  if (payload.archivo) formData.append('archivo', payload.archivo)

  const token = localStorage.getItem('sitgi_token')
  const headers: Record<string, string> = {}
  if (token) headers.Authorization = `Bearer ${token}`

  const response = await fetch(`${API_BASE_URL}${BASE}`, {
    method: 'POST',
    headers,
    credentials: 'include',
    body: formData,
  })

  if (!response.ok) {
    let message = 'No se pudo cargar el documento.'
    try {
      const data = await response.json()
      message = data.mensaje || data.message || data.error || message
    } catch {
      // ignorar error de parseo
    }
    throw new Error(message)
  }

  return response.json()
}

export async function deleteDocumento(
  id: string | number,
): Promise<{ mensaje?: string }> {
  return apiClient<{ mensaje?: string }>(`${BASE}/${id}`, {
    method: 'DELETE',
  })
}

export function getDocumentoDownloadUrl(id: string | number): string {
  return `${API_BASE_URL}${BASE}/${id}/descargar`
}

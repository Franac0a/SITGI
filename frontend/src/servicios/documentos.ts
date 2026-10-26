import { leerRespuesta, pedirApi, URL_API } from '@/servicios/api'
import type { DatosDocumento, Documento } from '@/tipos'

export function obtenerDocumentos(): Promise<Documento[]> {
  return pedirApi<Documento[]>('/documentos')
}

// El archivo no se puede mandar como JSON: se usa un FormData.
export async function subirDocumento(datos: DatosDocumento) {
  const formulario = new FormData()
  formulario.append('titulo', datos.titulo)
  formulario.append('categoria', datos.categoria)
  if (datos.codigo) formulario.append('codigo', datos.codigo)
  if (datos.descripcion) formulario.append('descripcion', datos.descripcion)
  if (datos.archivo) formulario.append('archivo', datos.archivo)

  const respuesta = await fetch(`${URL_API}/documentos`, {
    method: 'POST',
    credentials: 'include',
    body: formulario,
  })
  return leerRespuesta(respuesta)
}

export function eliminarDocumento(id: number) {
  return pedirApi(`/documentos/${id}`, 'DELETE')
}

export function urlDeDescarga(id: number): string {
  return `${URL_API}/documentos/${id}/descargar`
}

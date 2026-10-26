// Funciones base para hablar con el backend.
// La sesión viaja en una cookie, por eso todos los pedidos usan credentials: 'include'.

export const URL_API = import.meta.env.VITE_API_URL ?? 'http://localhost:4000/api'

// Clave de localStorage donde se guardan los datos del usuario logueado.
export const CLAVE_USUARIO = 'sitgi_user'

// Error con el código HTTP, para poder distinguir por ejemplo un 401 de un 500.
export class ErrorApi extends Error {
  estado: number

  constructor(mensaje: string, estado: number) {
    super(mensaje)
    this.estado = estado
  }
}

// Revisa la respuesta: si salió bien devuelve los datos y si no, lanza un ErrorApi.
export async function leerRespuesta<T>(respuesta: Response): Promise<T> {
  const esJson = respuesta.headers.get('content-type')?.includes('application/json')
  const datos = esJson ? await respuesta.json() : null

  if (!respuesta.ok) {
    const mensaje: string =
      datos?.mensaje || datos?.error || 'Ocurrió un error inesperado al procesar la solicitud.'

    // Si la sesión venció, se borra el usuario guardado y se vuelve al login.
    // El login y el registro no cuentan: ahí un 401 o 403 es por datos incorrectos.
    const esLoginORegistro = /\/auth\/(login|register)$/.test(respuesta.url)
    const sesionVencida =
      respuesta.status === 401 || (respuesta.status === 403 && /token/i.test(mensaje))

    if (!esLoginORegistro && sesionVencida) {
      localStorage.removeItem(CLAVE_USUARIO)
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }

    throw new ErrorApi(mensaje, respuesta.status)
  }

  return datos as T
}

// Hace un pedido al backend. Si se pasan datos, se mandan como JSON.
export async function pedirApi<T>(ruta: string, metodo = 'GET', datos?: unknown): Promise<T> {
  const encabezados: Record<string, string> = { Accept: 'application/json' }
  if (datos !== undefined) {
    encabezados['Content-Type'] = 'application/json'
  }

  const respuesta = await fetch(URL_API + ruta, {
    method: metodo,
    headers: encabezados,
    credentials: 'include',
    body: datos !== undefined ? JSON.stringify(datos) : undefined,
  })

  return leerRespuesta<T>(respuesta)
}

// Arma el "?clave=valor&..." de una URL, salteando los filtros vacíos.
export function armarConsulta(filtros: object): string {
  const parametros = new URLSearchParams()
  for (const [clave, valor] of Object.entries(filtros)) {
    if (valor) parametros.set(clave, String(valor))
  }
  const texto = parametros.toString()
  return texto ? `?${texto}` : ''
}

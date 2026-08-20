import { useState, useEffect, useCallback } from 'react'
import { DashboardLayout } from '@/components/layout/DashboardLayout'
import { Alert } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { NativeSelect as Select } from '@/components/ui/native-select'
import { INSTITUTIONAL_ROLES } from '@/constants/roles'
import { usersService } from '@/services/users/users.service'
import type { InstitutionalRole, User } from '@/types/auth.types'
import type { UserStatus } from '@/types/user.types'
import { formatApiError } from '@/utils/errors'

export function UsersAdminPage() {
  const [activeTab, setActiveTab] = useState<UserStatus>('pendiente')
  const [users, setUsers] = useState<User[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [actionLoadingId, setActionLoadingId] = useState<number | null>(null)
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedRoles, setSelectedRoles] = useState<Record<number, InstitutionalRole>>({})

  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    try {
      const data = await usersService.getUsers()
      setUsers(data)
      const initialRoles: Record<number, InstitutionalRole> = {}
      data.forEach((u) => {
        initialRoles[u.id] = u.rol
      })
      setSelectedRoles(initialRoles)
    } catch (error) {
      setFeedback({
        type: 'error',
        message: formatApiError(error),
      })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const handleRoleChange = (userId: number, newRole: InstitutionalRole) => {
    setSelectedRoles((prev) => ({
      ...prev,
      [userId]: newRole,
    }))
  }

  const handleUpdateStatus = async (
    userId: number,
    newStatus: UserStatus,
    customRole?: InstitutionalRole,
  ) => {
    setActionLoadingId(userId)
    setFeedback(null)

    const roleToAssign = customRole || selectedRoles[userId]

    try {
      const response = await usersService.updateUserStatus(userId, {
        estado: newStatus,
        rol: roleToAssign,
      })

      setFeedback({
        type: 'success',
        message: response.mensaje || `Estado del usuario actualizado a "${newStatus}".`,
      })

      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? { ...u, estado: newStatus, rol: roleToAssign || u.rol }
            : u,
        ),
      )
    } catch (error) {
      setFeedback({
        type: 'error',
        message: formatApiError(error),
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const handleSaveRoleOnly = async (userId: number) => {
    const newRole = selectedRoles[userId]
    if (!newRole) return

    setActionLoadingId(userId)
    setFeedback(null)

    try {
      const response = await usersService.updateUserStatus(userId, {
        rol: newRole,
      })

      setFeedback({
        type: 'success',
        message: response.mensaje || 'Rol actualizado con éxito.',
      })

      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, rol: newRole } : u)),
      )
    } catch (error) {
      setFeedback({
        type: 'error',
        message: formatApiError(error),
      })
    } finally {
      setActionLoadingId(null)
    }
  }

  const pendingCount = users.filter((u) => u.estado === 'pendiente').length
  const activeCount = users.filter((u) => u.estado === 'activo').length
  const rejectedCount = users.filter((u) => u.estado === 'rechazado').length

  const filteredUsers = users
    .filter((u) => u.estado === activeTab)
    .filter((u) => {
      if (!searchQuery.trim()) return true
      const query = searchQuery.toLowerCase()
      return (
        u.nombre.toLowerCase().includes(query) ||
        u.email.toLowerCase().includes(query) ||
        u.dni.toLowerCase().includes(query) ||
        u.rol.toLowerCase().includes(query)
      )
    })

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-gray-200 pb-5">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              Gestión de Usuarios y Aprobaciones
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Revise las solicitudes pendientes de acceso, apruebe cuentas institucionales y gestione roles del CIT.
            </p>
          </div>

          <Button
            variant="outline"
            onClick={fetchUsers}
            disabled={isLoading}
            className="self-start md:self-auto"
          >
            <svg
              className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
            Actualizar lista
          </Button>
        </div>

        {feedback && (
          <Alert
            variant={feedback.type}
            message={feedback.message}
          />
        )}

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex space-x-2 border-b border-gray-200 pb-1 sm:pb-0 sm:border-0">
            <button
              onClick={() => setActiveTab('pendiente')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'pendiente'
                  ? 'bg-cit-petroleo text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>Pendientes de Aprobación</span>
              {pendingCount > 0 && (
                <span
                  className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                    activeTab === 'pendiente'
                      ? 'bg-white text-cit-petroleo'
                      : 'bg-amber-100 text-amber-800'
                  }`}
                >
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('activo')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'activo'
                  ? 'bg-cit-petroleo text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>Usuarios Activos</span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === 'activo'
                    ? 'bg-white text-cit-petroleo'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {activeCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('rechazado')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'rechazado'
                  ? 'bg-cit-petroleo text-white shadow-sm'
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <span>Rechazados / Inactivos</span>
              <span
                className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                  activeTab === 'rechazado'
                    ? 'bg-white text-cit-petroleo'
                    : 'bg-gray-200 text-gray-700'
                }`}
              >
                {rejectedCount}
              </span>
            </button>
          </div>

          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Buscar por nombre, DNI, email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3.5 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-cit-turquesa focus:border-cit-turquesa bg-gray-50 focus:bg-white transition-all duration-150"
            />
          </div>
        </div>

        {isLoading ? (
          <div className="bg-white p-12 text-center rounded-xl border border-gray-200 shadow-2xs">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-cit-petroleo border-t-transparent"></div>
            <p className="text-sm text-gray-500 mt-3 font-medium">
              Cargando usuarios del sistema...
            </p>
          </div>
        ) : filteredUsers.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-xl border border-dashed border-gray-300">
            <div className="w-12 h-12 rounded-full bg-gray-100 text-gray-400 mx-auto flex items-center justify-center mb-3">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                />
              </svg>
            </div>
            <h3 className="text-base font-medium text-gray-900">
              No hay usuarios en esta sección
            </h3>
            <p className="text-sm text-gray-500 mt-1">
              {searchQuery
                ? 'No se encontraron resultados con los términos de búsqueda ingresados.'
                : activeTab === 'pendiente'
                ? 'No hay solicitudes de registro pendientes de aprobación en este momento.'
                : activeTab === 'activo'
                ? 'No hay usuarios activos registrados en el sistema.'
                : 'No hay usuarios rechazados o inactivos.'}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 text-left">
                <thead className="bg-gray-50 text-xs font-semibold text-gray-600 uppercase tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-3.5">
                      Usuario / DNI
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Correo Institucional
                    </th>
                    <th scope="col" className="px-6 py-3.5">
                      Rol Asignado
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-center">
                      Estado
                    </th>
                    <th scope="col" className="px-6 py-3.5 text-right">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 text-sm">
                  {filteredUsers.map((u) => {
                    const isProcessing = actionLoadingId === u.id
                    const currentSelectedRole = selectedRoles[u.id] ?? u.rol
                    const roleChanged = currentSelectedRole !== u.rol

                    return (
                      <tr
                        key={u.id}
                        className="hover:bg-gray-50/80 transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-cit-petroleo/10 text-cit-petroleo font-bold flex items-center justify-center text-xs">
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900">
                                {u.nombre}
                              </div>
                              <div className="text-xs text-gray-500">
                                DNI: <span className="font-mono">{u.dni}</span>
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-gray-600 font-mono text-xs">
                          {u.email}
                        </td>

                        <td className="px-6 py-4">
                          {activeTab === 'pendiente' || activeTab === 'activo' ? (
                            <div className="flex items-center gap-2 max-w-xs">
                              <Select
                                name={`role-${u.id}`}
                                options={INSTITUTIONAL_ROLES}
                                value={currentSelectedRole}
                                onChange={(e) =>
                                  handleRoleChange(
                                    u.id,
                                    e.target.value as InstitutionalRole,
                                  )
                                }
                                disabled={isProcessing}
                              />
                              {activeTab === 'activo' && roleChanged && (
                                <button
                                  type="button"
                                  onClick={() => handleSaveRoleOnly(u.id)}
                                  disabled={isProcessing}
                                  className="px-2.5 py-2 text-xs font-semibold text-cit-petroleo bg-cit-petroleo/10 border border-cit-petroleo/20 rounded-lg hover:bg-cit-petroleo/20 transition-colors shrink-0"
                                  title="Guardar nuevo rol"
                                >
                                  Guardar
                                </button>
                              )}
                            </div>
                          ) : (
                            <span className="font-medium text-gray-700">
                              {u.rol}
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-center">
                          {u.estado === 'pendiente' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-50 text-amber-800 border border-amber-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mr-1.5 animate-pulse"></span>
                              Pendiente
                            </span>
                          )}
                          {u.estado === 'activo' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1.5"></span>
                              Activo
                            </span>
                          )}
                          {u.estado === 'rechazado' && (
                            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 text-red-800 border border-red-200">
                              <span className="w-1.5 h-1.5 rounded-full bg-red-500 mr-1.5"></span>
                              Rechazado
                            </span>
                          )}
                        </td>

                        <td className="px-6 py-4 text-right whitespace-nowrap">
                          {isProcessing ? (
                            <div className="inline-flex items-center gap-1.5 text-xs text-gray-500 font-medium">
                              <span className="inline-block animate-spin rounded-full h-3.5 w-3.5 border-2 border-cit-petroleo border-t-transparent"></span>
                              Procesando...
                            </div>
                          ) : activeTab === 'pendiente' ? (
                            <div className="inline-flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  handleUpdateStatus(u.id, 'activo', currentSelectedRole)
                                }
                                className="px-3 py-1.5 text-xs font-semibold text-white bg-cit-turquesa hover:bg-cit-turquesa/90 rounded-lg shadow-2xs transition-colors"
                              >
                                Aprobar Acceso
                              </button>
                              <button
                                type="button"
                                onClick={() => handleUpdateStatus(u.id, 'rechazado')}
                                className="px-3 py-1.5 text-xs font-semibold text-red-700 bg-red-50 border border-red-200 rounded-lg hover:bg-red-100 transition-colors"
                              >
                                Rechazar
                              </button>
                            </div>
                          ) : activeTab === 'activo' ? (
                            <button
                              type="button"
                              onClick={() => handleUpdateStatus(u.id, 'rechazado')}
                              className="px-3 py-1.5 text-xs font-semibold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-red-50 hover:text-red-700 hover:border-red-200 transition-colors"
                            >
                              Suspender Cuenta
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                handleUpdateStatus(u.id, 'activo', currentSelectedRole)
                              }
                              className="px-3 py-1.5 text-xs font-semibold text-cit-turquesa bg-cit-turquesa/10 border border-cit-turquesa/20 rounded-lg hover:bg-cit-turquesa/20 transition-colors"
                            >
                              Reactivar Cuenta
                            </button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}

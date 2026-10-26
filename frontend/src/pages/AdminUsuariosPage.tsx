import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowLeft,
  Key,
  Plus,
  Shield,
  Trash2,
  Users,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { usuarioService } from '../services/usuarioService';
import { UsuarioAdmin, BanRequest, PermisoUsuario, PermisoEspecialRequest } from '../types/usuario';
import { ApiError } from '../types/api';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

// =============================================
// Sub-componente: Modal de Baneo/Desbaneo
// =============================================
interface BanModalProps {
  usuario: UsuarioAdmin;
  onClose: () => void;
  onSaved: () => void;
}

const BanModal: React.FC<BanModalProps> = ({ usuario, onClose, onSaved }) => {
  const [esBaneado, setEsBaneado] = useState(usuario.estaBaneado);
  const [motivoBaneo, setMotivoBaneo] = useState(usuario.motivoBaneo || '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      const payload: BanRequest = {
        esBaneado,
        motivoBaneo: esBaneado ? (motivoBaneo.trim() || null) : null,
      };
      await usuarioService.ban(usuario.id_Usuario, payload);
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al actualizar el estado de la cuenta.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ban-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md border border-slate-200">
        {/* Encabezado del modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Shield className="w-5 h-5 text-red-600" aria-hidden="true" />
            <h2 id="ban-modal-title" className="text-base font-bold text-slate-900">
              Estado de Cuenta — {usuario.nombreCompleto}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo */}
        <div className="p-5 space-y-4">
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          <label className="flex items-center gap-3 cursor-pointer min-h-[44px] text-sm text-slate-800">
            <input
              type="checkbox"
              checked={esBaneado}
              onChange={(e) => setEsBaneado(e.target.checked)}
              className="w-4 h-4 rounded text-red-600 border-slate-300 focus:ring-red-500 cursor-pointer"
            />
            <span className="font-semibold">¿Cuenta baneada?</span>
          </label>

          {esBaneado && (
            <div className="space-y-1.5">
              <label
                htmlFor="ban-motivo"
                className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
              >
                Motivo del baneo
              </label>
              <textarea
                id="ban-motivo"
                value={motivoBaneo}
                onChange={(e) => setMotivoBaneo(e.target.value)}
                rows={3}
                placeholder="Describe el motivo del baneo..."
                className="w-full border border-slate-200 rounded-lg p-3 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 resize-none"
              />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-5 border-t border-slate-100">
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={handleSave}
            isLoading={isSaving}
          >
            Guardar
          </Button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// Sub-componente: Modal de Permisos
// =============================================
interface PermisosModalProps {
  usuario: UsuarioAdmin;
  onClose: () => void;
  onSaved: () => void;
}

const PermisosModal: React.FC<PermisosModalProps> = ({ usuario, onClose, onSaved }) => {
  const [permisos, setPermisos] = useState<PermisoUsuario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Formulario de nuevo permiso
  const [tipoPermiso, setTipoPermiso] = useState('');
  const [numeroDocumento, setNumeroDocumento] = useState('');
  const [fechaExpiracion, setFechaExpiracion] = useState('');
  const [estadoPermiso, setEstadoPermiso] = useState('Pendiente');
  const [isSavingPermiso, setIsSavingPermiso] = useState(false);

  const loadPermisos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getById(usuario.id_Usuario);
      setPermisos(data.permisos || []);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al cargar los permisos del usuario.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPermisos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevocar = async (permisoId: number) => {
    try {
      await usuarioService.revocarPermiso(usuario.id_Usuario, permisoId);
      setSuccessMsg('Permiso revocado correctamente.');
      loadPermisos();
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al revocar el permiso.');
    }
  };

  const handleOtorgar = async () => {
    if (!tipoPermiso.trim() || !numeroDocumento.trim() || !fechaExpiracion) {
      setError('Complete todos los campos del permiso antes de otorgarlo.');
      return;
    }
    setIsSavingPermiso(true);
    setError(null);
    try {
      const payload: PermisoEspecialRequest = {
        tipoPermiso: tipoPermiso.trim(),
        numeroDocumento: numeroDocumento.trim(),
        fechaExpiracion,
        estado: estadoPermiso,
      };
      await usuarioService.otorgarPermiso(usuario.id_Usuario, payload);
      setSuccessMsg('Permiso otorgado correctamente.');
      setTipoPermiso('');
      setNumeroDocumento('');
      setFechaExpiracion('');
      setEstadoPermiso('Pendiente');
      loadPermisos();
      onSaved();
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al otorgar el permiso.');
    } finally {
      setIsSavingPermiso(false);
    }
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case 'Aprobado':
        return <Badge variant="emerald" size="sm">{estado}</Badge>;
      case 'Rechazado':
        return <Badge variant="red" size="sm">{estado}</Badge>;
      default:
        return <Badge variant="amber" size="sm">{estado}</Badge>;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="permisos-modal-title"
    >
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg border border-slate-200 max-h-[90vh] flex flex-col">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-slate-200 shrink-0">
          <div className="flex items-center gap-2.5">
            <Key className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <h2 id="permisos-modal-title" className="text-base font-bold text-slate-900">
              Permisos — {usuario.nombreCompleto}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-2 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {/* Cuerpo con scroll */}
        <div className="overflow-y-auto flex-1 p-5 space-y-5">
          {successMsg && (
            <Alert type="success" onClose={() => setSuccessMsg(null)}>
              {successMsg}
            </Alert>
          )}
          {error && (
            <Alert type="error" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Lista de permisos actuales */}
          <div>
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
              Permisos Actuales
            </h3>
            {isLoading ? (
              <LoadingSkeleton count={2} className="h-12 w-full mb-2" />
            ) : permisos.length === 0 ? (
              <p className="text-sm text-slate-500 italic">Este usuario no tiene permisos especiales.</p>
            ) : (
              <div className="space-y-2">
                {permisos.map((p) => (
                  <div
                    key={p.id_Permiso}
                    className="flex items-center justify-between gap-3 p-3 rounded-lg bg-slate-50 border border-slate-200"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-800 truncate">{p.tipoPermiso}</p>
                      <p className="text-xs text-slate-500">Doc: {p.numeroDocumento} · Vence: {p.fechaExpiracion?.split('T')[0]}</p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {getEstadoBadge(p.estado)}
                      <button
                        type="button"
                        onClick={() => handleRevocar(p.id_Permiso)}
                        className="p-1.5 rounded-md text-red-600 hover:bg-red-50 transition-colors min-h-[32px] min-w-[32px] flex items-center justify-center"
                        aria-label={`Revocar permiso ${p.tipoPermiso}`}
                      >
                        <Trash2 className="w-4 h-4" aria-hidden="true" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Formulario para agregar permiso */}
          <div className="border-t border-slate-200 pt-5 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Otorgar Nuevo Permiso
            </h3>
            <div className="space-y-2">
              <label htmlFor="tipo-permiso" className="block text-xs font-semibold text-slate-600">
                Tipo de Permiso / Autorización
              </label>
              <select
                id="tipo-permiso"
                value={tipoPermiso}
                onChange={(e) => setTipoPermiso(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">-- Seleccionar Permiso Especial --</option>
                <option value="Acreditación Balística y Defensa">Acreditación Balística y Defensa (Fuerzas de Orden)</option>
                <option value="Mayor de 18 años (Verificación de Edad)">Mayor de 18 años (Verificación de Edad / Restricción)</option>
                <option value="Personal Autorizado (Fuerzas de Orden y Seguridad)">Personal Autorizado (Fuerzas de Orden y Seguridad)</option>
                <option value="Licencia de Armero y Distribuidor">Licencia de Armero y Distribuidor</option>
                <option value="Permiso de Coleccionista y Replicas Airsoft">Permiso de Coleccionista y Réplicas Airsoft</option>
                <option value="Otro">Otro Permiso Oficial</option>
              </select>
              {tipoPermiso === 'Otro' && (
                <input
                  type="text"
                  placeholder="Escriba el nombre del permiso..."
                  onChange={(e) => setTipoPermiso(e.target.value)}
                  className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 mt-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              )}
            </div>
            <div className="space-y-2">
              <label htmlFor="num-documento" className="block text-xs font-semibold text-slate-600">
                Número de Documento
              </label>
              <input
                id="num-documento"
                type="text"
                value={numeroDocumento}
                onChange={(e) => setNumeroDocumento(e.target.value)}
                placeholder="Ej: 12345678"
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="fecha-expiracion" className="block text-xs font-semibold text-slate-600">
                Fecha de Expiración
              </label>
              <input
                id="fecha-expiracion"
                type="date"
                value={fechaExpiracion}
                onChange={(e) => setFechaExpiracion(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="estado-permiso" className="block text-xs font-semibold text-slate-600">
                Estado
              </label>
              <select
                id="estado-permiso"
                value={estadoPermiso}
                onChange={(e) => setEstadoPermiso(e.target.value)}
                className="w-full border border-slate-200 rounded-lg px-3 py-2 text-sm text-slate-800 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
              </select>
            </div>
            <Button
              variant="primary"
              onClick={handleOtorgar}
              isLoading={isSavingPermiso}
              icon={<Plus className="w-4 h-4" aria-hidden="true" />}
              className="w-full"
            >
              Otorgar Permiso
            </Button>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end p-5 border-t border-slate-100 shrink-0">
          <Button variant="outline" onClick={onClose}>
            Cerrar
          </Button>
        </div>
      </div>
    </div>
  );
};

// =============================================
// Página principal: Gestión de Usuarios Admin
// =============================================
export const AdminUsuariosPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [usuarios, setUsuarios] = useState<UsuarioAdmin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const [banModalUsuario, setBanModalUsuario] = useState<UsuarioAdmin | null>(null);
  const [permisosModalUsuario, setPermisosModalUsuario] = useState<UsuarioAdmin | null>(null);

  const loadUsuarios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await usuarioService.getAll();
      setUsuarios(data);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al cargar la lista de usuarios.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUsuarios();
  }, []);

  const handleBanSaved = () => {
    setSuccessMsg('Estado de la cuenta actualizado correctamente.');
    setBanModalUsuario(null);
    loadUsuarios();
  };

  const handlePermisoSaved = () => {
    loadUsuarios();
  };

  const getRolBadge = (rol: string) => {
    if (rol === 'Admin' || rol === 'Administrador') {
      return <Badge variant="purple" size="sm">{rol}</Badge>;
    }
    if (rol === 'Técnico' || rol === 'Tecnico') {
      return <Badge variant="amber" size="sm">{rol}</Badge>;
    }
    return <Badge variant="blue" size="sm">{rol}</Badge>;
  };

  const getInitials = (nombre: string) => {
    return nombre
      .split(' ')
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (!isAdmin) {
    return (
      <Alert type="error" title="Acceso denegado">
        No tienes permiso para acceder a esta sección.
      </Alert>
    );
  }

  return (
    <div className="space-y-6 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/productos"
              className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3 h-3" aria-hidden="true" />
              Volver al catálogo
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Users className="w-7 h-7 text-rose-500" aria-hidden="true" />
            Gestión de Usuarios y Permisos
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Administra cuentas, roles, baneos y permisos especiales de los usuarios del sistema.
          </p>
        </div>
      </div>

      {/* Alertas globales */}
      {successMsg && (
        <Alert type="success" title="Operación exitosa" onClose={() => setSuccessMsg(null)}>
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert type="error" title="Error al cargar usuarios" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Listado de usuarios */}
      {isLoading ? (
        <div className="space-y-3">
          <LoadingSkeleton count={5} className="h-16 w-full rounded-xl" />
        </div>
      ) : usuarios.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <Users className="w-12 h-12 text-slate-300 mx-auto mb-3" aria-hidden="true" />
          <p className="text-slate-500 text-sm">No hay usuarios registrados en el sistema.</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm" role="table">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Usuario
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Rol
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Estado
                  </th>
                  <th className="text-left px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Permisos
                  </th>
                  <th className="text-right px-4 py-3 text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usuarios.map((u) => (
                  <tr key={u.id_Usuario} className="hover:bg-slate-50/60 transition-colors">
                    {/* Usuario: avatar + nombre + correo */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center text-xs font-black shrink-0"
                          aria-hidden="true"
                        >
                          {getInitials(u.nombreCompleto)}
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-slate-900 truncate max-w-[180px]">{u.nombreCompleto}</p>
                          <p className="text-xs text-slate-500 truncate max-w-[180px]">{u.correo}</p>
                        </div>
                      </div>
                    </td>

                    {/* Rol */}
                    <td className="px-4 py-3">{getRolBadge(u.rol)}</td>

                    {/* Estado */}
                    <td className="px-4 py-3">
                      {u.estaBaneado ? (
                        <Badge variant="red" size="sm">Baneado</Badge>
                      ) : (
                        <Badge variant="emerald" size="sm">Activo</Badge>
                      )}
                    </td>

                    {/* Permisos */}
                    <td className="px-4 py-3">
                      <Badge variant="slate" size="sm">{u.cantidadPermisos} permiso{u.cantidadPermisos !== 1 ? 's' : ''}</Badge>
                    </td>

                    {/* Acciones */}
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          type="button"
                          onClick={() => setBanModalUsuario(u)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors min-h-[36px] ${
                            u.estaBaneado
                              ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                              : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                          }`}
                          aria-label={u.estaBaneado ? `Desbanear a ${u.nombreCompleto}` : `Banear a ${u.nombreCompleto}`}
                        >
                          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
                          {u.estaBaneado ? 'Desbanear' : 'Banear'}
                        </button>
                        <button
                          type="button"
                          onClick={() => setPermisosModalUsuario(u)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 transition-colors min-h-[36px]"
                          aria-label={`Gestionar permisos de ${u.nombreCompleto}`}
                        >
                          <Key className="w-3.5 h-3.5" aria-hidden="true" />
                          Permisos
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modales */}
      {banModalUsuario && (
        <BanModal
          usuario={banModalUsuario}
          onClose={() => setBanModalUsuario(null)}
          onSaved={handleBanSaved}
        />
      )}

      {permisosModalUsuario && (
        <PermisosModal
          usuario={permisosModalUsuario}
          onClose={() => setPermisosModalUsuario(null)}
          onSaved={handlePermisoSaved}
        />
      )}
    </div>
  );
};

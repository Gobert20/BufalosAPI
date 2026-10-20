import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  PlusCircle,
  RefreshCw,
  User,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { servicioTecnicoService } from '../services/servicioTecnicoService';
import { OrdenServicio } from '../types/servicio';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { NuevaSolicitudModal } from '../components/services/NuevaSolicitudModal';

export const ServicioClientePage: React.FC = () => {
  const { user } = useAuth();
  const [servicios, setServicios] = useState<OrdenServicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  const loadServicios = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await servicioTecnicoService.getMisServicios(user?.id, user?.correo);
      setServicios(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No fue posible cargar el historial de servicios.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadServicios();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleSuccess = () => {
    setNotification('¡Tu solicitud técnica ha sido enviada al taller de armería con éxito!');
    loadServicios();
  };

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Por definir';
    try {
      return new Date(isoString).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Recibido':
        return (
          <Badge variant="blue" icon={<Clock className="w-3.5 h-3.5" />}>
            Recibido / En Cola
          </Badge>
        );
      case 'En Proceso':
        return (
          <Badge variant="amber" icon={<Wrench className="w-3.5 h-3.5" />}>
            En Banco de Trabajo
          </Badge>
        );
      case 'Esperando Repuestos':
        return (
          <Badge variant="purple" icon={<Clock className="w-3.5 h-3.5" />}>
            Esperando Repuestos
          </Badge>
        );
      case 'Finalizado':
        return (
          <Badge variant="emerald" icon={<CheckCircle className="w-3.5 h-3.5" />}>
            Listo para Retiro
          </Badge>
        );
      case 'Entregado':
        return (
          <Badge variant="slate" icon={<CheckCircle className="w-3.5 h-3.5" />}>
            Entregado
          </Badge>
        );
      default:
        return <Badge variant="slate">{estado}</Badge>;
    }
  };

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
              &larr; Volver al catálogo
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-7 h-7 text-amber-600" aria-hidden="true" />
            Servicio Técnico y Taller de Armería
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Solicita mantención mayor, calibración de miras o personalización de equipo táctico para tus réplicas
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadServicios}
            icon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
            className="font-semibold"
          >
            Actualizar
          </Button>
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4" aria-hidden="true" />}
            className="font-bold shadow-xs bg-amber-600 hover:bg-amber-700 text-white"
          >
            Nueva Solicitud
          </Button>
        </div>
      </div>

      {/* Notificación de Solicitud Exitosa */}
      {notification && (
        <Alert type="success" title="Operación Exitosa" onClose={() => setNotification(null)}>
          {notification}
        </Alert>
      )}

      {/* Alerta de Error */}
      {error && (
        <Alert type="error" title="Falla al obtener servicios" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={3} className="h-36 w-full rounded-xl" />
        </div>
      ) : servicios.length === 0 ? (
        /* Estado Vacío */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div
            className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <Wrench className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No tienes servicios técnicos activos</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            ¿Necesitas calibrar una mira telescópica, hacer mantención a tu réplica de airsoft o confeccionar parches personalizados? Ingresa tu solicitud ahora mismo.
          </p>
          <Button
            variant="primary"
            onClick={() => setModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4" aria-hidden="true" />}
            className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
          >
            Ingresar Nueva Solicitud de Servicio Técnico
          </Button>
        </div>
      ) : (
        /* Listado de Servicios */
        <div className="space-y-4">
          {servicios.map((orden) => (
            <article
              key={orden.id_OrdenServicio}
              className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs hover:border-slate-300 transition-all text-left"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-3 mb-3">
                <div className="flex items-center gap-2.5">
                  <span className="font-mono text-sm font-black text-slate-900">
                    Ticket #{orden.id_OrdenServicio.toString().padStart(5, '0')}
                  </span>
                  <Badge variant="blue" size="sm">
                    {orden.tipoServicioNombre}
                  </Badge>
                </div>
                <div>{getStatusBadge(orden.estado)}</div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Detalle del Requerimiento / Equipo
                  </span>
                  <p className="text-sm font-semibold text-slate-800 leading-relaxed">
                    {orden.descripcionProblemaOrItem}
                  </p>

                  <div className="flex flex-wrap items-center gap-4 pt-2 text-xs text-slate-500">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                      Ingresado: {formatDate(orden.fechaIngreso)}
                    </span>
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                      Entrega estimada: {formatDate(orden.fechaEstimadaEntrega)}
                    </span>
                    <span className="flex items-center gap-1">
                      <User className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />
                      Armero: {orden.tecnicoNombre || 'En asignación'}
                    </span>
                  </div>
                </div>

                <div className="md:col-span-4 flex flex-col justify-between items-start md:items-end border-t md:border-t-0 md:border-l border-slate-100 pt-3 md:pt-0 md:pl-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider md:text-right">
                      Costo Presupuestado
                    </span>
                    <span className="text-xl font-black text-slate-900 tracking-tight font-mono block md:text-right">
                      {formatCLP(orden.costoTotal)}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 mt-2">
                    Garantía técnica de armería incluida
                  </span>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Modal Accesible de Nueva Solicitud */}
      <NuevaSolicitudModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={handleSuccess}
      />
    </div>
  );
};

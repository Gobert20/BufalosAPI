import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Sparkles,
  User,
  Wrench,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { servicioTecnicoService } from '../services/servicioTecnicoService';
import { OrdenServicio } from '../types/servicio';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { NuevaSolicitudModal } from '../components/services/NuevaSolicitudModal';

const ESTADOS_SEGUIMIENTO = [
  { clave: 'Recibido', etiqueta: '1. Recibido e Inspección' },
  { clave: 'En Proceso', etiqueta: '2. En Banco de Trabajo' },
  { clave: 'Esperando Repuestos', etiqueta: '3. Esperando Repuestos' },
  { clave: 'Finalizado', etiqueta: '4. Pruebas y Finalizado' },
  { clave: 'Entregado', etiqueta: '5. Entregado al Cliente' },
];

export const ServicioClientePage: React.FC = () => {
  const { user } = useAuth();
  const [servicios, setServicios] = useState<OrdenServicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Filtros y búsqueda sincronizados
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [expandedTickets, setExpandedTickets] = useState<Record<number, boolean>>({});

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

  const toggleExpand = (id: number) => {
    setExpandedTickets((prev) => ({ ...prev, [id]: !prev[id] }));
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

  // Filtrado reactivo de tickets del cliente
  const filteredServicios = servicios.filter((s) => {
    const matchEstado = filterEstado === 'todos' || s.estado.toLowerCase() === filterEstado.toLowerCase();
    const matchSearch =
      searchTerm.trim() === '' ||
      s.id_OrdenServicio.toString().includes(searchTerm) ||
      s.descripcionProblemaOrItem.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.tipoServicioNombre.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

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
            Historial detallado de mantención mayor, calibración de miras y confección de parches con seguimiento de bitácora
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

      {/* Barra de Filtros y Búsqueda */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" aria-hidden="true" />
          <input
            type="text"
            placeholder="Buscar por Ticket # o descripción..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" aria-hidden="true" />
          <select
            value={filterEstado}
            onChange={(e) => setFilterEstado(e.target.value)}
            className="w-full md:w-auto text-sm border border-slate-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 cursor-pointer"
          >
            <option value="todos">Todos los Estados</option>
            <option value="Recibido">Recibido / En Cola</option>
            <option value="En Proceso">En Banco de Trabajo</option>
            <option value="Esperando Repuestos">Esperando Repuestos</option>
            <option value="Finalizado">Listo para Retiro</option>
            <option value="Entregado">Entregado</option>
          </select>
        </div>
      </div>

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={3} className="h-36 w-full rounded-xl" />
        </div>
      ) : filteredServicios.length === 0 ? (
        /* Estado Vacío */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div
            className="w-16 h-16 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <Wrench className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {servicios.length === 0 ? 'No tienes servicios técnicos activos' : 'No se encontraron resultados'}
          </h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            {servicios.length === 0
              ? '¿Necesitas calibrar una mira telescópica, hacer mantención a tu réplica de airsoft o confeccionar parches personalizados? Ingresa tu solicitud ahora mismo.'
              : 'Intenta ajustando el filtro de estado o el término de búsqueda.'}
          </p>
          {servicios.length === 0 && (
            <Button
              variant="primary"
              onClick={() => setModalOpen(true)}
              icon={<PlusCircle className="w-4 h-4" aria-hidden="true" />}
              className="font-bold bg-amber-600 hover:bg-amber-700 text-white"
            >
              Ingresar Nueva Solicitud de Servicio Técnico
            </Button>
          )}
        </div>
      ) : (
        /* Listado de Servicios con Detalle de Bitácora y Parches */
        <div className="space-y-4">
          {filteredServicios.map((orden) => {
            const isExpanded = expandedTickets[orden.id_OrdenServicio] ?? false;
            return (
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
                    {orden.detalleParche && (
                      <Badge variant="purple" size="sm" icon={<Sparkles className="w-3 h-3" />}>
                        Parche Custom
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    {getStatusBadge(orden.estado)}
                    <button
                      type="button"
                      onClick={() => toggleExpand(orden.id_OrdenServicio)}
                      className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                      aria-label="Ver detalles de bitácora"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
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
                        Armero asignado: {orden.tecnicoNombre || 'En asignación'}
                      </span>
                    </div>

                    {/* Detalle de Parche Customizado (TB_DetallesParchesCustom) */}
                    {orden.detalleParche && (
                      <div className="mt-3 p-3 bg-purple-50/80 rounded-lg border border-purple-200 text-xs text-purple-950 space-y-1">
                        <div className="font-bold flex items-center gap-1.5 text-purple-900">
                          <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                          <span>Especificación de Parche Personalizado (TB_DetallesParchesCustom):</span>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-medium">
                          <div>
                            <span className="text-purple-600 block text-[10px] uppercase">Texto:</span>
                            {orden.detalleParche.textoPersonalizado || 'Sin texto'}
                          </div>
                          <div>
                            <span className="text-purple-600 block text-[10px] uppercase">Dimensiones:</span>
                            {orden.detalleParche.dimensiones || '8x5 cm'}
                          </div>
                          <div>
                            <span className="text-purple-600 block text-[10px] uppercase">Bordado:</span>
                            {orden.detalleParche.tipoBordado || 'Velcro Táctico'}
                          </div>
                          <div>
                            <span className="text-purple-600 block text-[10px] uppercase">Cantidad:</span>
                            {orden.detalleParche.cantidad || 1} un.
                          </div>
                        </div>
                        {orden.detalleParche.observacionesDiseno && (
                          <p className="text-[11px] text-purple-800 pt-1 italic">
                            Observaciones: {orden.detalleParche.observacionesDiseno}
                          </p>
                        )}
                      </div>
                    )}

                    {/* Bitácora y Línea de Seguimiento */}
                    {isExpanded && (
                      <div className="mt-4 pt-4 border-t border-slate-100">
                        <span className="text-xs font-bold text-slate-700 uppercase tracking-wider block mb-2">
                          Línea de Tiempo y Bitácora de Taller
                        </span>
                        <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 pt-1">
                          {ESTADOS_SEGUIMIENTO.map((etapa, idx) => {
                            const ordenIdx = ESTADOS_SEGUIMIENTO.findIndex((e) => e.clave.toLowerCase() === orden.estado.toLowerCase());
                            const completada = idx <= ordenIdx;
                            const actual = idx === ordenIdx;
                            return (
                              <div
                                key={etapa.clave}
                                className={`p-2.5 rounded-lg border text-xs text-center transition-all ${
                                  actual
                                    ? 'bg-amber-50 border-amber-400 font-bold text-amber-900 shadow-xs'
                                    : completada
                                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800 font-medium'
                                    : 'bg-slate-50 border-slate-200 text-slate-400'
                                }`}
                              >
                                <span className="block text-[10px] uppercase">Paso {idx + 1}</span>
                                <span className="leading-tight block mt-0.5">{etapa.etiqueta.split('. ')[1]}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
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
                    <button
                      type="button"
                      onClick={() => toggleExpand(orden.id_OrdenServicio)}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 mt-3"
                    >
                      {isExpanded ? 'Ocultar bitácora' : 'Ver bitácora de seguimiento'}
                      {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                    </button>
                    <span className="text-[11px] text-slate-400 mt-2">
                      Garantía técnica de armería incluida
                    </span>
                  </div>
                </div>
              </article>
            );
          })}
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

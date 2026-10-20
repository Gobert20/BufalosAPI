import React, { useEffect, useState } from 'react';
import {
  CheckCircle,
  Clock,
  Filter,
  PlusCircle,
  RefreshCw,
  Search,
  Truck,
  Wrench,
  AlertCircle,
  MapPin,
  Calendar,
} from 'lucide-react';
import { pedidoService } from '../services/pedidoService';
import { servicioTecnicoService } from '../services/servicioTecnicoService';
import { Pedido } from '../types/pedido';
import { OrdenServicio, TipoServicio } from '../types/servicio';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Modal } from '../components/ui/Modal';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';

export const PanelTecnicoPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'pedidos' | 'servicios'>('pedidos');

  // Estados de datos
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [servicios, setServicios] = useState<OrdenServicio[]>([]);
  const [tiposServicio, setTiposServicio] = useState<TipoServicio[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Filtros
  const [filterEstado, setFilterEstado] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Modal para nueva orden de servicio
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clienteCorreo, setClienteCorreo] = useState('cliente@bufalos.cl');
  const [idTipoServicio, setIdTipoServicio] = useState<number>(1);
  const [descripcionProblema, setDescripcionProblema] = useState('');
  const [costoTotal, setCostoTotal] = useState<number>(25000);
  const [isCreatingTicket, setIsCreatingTicket] = useState(false);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [pedidosData, serviciosData, tiposData] = await Promise.all([
        pedidoService.getPedidos().catch(() => []),
        servicioTecnicoService.getServicios().catch(() => []),
        servicioTecnicoService.getTipos().catch(() => []),
      ]);
      setPedidos(pedidosData);
      setServicios(serviciosData);
      setTiposServicio(tiposData);
      if (tiposData.length > 0) {
        setIdTipoServicio(tiposData[0].id_TipoServicio);
        setCostoTotal(tiposData[0].costoBase);
      }
    } catch {
      setError('No fue posible sincronizar los datos del taller y despacho.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Actualización de estado de un pedido
  const handleCambiarEstadoPedido = async (idPedido: number, nuevoEstado: string) => {
    try {
      await pedidoService.actualizarEstadoPedido(idPedido, nuevoEstado);
      setPedidos((prev) =>
        prev.map((p) => (p.id_Pedido === idPedido ? { ...p, estadoPedido: nuevoEstado } : p))
      );
      setSuccessMessage(`Pedido #${idPedido.toString().padStart(5, '0')} actualizado a "${nuevoEstado}".`);
    } catch {
      setError('Error al actualizar el estado del pedido.');
    }
  };

  // Actualización de estado de una orden de servicio
  const handleCambiarEstadoServicio = async (idOrden: number, nuevoEstado: string) => {
    try {
      await servicioTecnicoService.actualizarEstadoServicio(idOrden, nuevoEstado);
      setServicios((prev) =>
        prev.map((s) => (s.id_OrdenServicio === idOrden ? { ...s, estado: nuevoEstado } : s))
      );
      setSuccessMessage(`Orden de taller #${idOrden.toString().padStart(5, '0')} actualizada a "${nuevoEstado}".`);
    } catch {
      setError('Error al actualizar el estado de la orden de servicio.');
    }
  };

  // Crear nuevo ticket de servicio técnico
  const handleCrearTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!descripcionProblema.trim()) {
      setError('Debe ingresar la descripción del trabajo o problema reportado.');
      return;
    }

    setIsCreatingTicket(true);
    setError(null);
    try {
      await servicioTecnicoService.crearServicio({
        clienteCorreo: clienteCorreo.trim(),
        id_TipoServicio: idTipoServicio,
        descripcionProblemaOrItem: descripcionProblema.trim(),
        costoTotal,
      });

      setSuccessMessage('¡Orden de trabajo técnico ingresada y sincronizada correctamente!');
      setIsModalOpen(false);
      setDescripcionProblema('');
      loadData();
    } catch {
      setError('Error al crear el ticket de servicio técnico.');
    } finally {
      setIsCreatingTicket(false);
    }
  };

  // Métricas para el resumen superior
  const pedidosPendientes = pedidos.filter(
    (p) => p.estadoPedido === 'Pendiente' || p.estadoPedido === 'Creado'
  ).length;
  const pedidosEnviados = pedidos.filter((p) => p.estadoPedido === 'EnviadoStarken' || p.estadoPedido === 'Entregado').length;
  const serviciosActivos = servicios.filter((s) => s.estado === 'Recibido' || s.estado === 'En Proceso').length;

  const pedidosFiltrados = pedidos.filter((p) => {
    const matchEstado = filterEstado === 'todos' || p.estadoPedido === filterEstado;
    const matchSearch =
      p.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.id_Pedido.toString().includes(searchTerm) ||
      (p.direccionEnvio && p.direccionEnvio.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchEstado && matchSearch;
  });

  const serviciosFiltrados = servicios.filter((s) => {
    const matchEstado = filterEstado === 'todos' || s.estado === filterEstado;
    const matchSearch =
      s.clienteNombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id_OrdenServicio.toString().includes(searchTerm) ||
      s.descripcionProblemaOrItem.toLowerCase().includes(searchTerm.toLowerCase());
    return matchEstado && matchSearch;
  });

  const getBadgeEstadoPedido = (estado: string) => {
    switch (estado) {
      case 'Entregado':
        return <Badge variant="emerald">{estado}</Badge>;
      case 'EnviadoStarken':
        return <Badge variant="blue">Enviado Starken</Badge>;
      case 'En Proceso':
        return <Badge variant="amber">En Preparación</Badge>;
      case 'Pendiente':
      default:
        return <Badge variant="red">Pendiente Despacho</Badge>;
    }
  };

  const getBadgeEstadoServicio = (estado: string) => {
    switch (estado) {
      case 'Finalizado':
      case 'Entregado':
        return <Badge variant="emerald">{estado}</Badge>;
      case 'En Proceso':
        return <Badge variant="amber">{estado}</Badge>;
      case 'Esperando Repuestos':
        return <Badge variant="purple">{estado}</Badge>;
      case 'Recibido':
      default:
        return <Badge variant="blue">{estado}</Badge>;
    }
  };

  return (
    <div className="space-y-8 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Wrench className="w-8 h-8 text-amber-600" aria-hidden="true" />
            Panel Técnico y Operacional
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gestión de despacho logístico, control de pedidos de clientes y taller de armería
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadData}
            icon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
          >
            Actualizar
          </Button>

          <Button
            variant="primary"
            onClick={() => setIsModalOpen(true)}
            icon={<PlusCircle className="w-4 h-4" aria-hidden="true" />}
            className="font-bold bg-amber-600 hover:bg-amber-700 active:bg-amber-800"
          >
            Nuevo Ticket Taller
          </Button>
        </div>
      </div>

      {/* Tarjetas de Resumen KPI Operacional */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Pedidos Pendientes
            </span>
            <span className="text-3xl font-black text-amber-600 mt-1 block">
              {pedidosPendientes}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Por empaquetar / enviar</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Truck className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Despachos Completados
            </span>
            <span className="text-3xl font-black text-emerald-600 mt-1 block">
              {pedidosEnviados}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Enviados o entregados</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CheckCircle className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Órdenes de Taller Activas
            </span>
            <span className="text-3xl font-black text-blue-600 mt-1 block">
              {serviciosActivos}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">En banco de trabajo</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
            <Wrench className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Total Órdenes Históricas
            </span>
            <span className="text-3xl font-black text-slate-900 mt-1 block">
              {pedidos.length + servicios.length}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">Pedidos + Servicios</span>
          </div>
          <div className="w-12 h-12 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
            <Clock className="w-6 h-6" aria-hidden="true" />
          </div>
        </div>
      </div>

      {/* Alertas */}
      {successMessage && (
        <Alert type="success" title="Operación Exitosa" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      {error && (
        <Alert type="error" title="Atención" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Pestañas Principales: Despacho vs Servicios de Armería */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="flex border-b border-slate-200 bg-slate-50">
          <button
            type="button"
            onClick={() => {
              setActiveTab('pedidos');
              setFilterEstado('todos');
            }}
            className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'pedidos'
                ? 'border-blue-600 text-blue-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Truck className="w-5 h-5 text-blue-600" aria-hidden="true" />
            <span>Despacho y Estado de Pedidos ({pedidos.length})</span>
            {pedidosPendientes > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
                {pedidosPendientes}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('servicios');
              setFilterEstado('todos');
            }}
            className={`flex-1 py-4 px-6 text-sm font-bold flex items-center justify-center gap-2 border-b-2 transition-all cursor-pointer min-h-[44px] ${
              activeTab === 'servicios'
                ? 'border-amber-600 text-amber-700 bg-white'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Wrench className="w-5 h-5 text-amber-600" aria-hidden="true" />
            <span>Órdenes de Taller y Servicios Técnicos ({servicios.length})</span>
            {serviciosActivos > 0 && (
              <span className="bg-blue-600 text-white text-xs px-2 py-0.5 rounded-full font-extrabold ml-1">
                {serviciosActivos}
              </span>
            )}
          </button>
        </div>

        {/* Barra de Filtros */}
        <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3.5" aria-hidden="true" />
            <input
              type="text"
              placeholder={activeTab === 'pedidos' ? 'Buscar cliente o dirección...' : 'Buscar cliente o trabajo...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-4 h-4 text-slate-500" aria-hidden="true" />
            <select
              value={filterEstado}
              onChange={(e) => setFilterEstado(e.target.value)}
              className="px-3 py-2 border border-slate-300 rounded-lg text-sm bg-white focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer"
            >
              <option value="todos">Todos los Estados</option>
              {activeTab === 'pedidos' ? (
                <>
                  <option value="Pendiente">Pendiente</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="EnviadoStarken">Enviado Starken</option>
                  <option value="Entregado">Entregado</option>
                </>
              ) : (
                <>
                  <option value="Recibido">Recibido</option>
                  <option value="En Proceso">En Proceso</option>
                  <option value="Esperando Repuestos">Esperando Repuestos</option>
                  <option value="Finalizado">Finalizado</option>
                </>
              )}
            </select>
          </div>
        </div>

        {/* TABLA 1: DESPACHO DE PEDIDOS */}
        {activeTab === 'pedidos' && (
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <LoadingSkeleton count={4} className="h-20 w-full mb-3 rounded-lg" />
            ) : pedidosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Truck className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-base font-semibold">No se encontraron pedidos de clientes.</p>
                <p className="text-xs">Los nuevos pedidos realizados por clientes aparecerán automáticamente aquí.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase font-extrabold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3"># Pedido</th>
                      <th scope="col" className="p-3">Cliente / Destino</th>
                      <th scope="col" className="p-3">Detalle Artículos</th>
                      <th scope="col" className="p-3">Total</th>
                      <th scope="col" className="p-3">Estado Actual</th>
                      <th scope="col" className="p-3">Actualizar Despacho</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pedidosFiltrados.map((p) => (
                      <tr key={p.id_Pedido} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          #PED-{p.id_Pedido.toString().padStart(5, '0')}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {new Date(p.fechaPedido).toLocaleDateString('es-CL')}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{p.clienteNombre}</span>
                          <span className="text-xs text-slate-500 block">{p.clienteCorreo}</span>
                          <span className="inline-flex items-center gap-1 text-xs text-slate-600 mt-1">
                            <MapPin className="w-3 h-3 text-red-500 shrink-0" aria-hidden="true" />
                            {p.direccionEnvio || p.metodoEntrega}
                          </span>
                        </td>

                        <td className="p-3">
                          <ul className="text-xs space-y-1">
                            {p.detalles.map((d) => (
                              <li key={d.id_DetallePedido} className="text-slate-800">
                                &bull; <strong>{d.cantidad}x</strong> {d.productoNombre} ({formatCLP(d.subtotal)})
                              </li>
                            ))}
                          </ul>
                        </td>

                        <td className="p-3 font-extrabold text-emerald-700 text-base whitespace-nowrap">
                          {formatCLP(p.total)}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {getBadgeEstadoPedido(p.estadoPedido)}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={p.estadoPedido}
                            onChange={(e) => handleCambiarEstadoPedido(p.id_Pedido, e.target.value)}
                            aria-label={`Cambiar estado de pedido ${p.id_Pedido}`}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 cursor-pointer min-h-[36px]"
                          >
                            <option value="Pendiente">Pendiente</option>
                            <option value="En Proceso">En Preparación</option>
                            <option value="EnviadoStarken">Enviado Starken</option>
                            <option value="Entregado">Entregado</option>
                            <option value="Cancelado">Cancelado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TABLA 2: ÓRDENES DE TALLER */}
        {activeTab === 'servicios' && (
          <div className="p-4 sm:p-6">
            {isLoading ? (
              <LoadingSkeleton count={4} className="h-20 w-full mb-3 rounded-lg" />
            ) : serviciosFiltrados.length === 0 ? (
              <div className="py-12 text-center text-slate-500 space-y-2">
                <Wrench className="w-12 h-12 text-slate-300 mx-auto" />
                <p className="text-base font-semibold">No hay órdenes de servicio en el taller.</p>
                <p className="text-xs">Crea un nuevo ticket de trabajo con el botón superior.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-700">
                  <thead className="bg-slate-100 text-xs uppercase font-extrabold text-slate-600 border-b border-slate-200">
                    <tr>
                      <th scope="col" className="p-3"># Ticket</th>
                      <th scope="col" className="p-3">Servicio / Especialidad</th>
                      <th scope="col" className="p-3">Cliente & Detalle</th>
                      <th scope="col" className="p-3">Costo</th>
                      <th scope="col" className="p-3">Estado</th>
                      <th scope="col" className="p-3">Actualizar Taller</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {serviciosFiltrados.map((s) => (
                      <tr key={s.id_OrdenServicio} className="hover:bg-slate-50/80 transition-colors">
                        <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                          #SRV-{s.id_OrdenServicio.toString().padStart(5, '0')}
                          <span className="block text-[11px] font-normal text-slate-500">
                            {new Date(s.fechaIngreso).toLocaleDateString('es-CL')}
                          </span>
                        </td>

                        <td className="p-3">
                          <span className="font-bold text-slate-900 block">{s.tipoServicioNombre}</span>
                          <span className="text-xs text-slate-500">Técnico: {s.tecnicoNombre}</span>
                        </td>

                        <td className="p-3 max-w-xs">
                          <span className="font-semibold text-slate-900 block text-xs">{s.clienteNombre}</span>
                          <p className="text-xs text-slate-600 line-clamp-2 mt-0.5">
                            {s.descripcionProblemaOrItem}
                          </p>
                        </td>

                        <td className="p-3 font-extrabold text-amber-700 text-base whitespace-nowrap">
                          {formatCLP(s.costoTotal)}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          {getBadgeEstadoServicio(s.estado)}
                        </td>

                        <td className="p-3 whitespace-nowrap">
                          <select
                            value={s.estado}
                            onChange={(e) => handleCambiarEstadoServicio(s.id_OrdenServicio, e.target.value)}
                            aria-label={`Cambiar estado de orden ${s.id_OrdenServicio}`}
                            className="text-xs font-semibold px-2.5 py-1.5 rounded-lg border border-slate-300 bg-white hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-600 cursor-pointer min-h-[36px]"
                          >
                            <option value="Recibido">Recibido</option>
                            <option value="En Proceso">En Proceso</option>
                            <option value="Esperando Repuestos">Esperando Repuestos</option>
                            <option value="Finalizado">Finalizado</option>
                            <option value="Entregado">Entregado</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modal para Crear Nueva Orden de Servicio Técnico */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Ingresar Nueva Orden de Trabajo / Servicio Técnico"
        maxWidth="md"
      >
        <form onSubmit={handleCrearTicket} className="space-y-4 text-left" noValidate>
          <Input
            id="ticket-correo"
            label="Correo del Cliente"
            type="email"
            required
            value={clienteCorreo}
            onChange={(e) => setClienteCorreo(e.target.value)}
            helperText="Se asociará al cliente registrado en la base de datos."
          />

          <Select
            id="ticket-tipo"
            label="Tipo de Especialidad / Servicio"
            value={idTipoServicio}
            onChange={(e) => {
              const val = parseInt(e.target.value, 10);
              setIdTipoServicio(val);
              const found = tiposServicio.find((t) => t.id_TipoServicio === val);
              if (found) setCostoTotal(found.costoBase);
            }}
            options={tiposServicio.map((t) => ({
              value: t.id_TipoServicio,
              label: `${t.nombre} (${formatCLP(t.costoBase)})`,
            }))}
          />

          <Textarea
            id="ticket-desc"
            label="Descripción del Trabajo / Falla Reportada"
            required
            rows={3}
            placeholder="Detallar modelo del arma, síntomas observados, piezas a reemplazar o texto de parche personalizado..."
            value={descripcionProblema}
            onChange={(e) => setDescripcionProblema(e.target.value)}
          />

          <Input
            id="ticket-costo"
            label="Presupuesto Estimado / Costo Total (CLP)"
            type="number"
            min={1000}
            step={500}
            value={costoTotal}
            onChange={(e) => setCostoTotal(parseFloat(e.target.value) || 0)}
          />

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={() => setIsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isCreatingTicket}
              className="bg-amber-600 hover:bg-amber-700 active:bg-amber-800 font-bold"
              icon={<Wrench className="w-4 h-4" aria-hidden="true" />}
            >
              Registrar Ticket en Taller
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

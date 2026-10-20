import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  BarChart3,
  CheckCircle,
  Clock,
  DollarSign,
  FileText,
  Package,
  PieChart,
  RefreshCw,
  ShieldAlert,
  TrendingUp,
  Truck,
  Wrench,
} from 'lucide-react';
import { productoService } from '../services/productoService';
import { EstadisticasResponse } from '../types/producto';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { getCategorySymbol } from '../utils/productImages';

export const EstadisticasPage: React.FC = () => {
  const [stats, setStats] = useState<EstadisticasResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadStats = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await productoService.getEstadisticas();
      setStats(data);
    } catch (err: unknown) {
      const errorMsg =
        err instanceof Error ? err.message : 'No fue posible cargar las estadísticas del inventario.';
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getBadgeEstadoTransaccion = (estado: string) => {
    switch (estado) {
      case 'Entregado':
      case 'Finalizado':
        return <Badge variant="emerald">{estado}</Badge>;
      case 'EnviadoStarken':
        return <Badge variant="blue">Enviado</Badge>;
      case 'En Proceso':
        return <Badge variant="amber">En Proceso</Badge>;
      case 'Pendiente':
      case 'Recibido':
      default:
        return <Badge variant="red">{estado}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6 text-left">
        <LoadingSkeleton count={1} className="h-10 w-64" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <LoadingSkeleton count={4} className="h-28 w-full rounded-xl" />
        </div>
        <LoadingSkeleton count={3} className="h-56 w-full rounded-xl" />
      </div>
    );
  }

  if (error || !stats) {
    return (
      <div className="max-w-xl mx-auto my-12 space-y-4 text-left">
        <Alert type="error" title="Falla al obtener métricas">
          {error || 'No hay información de estadísticas disponible.'}
        </Alert>
        <div className="flex gap-3">
          <Button variant="outline" onClick={loadStats} icon={<RefreshCw className="w-4 h-4" />}>
            Reintentar
          </Button>
          <Link to="/productos">
            <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
              Volver al catálogo
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-left">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link
              to="/productos"
              className="text-xs font-semibold text-slate-500 hover:text-blue-700 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              Volver al catálogo
            </Link>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-7 h-7 text-blue-700" aria-hidden="true" />
            Panel de Estadísticas y Negocio
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Métricas comerciales en tiempo real, balance financiero consolidado y flujo de pedidos y servicios
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/panel-tecnico">
            <Button variant="outline" icon={<Wrench className="w-4 h-4" />}>
              Ver Panel Técnico
            </Button>
          </Link>

          <Button
            variant="primary"
            onClick={loadStats}
            icon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
            className="self-start sm:self-auto font-semibold"
          >
            Actualizar Datos
          </Button>
        </div>
      </div>

      {/* 1. KPIs Principales en Cuadrícula (Contadores Globales y Facturación) */}
      <section aria-label="Indicadores Clave de Desempeño (KPIs)">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Tarjeta 1: Total Facturado Consolidado */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Facturado
              </span>
              <span className="text-xl sm:text-2xl font-black text-emerald-700 mt-1 block tracking-tight">
                {formatCLP(stats.totalFacturado ?? 0)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Ventas + Servicios
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Tarjeta 2: Pedidos de Clientes */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Pedidos Clientes
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stats.totalPedidos ?? 0}
              </span>
              <span className="text-[11px] text-amber-700 font-semibold mt-0.5 block">
                {stats.pedidosPendientesCount ?? 0} pendientes
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Truck className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Tarjeta 3: Órdenes de Taller Técnico */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Taller y Servicios
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stats.totalServicios ?? 0}
              </span>
              <span className="text-[11px] text-blue-700 font-semibold mt-0.5 block">
                {stats.serviciosEnProcesoCount ?? 0} en proceso
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
              <Wrench className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Tarjeta 4: Total Productos Catálogo */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Total Productos
              </span>
              <span className="text-2xl font-black text-slate-900 mt-1 block">
                {stats.totalProductos}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                {stats.totalStock.toLocaleString('es-CL')} un. en stock
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
              <Package className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>

          {/* Tarjeta 5: Valorización Bodega */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Valor Bodega
              </span>
              <span className="text-xl sm:text-2xl font-black text-purple-700 mt-1 block tracking-tight">
                {formatCLP(stats.valorInventario)}
              </span>
              <span className="text-[11px] text-slate-500 mt-0.5 block">
                Inventario activo
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <DollarSign className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
        </div>
      </section>

      {/* 2. Sección: Últimas Transacciones Comerciales y Facturas (Requerimiento de Negocio) */}
      <section
        aria-labelledby="transacciones-titulo"
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <h2 id="transacciones-titulo" className="text-lg font-bold text-slate-900">
              Últimas Transacciones Comerciales y Facturas
            </h2>
          </div>
          <span className="text-xs text-slate-500 font-medium">
            Sincronizadas en tiempo real desde SQL Server
          </span>
        </div>

        {!stats.ultimasTransacciones || stats.ultimasTransacciones.length === 0 ? (
          <div className="py-8 text-center text-slate-500">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm">No hay transacciones comerciales recientes registradas.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-700">
              <thead className="bg-slate-50 text-xs uppercase font-extrabold text-slate-600 border-b border-slate-200">
                <tr>
                  <th scope="col" className="p-3"># Doc / Folio</th>
                  <th scope="col" className="p-3">Concepto / Tipo</th>
                  <th scope="col" className="p-3">Cliente</th>
                  <th scope="col" className="p-3">Fecha</th>
                  <th scope="col" className="p-3">Estado</th>
                  <th scope="col" className="p-3 text-right">Monto Facturado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {stats.ultimasTransacciones.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-3 font-mono font-bold text-slate-900 whitespace-nowrap">
                      {t.id}
                    </td>
                    <td className="p-3 font-semibold text-slate-900">
                      {t.tipo}
                    </td>
                    <td className="p-3 text-slate-700">
                      {t.cliente}
                    </td>
                    <td className="p-3 text-xs text-slate-500 whitespace-nowrap">
                      {new Date(t.fecha).toLocaleDateString('es-CL', {
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {getBadgeEstadoTransaccion(t.estado)}
                    </td>
                    <td className="p-3 text-right font-extrabold text-emerald-700 whitespace-nowrap">
                      {formatCLP(t.monto)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* 3. Distribución de Inventario por Categoría */}
      <section
        aria-labelledby="distribucion-titulo"
        className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs"
      >
        <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-5">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-blue-700" aria-hidden="true" />
            <h2 id="distribucion-titulo" className="text-lg font-bold text-slate-900">
              Distribución y Valorización por Categoría
            </h2>
          </div>
          <span className="text-xs text-slate-500">5 Categorías Activas</span>
        </div>

        <div className="space-y-5">
          {stats.porCategoria.map((cat) => {
            const percentage =
              stats.valorInventario > 0
                ? Math.round((cat.valorInventario / stats.valorInventario) * 100)
                : 0;
            const symbol = getCategorySymbol(cat.idCategoria);

            return (
              <div key={cat.idCategoria} className="space-y-1.5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-sm gap-1">
                  <div className="flex items-center gap-2">
                    <span className="text-lg" aria-hidden="true">
                      {symbol}
                    </span>
                    <span className="font-bold text-slate-900">{cat.nombre}</span>
                    <Badge variant="blue" size="sm">
                      {cat.totalProductos} productos
                    </Badge>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <span>
                      Stock: <strong className="text-slate-800">{cat.stockTotal} un.</strong>
                    </span>
                    <span className="text-slate-300">|</span>
                    <span>
                      Valor: <strong className="text-slate-900">{formatCLP(cat.valorInventario)}</strong>
                    </span>
                    <span className="font-bold text-blue-700 w-12 text-right">
                      {percentage}%
                    </span>
                  </div>
                </div>

                {/* Barra de progreso visual */}
                <div
                  className="w-full bg-slate-100 rounded-full h-3 overflow-hidden"
                  role="progressbar"
                  aria-valuenow={percentage}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`Porcentaje de valorización de ${cat.nombre}: ${percentage}%`}
                >
                  <div
                    className="bg-blue-600 h-full rounded-full transition-all duration-500"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 4. Top Productos Más Vendidos y Alertas de Stock Urgente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Vendidos */}
        <section
          aria-labelledby="top-vendidos-titulo"
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center gap-2 border-b border-slate-100 pb-4 mb-4">
              <TrendingUp className="w-5 h-5 text-emerald-600" aria-hidden="true" />
              <h2 id="top-vendidos-titulo" className="text-lg font-bold text-slate-900">
                Productos con Mayor Demanda y Ventas
              </h2>
            </div>

            {stats.topVendidos.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Aún no hay registros de pedidos consolidados en el sistema.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.topVendidos.map((prod, index) => (
                  <li key={prod.idProducto} className="py-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0">
                        {index + 1}
                      </span>
                      <div>
                        <Link
                          to={`/productos/${prod.idProducto}`}
                          className="font-bold text-sm text-slate-900 hover:text-blue-700 hover:underline"
                        >
                          {prod.nombre}
                        </Link>
                        <span className="text-xs text-slate-500 block">
                          {prod.cantidadVendida} unidades vendidas
                        </span>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-xs text-slate-400 block uppercase font-semibold">
                        Recaudado
                      </span>
                      <span className="font-extrabold text-sm text-emerald-700">
                        {formatCLP(prod.totalRecaudado)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500 text-center">
            Métrica calculada a partir del histórico de órdenes de compra
          </div>
        </section>

        {/* Alertas de Stock Urgente */}
        <section
          aria-labelledby="alertas-stock-titulo"
          className="bg-white rounded-xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between"
        >
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" aria-hidden="true" />
                <h2 id="alertas-stock-titulo" className="text-lg font-bold text-slate-900">
                  Alertas de Reposición Urgente
                </h2>
              </div>
              <Badge variant="amber" size="sm">
                {stats.alertasStock.length} productos
              </Badge>
            </div>

            {stats.alertasStock.length === 0 ? (
              <p className="text-sm text-slate-500 py-6 text-center">
                Todo el inventario se encuentra en niveles óptimos de abastecimiento.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {stats.alertasStock.map((prod) => (
                  <li key={prod.idProducto} className="py-3 flex items-center justify-between gap-3">
                    <div>
                      <Link
                        to={`/productos/${prod.idProducto}`}
                        className="font-bold text-sm text-slate-900 hover:text-blue-700 hover:underline"
                      >
                        {prod.nombre}
                      </Link>
                      <span className="text-xs text-slate-500 block">
                        Categoría: {prod.categoria} &bull; Precio: {formatCLP(prod.precio)}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          prod.stock <= 5
                            ? 'bg-red-100 text-red-800 animate-pulse'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {prod.stock} un. restantes
                      </span>
                      <Link to={`/productos/editar/${prod.idProducto}`}>
                        <Button
                          variant="ghost"
                          className="text-xs py-1 px-2.5 min-h-[38px] text-blue-700"
                        >
                          Reabastecer
                        </Button>
                      </Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="pt-4 border-t border-slate-100 mt-4 text-xs text-slate-500 text-center">
            Se aconseja generar orden de compra a proveedores cuando el stock es inferior a 10 un.
          </div>
        </section>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Calendar,
  CheckCircle,
  Clock,
  MapPin,
  Package,
  PackageCheck,
  RefreshCw,
  ShoppingBag,
  Truck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { pedidoService } from '../services/pedidoService';
import { Pedido } from '../types/pedido';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const MisPedidosPage: React.FC = () => {
  const { user } = useAuth();
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadPedidos = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await pedidoService.getMisPedidos(user?.id, user?.correo);
      setPedidos(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'No fue posible cargar el historial de compras.';
      setError(msg);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPedidos();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (isoString: string) => {
    try {
      return new Date(isoString).toLocaleDateString('es-CL', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoString;
    }
  };

  const getStatusBadge = (estado: string) => {
    switch (estado) {
      case 'Pendiente':
      case 'Creado':
        return (
          <Badge variant="amber" icon={<Clock className="w-3.5 h-3.5" />}>
            En Preparación
          </Badge>
        );
      case 'En Proceso':
      case 'Pagado':
        return (
          <Badge variant="blue" icon={<Package className="w-3.5 h-3.5" />}>
            Armando Pedido
          </Badge>
        );
      case 'EnviadoStarken':
        return (
          <Badge variant="purple" icon={<Truck className="w-3.5 h-3.5" />}>
            En Ruta (Starken)
          </Badge>
        );
      case 'Entregado':
        return (
          <Badge variant="emerald" icon={<CheckCircle className="w-3.5 h-3.5" />}>
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
            <ShoppingBag className="w-7 h-7 text-blue-700" aria-hidden="true" />
            Mis Pedidos y Compras
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Revisa el estado de despacho, número de orden y detalle de tus adquisiciones en Búfalos Tactical
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            onClick={loadPedidos}
            icon={<RefreshCw className="w-4 h-4" aria-hidden="true" />}
            className="font-semibold"
          >
            Actualizar
          </Button>
          <Link to="/productos">
            <Button variant="primary" className="font-semibold shadow-xs">
              Nueva Compra
            </Button>
          </Link>
        </div>
      </div>

      {/* Alerta de Error */}
      {error && (
        <Alert type="error" title="Falla al obtener pedidos" onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={3} className="h-40 w-full rounded-xl" />
        </div>
      ) : pedidos.length === 0 ? (
        /* Estado Vacío */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div
            className="w-16 h-16 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-4"
            aria-hidden="true"
          >
            <PackageCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Aún no tienes pedidos registrados</h2>
          <p className="text-slate-600 text-sm mb-6 leading-relaxed">
            Explora nuestro catálogo táctico para equiparte con indumentaria, réplicas de airsoft, óptica o elementos de protección.
          </p>
          <Link to="/productos">
            <Button variant="primary" className="font-bold">
              Ir al Catálogo de Productos
            </Button>
          </Link>
        </div>
      ) : (
        /* Listado de Pedidos */
        <div className="space-y-5">
          {pedidos.map((pedido) => (
            <article
              key={pedido.id_Pedido}
              className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs hover:border-slate-300 transition-all"
            >
              {/* Barra superior de la orden */}
              <div className="bg-slate-50/80 px-5 py-3.5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-black text-slate-900 text-sm tracking-tight font-mono">
                    Orden #{pedido.id_Pedido.toString().padStart(5, '0')}
                  </span>
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Calendar className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{formatDate(pedido.fechaPedido)}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-slate-500">Estado:</span>
                  {getStatusBadge(pedido.estadoPedido)}
                </div>
              </div>

              {/* Contenido: Información de entrega y desglose de artículos */}
              <div className="p-5 grid grid-cols-1 md:grid-cols-12 gap-5">
                {/* Despacho y Dirección */}
                <div className="md:col-span-5 space-y-2 text-xs border-b md:border-b-0 md:border-r border-slate-100 pb-4 md:pb-0 md:pr-4">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Modalidad de Entrega
                  </span>
                  <div className="flex items-center gap-2 text-slate-800 font-semibold">
                    <Truck className="w-4 h-4 text-blue-600 shrink-0" aria-hidden="true" />
                    <span>
                      {pedido.metodoEntrega === 'Starken'
                        ? 'Envío a Domicilio / Sucursal Starken'
                        : 'Retiro en Armería Búfalos'}
                    </span>
                  </div>

                  <div className="flex items-start gap-2 text-slate-600 pt-1">
                    <MapPin className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" aria-hidden="true" />
                    <span className="line-clamp-2">
                      {pedido.direccionEnvio || 'Retiro presencial en tienda'}
                    </span>
                  </div>
                </div>

                {/* Desglose de Productos */}
                <div className="md:col-span-7 space-y-2">
                  <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                    Artículos en la Orden
                  </span>
                  <div className="divide-y divide-slate-100">
                    {pedido.detalles.map((item) => (
                      <div
                        key={item.id_DetallePedido}
                        className="py-2 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-800">
                            {item.cantidad}x
                          </span>
                          <span className="text-slate-700">{item.productoNombre}</span>
                        </div>
                        <span className="font-bold text-slate-900 font-mono">
                          {formatCLP(item.subtotal)}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Total general */}
                  <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Total Cancelado
                    </span>
                    <span className="text-lg font-black text-slate-900 tracking-tight font-mono">
                      {formatCLP(pedido.total)}
                    </span>
                  </div>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
};

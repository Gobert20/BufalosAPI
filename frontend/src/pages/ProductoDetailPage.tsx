import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  Lock,
  Package,
  Pencil,
  ShoppingBag,
  Tag,
  Trash2,
  Truck,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { productoService } from '../services/productoService';
import { ApiError } from '../types/api';
import { Producto } from '../types/producto';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { ProductImageCard } from '../components/ui/ProductImageCard';
import { OrderModal } from '../components/orders/OrderModal';

export const ProductoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [orderSuccessMsg, setOrderSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const fetchProducto = async () => {
      if (!id) return;
      setIsLoading(true);
      setError(null);
      try {
        const data = await productoService.getProductoById(Number(id));
        setProducto(data);
      } catch (err) {
        const apiErr = err as ApiError;
        setError(apiErr.message || 'No se pudo cargar la información del producto.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducto();
  }, [id]);

  const handleDelete = async () => {
    if (!producto) return;
    setIsDeleting(true);
    try {
      await productoService.deleteProducto(producto.id_Producto);
      navigate('/productos', { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al eliminar el producto.');
      setIsConfirmOpen(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleOrderSuccess = (pedidoId: number, _: number, cantidad: number) => {
    setProducto((prev) => (prev ? { ...prev, stock: Math.max(0, prev.stock - cantidad) } : null));
    setOrderSuccessMsg(
      `¡Compra registrada con éxito! Folio #PED-${pedidoId.toString().padStart(5, '0')}. Notificación enviada al Panel Técnico.`
    );
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
    }).format(price);
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto space-y-6">
        <LoadingSkeleton count={1} className="h-10 w-48" />
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <LoadingSkeleton count={5} className="h-6 w-full mb-3" />
        </div>
      </div>
    );
  }

  if (error || !producto) {
    return (
      <div className="max-w-2xl mx-auto my-8 space-y-4">
        <Alert type="error" title="Error al consultar detalle">
          {error || 'El producto solicitado no existe.'}
        </Alert>
        <Link to="/productos">
          <Button variant="outline" icon={<ArrowLeft className="w-4 h-4" />}>
            Volver al catálogo
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6 text-left">
      {orderSuccessMsg && (
        <Alert type="success" title="Pedido Exitoso" onClose={() => setOrderSuccessMsg(null)}>
          {orderSuccessMsg}
        </Alert>
      )}

      {/* Navegación y Botones de Acción */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/productos">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Volver al catálogo
          </Button>
        </Link>

        <div className="flex items-center gap-2">
          {/* Botón Comprar para Rol Cliente */}
          <Button
            variant="primary"
            onClick={() => setIsBuyModalOpen(true)}
            disabled={producto.stock <= 0}
            className="bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 font-bold shadow-xs min-h-[44px]"
            icon={<ShoppingBag className="w-4 h-4" aria-hidden="true" />}
          >
            {producto.stock > 0 ? 'Comprar / Realizar Pedido' : 'Sin Stock'}
          </Button>

          {isAdmin && (
            <>
              <Link to={`/productos/editar/${producto.id_Producto}`}>
                <Button
                  variant="outline"
                  icon={<Pencil className="w-4 h-4 text-blue-600" />}
                >
                  Editar
                </Button>
              </Link>
              <Button
                variant="danger"
                icon={<Trash2 className="w-4 h-4" />}
                onClick={() => setIsConfirmOpen(true)}
              >
                Eliminar
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Tarjeta Principal de Detalle */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ProductImageCard
          nombre={producto.nombre}
          categoriaId={producto.id_Categoria}
          imagenUrl={producto.imagenUrl}
          className="w-full h-64 sm:h-80"
          aspectRatio="aspect-16/9"
        />

        {/* Cabecera */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center justify-between gap-3 mb-3">
            <Badge variant="blue" size="md" icon={<Tag className="w-3.5 h-3.5" />}>
              {producto.categoria?.nombre || 'General'}
            </Badge>
            <span className="font-mono text-sm text-slate-400">ID #{producto.id_Producto}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white mb-2">
            {producto.nombre}
          </h1>
          {producto.numeroSerie && (
            <p className="text-xs font-mono text-slate-300">
              Número de serie: <span className="text-blue-300">{producto.numeroSerie}</span>
            </p>
          )}
        </div>

        {/* Contenido del Detalle */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Precio y Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 items-center">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Precio Unitario
              </span>
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(producto.precio)}
              </span>
            </div>
            <div className="sm:text-right flex flex-col sm:items-end gap-2">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                  Disponibilidad en Bodega
                </span>
                <span
                  className={`text-sm font-bold inline-block mt-1 px-3 py-0.5 rounded-full ${
                    producto.stock > 0
                      ? 'bg-emerald-100 text-emerald-900'
                      : 'bg-red-100 text-red-900'
                  }`}
                >
                  {producto.stock > 0 ? `${producto.stock} unidades disponibles` : 'Sin stock'}
                </span>
              </div>
            </div>
          </div>

          {/* Descripción */}
          <div className="space-y-2">
            <h2 className="text-lg font-bold text-slate-900">Especificaciones y Descripción</h2>
            <p className="text-slate-700 leading-relaxed text-sm sm:text-base">
              {producto.descripcion || 'Sin descripción técnica disponible para este producto.'}
            </p>
          </div>

          {/* Ficha Técnica y Controles Legales */}
          <div className="border-t border-slate-200 pt-6">
            <h2 className="text-base font-bold text-slate-900 mb-4">
              Restricciones Legales y Normativas
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">Restricción de Edad</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 inline-block">
                  {producto.restriccionEdad > 0
                    ? `+${producto.restriccionEdad} años obligatoria`
                    : 'Todo público'}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">Requiere Permiso DGMN</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 inline-flex items-center gap-1">
                  {producto.requierePermiso ? (
                    <>
                      <AlertTriangle className="w-4 h-4 text-amber-600" aria-hidden="true" />
                      Requiere credencial
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-4 h-4 text-emerald-600" aria-hidden="true" />
                      Venta libre
                    </>
                  )}
                </span>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/50">
                <span className="text-xs text-slate-500 block">Acceso Restringido</span>
                <span className="font-bold text-slate-800 text-sm mt-0.5 inline-flex items-center gap-1">
                  {producto.soloPersonalAutorizado ? (
                    <>
                      <Lock className="w-4 h-4 text-purple-600" aria-hidden="true" />
                      Personal Autorizado
                    </>
                  ) : (
                    <>
                      <Package className="w-4 h-4 text-slate-500" aria-hidden="true" />
                      Uso general
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>

          {/* Proveedores Oficiales (TB_Proveedores y TB_ProveedoresProductos) */}
          <div className="border-t border-slate-200 pt-6">
            <div className="flex items-center gap-2 mb-4">
              <Truck className="w-5 h-5 text-blue-600" aria-hidden="true" />
              <h2 className="text-base font-bold text-slate-900">
                Proveedores y Distribuidores Autorizados
              </h2>
            </div>

            {producto.proveedores && producto.proveedores.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {producto.proveedores.map((prov) => (
                  <div
                    key={prov.id_Proveedor}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-slate-50 transition-colors space-y-1.5"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <h3 className="font-bold text-sm text-slate-900 truncate">
                        {prov.nombreEmpresa}
                      </h3>
                      <Badge variant="blue" size="sm">Oficial</Badge>
                    </div>
                    {prov.contacto && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Contacto:</span> {prov.contacto}
                      </p>
                    )}
                    {prov.telefono && (
                      <p className="text-xs text-slate-600">
                        <span className="font-semibold text-slate-700">Teléfono:</span> {prov.telefono}
                      </p>
                    )}
                    {prov.correo && (
                      <p className="text-xs text-slate-600 truncate">
                        <span className="font-semibold text-slate-700">Correo:</span> {prov.correo}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl border border-dashed border-slate-200 bg-slate-50 text-slate-500 text-sm">
                Suministro directo / Fabricante interno (sin proveedores intermediarios registrados).
              </div>
            )}
          </div>
        </div>
      </article>

      {/* Modal para Realizar Compra Directa */}
      <OrderModal
        producto={producto}
        isOpen={isBuyModalOpen}
        onClose={() => setIsBuyModalOpen(false)}
        onSuccess={handleOrderSuccess}
      />

      {/* Diálogo de Eliminación */}
      <ConfirmDialog
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        onConfirm={handleDelete}
        title="Eliminar Producto"
        message={`¿Confirma la eliminación permanente del producto "${producto.nombre}"?`}
        isLoading={isDeleting}
      />
    </div>
  );
};

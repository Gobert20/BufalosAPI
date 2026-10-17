import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle,
  FileText,
  Lock,
  Package,
  Pencil,
  Shield,
  Tag,
  Trash2,
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

export const ProductoDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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
      {/* Navegación y Acciones Superiores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <Link to="/productos">
          <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
            Volver al catálogo
          </Button>
        </Link>

        {isAdmin && (
          <div className="flex items-center gap-2">
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
          </div>
        )}
      </div>

      {/* Tarjeta Principal de Detalle */}
      <article className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <ProductImageCard
          nombre={producto.nombre}
          categoriaId={producto.id_Categoria}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200">
            <div>
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Precio Unitario
              </span>
              <span className="text-3xl font-black text-slate-900">
                {formatPrice(producto.precio)}
              </span>
            </div>
            <div className="sm:text-right">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
                Disponibilidad en Bodega
              </span>
              <span
                className={`text-xl font-bold inline-block mt-1 px-3 py-0.5 rounded-full ${
                  producto.stock > 0
                    ? 'bg-emerald-100 text-emerald-900'
                    : 'bg-red-100 text-red-900'
                }`}
              >
                {producto.stock} unidades en stock
              </span>
            </div>
          </div>

          {/* Descripción */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Descripción del Producto
            </h2>
            <p className="text-slate-700 leading-relaxed text-base bg-white p-4 rounded-xl border border-slate-100 shadow-2xs">
              {producto.descripcion || 'Sin descripción detallada registrada para este artículo.'}
            </p>
          </div>

          {/* Restricciones y Permisos */}
          <div>
            <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-3 flex items-center gap-2">
              <Shield className="w-4 h-4 text-blue-600" aria-hidden="true" />
              Restricciones Legales y de Seguridad
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
        </div>
      </article>

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

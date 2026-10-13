import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  Filter,
  Package,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  Trash2,
  X,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { ApiError } from '../types/api';
import { Categoria, Producto } from '../types/producto';
import { Alert } from '../components/ui/Alert';
import { Badge } from '../components/ui/Badge';
import { Button } from '../components/ui/Button';
import { ConfirmDialog } from '../components/ui/ConfirmDialog';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';

export const ProductosListPage: React.FC = () => {
  const { isAdmin } = useAuth();

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number>(0);

  // Paginación en cliente
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 6;

  // Eliminación con confirmación accesible
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);

  // Carga inicial de datos
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [prodsData, catsData] = await Promise.all([
        productoService.getProductos(searchTerm, selectedCategoriaId),
        categoriaService.getCategorias().catch(() => []),
      ]);
      setProductos(prodsData);
      setCategorias(catsData);
      setCurrentPage(1);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'No fue posible cargar el listado de productos.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCategoriaId]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedCategoriaId(0);
    productoService.getProductos('', 0).then(setProductos).catch(() => {});
  };

  // Paginación calculada
  const totalPages = Math.ceil(productos.length / pageSize) || 1;
  const paginatedProductos = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return productos.slice(start, start + pageSize);
  }, [productos, currentPage, pageSize]);

  // Ejecución de eliminación
  const handleConfirmDelete = async () => {
    if (!productoToDelete) return;
    setIsDeleting(true);
    try {
      await productoService.deleteProducto(productoToDelete.id_Producto);
      setProductos((prev) => prev.filter((p) => p.id_Producto !== productoToDelete.id_Producto));
      setDeleteNotification(`El producto "${productoToDelete.nombre}" fue eliminado exitosamente.`);
      setProductoToDelete(null);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al eliminar el producto.');
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

  return (
    <div className="space-y-6">
      {/* Encabezado y Acciones */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-5">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2.5">
            <Package className="w-7 h-7 text-blue-700" aria-hidden="true" />
            Catálogo de Productos Tácticos
          </h1>
          <p className="text-slate-600 text-sm mt-1">
            Gestión y consulta de artículos de protección, indumentaria militar y seguridad
          </p>
        </div>

        {isAdmin && (
          <Link to="/productos/nuevo" className="self-start sm:self-auto">
            <Button
              variant="primary"
              icon={<PlusCircle className="w-5 h-5" aria-hidden="true" />}
              className="font-bold shadow-md w-full sm:w-auto"
            >
              Nuevo Producto
            </Button>
          </Link>
        )}
      </div>

      {/* Notificación de eliminación exitosa */}
      {deleteNotification && (
        <Alert
          type="success"
          title="Operación exitosa"
          onClose={() => setDeleteNotification(null)}
        >
          {deleteNotification}
        </Alert>
      )}

      {/* Notificación de Error */}
      {error && (
        <Alert
          type="error"
          title="Falla en la operación"
          onClose={() => setError(null)}
        >
          <div className="flex flex-col gap-2">
            <span>{error}</span>
            <Button
              variant="outline"
              className="self-start text-xs py-1 px-3 min-h-[36px]"
              onClick={loadData}
              icon={<RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />}
            >
              Reintentar
            </Button>
          </div>
        </Alert>
      )}

      {/* Barra de Filtros y Búsqueda */}
      <section
        aria-label="Filtros de búsqueda"
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs"
      >
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-3 items-end">
          {/* Campo de búsqueda */}
          <div className="md:col-span-5 text-left">
            <label htmlFor="search-input" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Buscar por nombre o descripción
            </label>
            <div className="relative">
              <input
                id="search-input"
                type="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Ej: Chaqueta, Botas, Assault..."
                className="w-full min-h-[44px] pl-10 pr-3 rounded-lg border border-slate-300 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Filtro por Categoría (Recurso Relacionado) */}
          <div className="md:col-span-4 text-left">
            <label htmlFor="categoria-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
              Filtrar por Categoría
            </label>
            <div className="relative">
              <select
                id="categoria-select"
                value={selectedCategoriaId}
                onChange={(e) => setSelectedCategoriaId(Number(e.target.value))}
                className="w-full min-h-[44px] pl-10 pr-3 rounded-lg border border-slate-300 text-sm text-slate-900 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600 cursor-pointer"
              >
                <option value={0}>Todas las categorías</option>
                {categorias.map((cat) => (
                  <option key={cat.id_Categoria} value={cat.id_Categoria}>
                    {cat.nombre}
                  </option>
                ))}
              </select>
              <Filter className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" aria-hidden="true" />
            </div>
          </div>

          {/* Botones de acción del filtro */}
          <div className="md:col-span-3 flex items-center gap-2">
            <Button
              type="submit"
              variant="primary"
              className="flex-1 font-semibold"
              icon={<Search className="w-4 h-4" aria-hidden="true" />}
            >
              Buscar
            </Button>
            {(searchTerm || selectedCategoriaId > 0) && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClearFilters}
                aria-label="Limpiar filtros de búsqueda"
                className="min-w-[44px] p-2 flex items-center justify-center text-slate-600 hover:text-slate-900"
              >
                <X className="w-5 h-5" aria-hidden="true" />
              </Button>
            )}
          </div>
        </form>
      </section>

      {/* Región de Resultados / Live Region para lectores de pantalla */}
      <div aria-live="polite" className="sr-only">
        {isLoading
          ? 'Cargando productos...'
          : `Se encontraron ${productos.length} productos en el catálogo.`}
      </div>

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="space-y-4">
          <LoadingSkeleton count={4} className="h-20 w-full" />
        </div>
      ) : productos.length === 0 ? (
        /* Estado Vacío */
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center max-w-lg mx-auto shadow-xs">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4" aria-hidden="true">
            <AlertCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">No se encontraron productos</h2>
          <p className="text-slate-600 text-sm mb-6">
            No existen registros que coincidan con los criterios de búsqueda o la categoría seleccionada.
          </p>
          <Button variant="outline" onClick={handleClearFilters}>
            Restablecer filtros
          </Button>
        </div>
      ) : (
        /* Listado de Productos: Adaptativo Móvil (Tarjetas) y Escritorio (Tabla Semántica) */
        <div className="space-y-4">
          {/* Vista Escritorio: Tabla Semántica (hidden en pantallas pequeñas) */}
          <div className="hidden lg:block bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left border-collapse">
              <caption className="sr-only">Listado de productos tácticos disponibles</caption>
              <thead className="bg-slate-100 text-slate-700 text-xs font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th scope="col" className="px-4 py-3.5">ID</th>
                  <th scope="col" className="px-4 py-3.5">Producto</th>
                  <th scope="col" className="px-4 py-3.5">Categoría</th>
                  <th scope="col" className="px-4 py-3.5">Precio</th>
                  <th scope="col" className="px-4 py-3.5">Stock</th>
                  <th scope="col" className="px-4 py-3.5">Restricción</th>
                  <th scope="col" className="px-4 py-3.5 text-right">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm">
                {paginatedProductos.map((p) => {
                  const id = p.id_Producto;
                  const nombre = p.nombre;
                  const desc = p.descripcion;
                  const precio = p.precio;
                  const stock = p.stock;
                  const catNombre = p.categoria?.nombre || 'General';

                  return (
                    <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{id}</td>
                      <td className="px-4 py-3.5">
                        <Link
                          to={`/productos/${id}`}
                          className="font-bold text-slate-900 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
                        >
                          {nombre}
                        </Link>
                        {desc && <p className="text-xs text-slate-500 truncate max-w-xs">{desc}</p>}
                      </td>
                      <td className="px-4 py-3.5">
                        <Badge variant="blue" size="sm">
                          {catNombre}
                        </Badge>
                      </td>
                      <td className="px-4 py-3.5 font-bold text-slate-900">{formatPrice(precio)}</td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                            stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stock} un.
                        </span>
                      </td>
                      <td className="px-4 py-3.5">
                        {p.restriccionEdad > 0 ? (
                          <Badge variant="red" size="sm" icon={<Shield className="w-3 h-3" />}>
                            +{p.restriccionEdad} años
                          </Badge>
                        ) : (
                          <span className="text-xs text-slate-400">Sin restricción</span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link to={`/productos/${id}`}>
                            <Button
                              variant="ghost"
                              aria-label={`Ver detalle de ${nombre}`}
                              className="p-2 min-h-[44px] min-w-[44px]"
                            >
                              <Eye className="w-4 h-4 text-slate-600" aria-hidden="true" />
                            </Button>
                          </Link>

                          {isAdmin && (
                            <>
                              <Link to={`/productos/editar/${id}`}>
                                <Button
                                  variant="ghost"
                                  aria-label={`Editar producto ${nombre}`}
                                  className="p-2 min-h-[44px] min-w-[44px]"
                                >
                                  <Pencil className="w-4 h-4 text-blue-600" aria-hidden="true" />
                                </Button>
                              </Link>
                              <Button
                                variant="ghost"
                                aria-label={`Eliminar producto ${nombre}`}
                                onClick={() => setProductoToDelete(p)}
                                className="p-2 min-h-[44px] min-w-[44px] text-red-600 hover:bg-red-50 hover:text-red-700"
                              >
                                <Trash2 className="w-4 h-4" aria-hidden="true" />
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Vista Móvil y Tablet: Tarjetas Fluidas con Touch Targets >= 44x44px */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:hidden gap-4">
            {paginatedProductos.map((p) => {
              const id = p.id_Producto;
              const nombre = p.nombre;
              const desc = p.descripcion;
              const precio = p.precio;
              const stock = p.stock;
              const catNombre = p.categoria?.nombre || 'General';

              return (
                <article
                  key={id}
                  className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col justify-between gap-3 text-left"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <Badge variant="blue" size="sm">
                        {catNombre}
                      </Badge>
                      <span className="font-mono text-xs text-slate-400">#{id}</span>
                    </div>

                    <h2 className="text-base font-bold text-slate-900 leading-snug">
                      <Link
                        to={`/productos/${id}`}
                        className="hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
                      >
                        {nombre}
                      </Link>
                    </h2>

                    {desc && (
                      <p className="text-xs text-slate-600 mt-1 line-clamp-2 leading-relaxed">
                        {desc}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                      <div>
                        <span className="text-xs text-slate-500 block">Precio</span>
                        <span className="text-lg font-black text-slate-900">{formatPrice(precio)}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Disponibles</span>
                        <span
                          className={`font-semibold text-xs px-2 py-0.5 rounded-full inline-block ${
                            stock > 5 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {stock} u.
                        </span>
                      </div>
                    </div>

                    {p.restriccionEdad > 0 && (
                      <div className="mt-2">
                        <Badge variant="red" size="sm" icon={<Shield className="w-3 h-3" />}>
                          Restricción edad: +{p.restriccionEdad}
                        </Badge>
                      </div>
                    )}
                  </div>

                  {/* Acciones móviles con botones táctiles mínimos de 44px */}
                  <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                    <Link to={`/productos/${id}`} className="flex-1">
                      <Button
                        variant="outline"
                        className="w-full text-xs font-semibold"
                        icon={<Eye className="w-4 h-4" aria-hidden="true" />}
                      >
                        Ver Detalle
                      </Button>
                    </Link>

                    {isAdmin && (
                      <>
                        <Link to={`/productos/editar/${id}`}>
                          <Button
                            variant="outline"
                            aria-label={`Editar ${nombre}`}
                            className="p-2 min-h-[44px] min-w-[44px] text-blue-700"
                          >
                            <Pencil className="w-4 h-4" aria-hidden="true" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          aria-label={`Eliminar ${nombre}`}
                          onClick={() => setProductoToDelete(p)}
                          className="p-2 min-h-[44px] min-w-[44px] text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" aria-hidden="true" />
                        </Button>
                      </>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {/* Controles de Paginación Accesibles */}
          {totalPages > 1 && (
            <nav
              role="navigation"
              aria-label="Paginación de resultados"
              className="flex items-center justify-between border-t border-slate-200 pt-4 px-2"
            >
              <div className="text-xs text-slate-600">
                Página <span className="font-bold text-slate-900">{currentPage}</span> de{' '}
                <span className="font-bold text-slate-900">{totalPages}</span> &bull; Total:{' '}
                {productos.length} registros
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-xs py-1.5 px-3"
                  aria-label="Ir a página anterior"
                >
                  Anterior
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-xs py-1.5 px-3"
                  aria-label="Ir a página siguiente"
                >
                  Siguiente
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}

      {/* Diálogo Accesible de Confirmación de Eliminación */}
      <ConfirmDialog
        isOpen={!!productoToDelete}
        onClose={() => setProductoToDelete(null)}
        onConfirm={handleConfirmDelete}
        title="Confirmar eliminación"
        message={`¿Está seguro de que desea eliminar el producto "${productoToDelete?.nombre}"? Esta operación no se puede deshacer.`}
        confirmLabel="Sí, eliminar producto"
        cancelLabel="Cancelar"
        isLoading={isDeleting}
        variant="danger"
      />
    </div>
  );
};

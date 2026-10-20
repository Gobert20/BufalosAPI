import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AlertCircle,
  Eye,
  Filter,
  LayoutGrid,
  List,
  Package,
  Pencil,
  PlusCircle,
  RefreshCw,
  Search,
  Shield,
  ShoppingCart,
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
import { ProductImageCard } from '../components/ui/ProductImageCard';
import { OrderModal } from '../components/orders/OrderModal';
import { getProductImageUrl, getCategorySymbol } from '../utils/productImages';

export const ProductosListPage: React.FC = () => {
  const { isAdmin, isTecnico, isAuthenticated } = useAuth();
  const canAccessTecnico = isAdmin || isTecnico;

  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modo de visualización: Cuadrícula (Galería) o Lista (Tabla)
  const [viewMode, setViewMode] = useState<'grid' | 'table'>(() => {
    return (localStorage.getItem('bufalos_view_mode') as 'grid' | 'table') || 'grid';
  });

  // Filtros
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategoriaId, setSelectedCategoriaId] = useState<number>(0);

  // Paginación en cliente y selector de elementos por página
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState<number>(12);

  // Eliminación con confirmación accesible
  const [productoToDelete, setProductoToDelete] = useState<Producto | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteNotification, setDeleteNotification] = useState<string | null>(null);
  const [productoToBuy, setProductoToBuy] = useState<Producto | null>(null);
  const [orderSuccessMessage, setOrderSuccessMessage] = useState<string | null>(null);

  const handleOrderSuccess = (pedidoId: number) => {
    setOrderSuccessMessage(`¡Pedido #${pedidoId.toString().padStart(5, '0')} registrado exitosamente! El inventario fue actualizado.`);
    loadData();
  };

  const handleViewModeChange = (mode: 'grid' | 'table') => {
    setViewMode(mode);
    localStorage.setItem('bufalos_view_mode', mode);
  };

  // Carga de datos
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
            Gestión y consulta de artículos de protección, indumentaria militar, óptica y réplicas de Airsoft
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {canAccessTecnico && (
            <Link to="/estadisticas">
              <Button
                variant="outline"
                className="font-bold text-slate-700 hover:text-slate-900"
              >
                📊 Ver Estadísticas
              </Button>
            </Link>
          )}

          {isAuthenticated && (
            <>
              <Link to="/mis-pedidos">
                <Button
                  variant="outline"
                  className="font-semibold text-slate-700 hover:text-slate-900"
                >
                  📦 Mis Pedidos
                </Button>
              </Link>
              <Link to="/servicios-cliente">
                <Button
                  variant="outline"
                  className="font-semibold text-amber-700 hover:text-amber-900 border-amber-200 hover:bg-amber-50"
                >
                  🔧 Servicio Técnico
                </Button>
              </Link>
            </>
          )}

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
      </div>

      {/* Notificación de compra exitosa */}
      {orderSuccessMessage && (
        <Alert
          type="success"
          title="¡Pedido Realizado con Éxito!"
          onClose={() => setOrderSuccessMessage(null)}
        >
          {orderSuccessMessage}
        </Alert>
      )}

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

      {/* Barra de Filtros, Búsqueda y Modos de Vista */}
      <section
        aria-label="Filtros y opciones de visualización"
        className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs space-y-4"
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
                placeholder="Ej: M4A1, Glock, Botas, Trauma Bag..."
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
                <option value={0}>Todas las categorías ({categorias.length})</option>
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

        {/* Barra de utilidades: Conmutador Galería/Tabla y Cantidad por Página */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 text-sm">
          {/* Conmutador de Vista */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Vista:</span>
            <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1" role="group" aria-label="Modo de visualización">
              <button
                type="button"
                onClick={() => handleViewModeChange('grid')}
                aria-pressed={viewMode === 'grid'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold min-h-[38px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  viewMode === 'grid'
                    ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en Galería / Cuadrícula"
              >
                <LayoutGrid className="w-4 h-4" aria-hidden="true" />
                <span>Galería</span>
              </button>
              <button
                type="button"
                onClick={() => handleViewModeChange('table')}
                aria-pressed={viewMode === 'table'}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold min-h-[38px] transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  viewMode === 'table'
                    ? 'bg-white text-blue-700 shadow-xs font-bold border border-slate-200'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title="Vista en Lista / Tabla"
              >
                <List className="w-4 h-4" aria-hidden="true" />
                <span>Lista</span>
              </button>
            </div>
          </div>

          {/* Selector de Cantidad por Página */}
          <div className="flex items-center gap-2">
            <label htmlFor="page-size-select" className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Mostrar por página:
            </label>
            <select
              id="page-size-select"
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="min-h-[38px] px-3 py-1 rounded-md border border-slate-300 text-xs font-semibold text-slate-800 bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer"
            >
              <option value={6}>6 productos</option>
              <option value={12}>12 productos</option>
              <option value={24}>24 productos</option>
              <option value={48}>48 productos</option>
            </select>
          </div>
        </div>
      </section>

      {/* Región de Resultados / Live Region para lectores de pantalla */}
      <div aria-live="polite" className="sr-only">
        {isLoading
          ? 'Cargando productos...'
          : `Se encontraron ${productos.length} productos en el catálogo.`}
      </div>

      {/* Estado de Carga */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          <LoadingSkeleton count={8} className="h-64 w-full rounded-xl" />
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
        /* Renderizado condicional según viewMode */
        <div className="space-y-6">
          {viewMode === 'grid' ? (
            /* ============================================================ */
            /* 1. VISTA EN CUADRÍCULA / CORTE GALERÍA CON IMÁGENES TÁCTICAS */
            /* ============================================================ */
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
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
                    className="group bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden text-left"
                  >
                    <div>
                      {/* Imagen con badge flotante de categoría */}
                      <Link
                        to={`/productos/${id}`}
                        aria-label={`Ver detalles de ${nombre}`}
                        className="block focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-t-xl"
                      >
                        <ProductImageCard nombre={nombre} categoriaId={p.id_Categoria} />
                      </Link>

                      <div className="p-4 space-y-3">
                        {/* Categoría y Badges de Restricción */}
                        <div className="flex flex-wrap items-center justify-between gap-1.5">
                          <Badge variant="blue" >
                            {catNombre}
                          </Badge>

                          {p.restriccionEdad > 0 ? (
                            <Badge variant="red"  icon={<Shield className="w-3 h-3" />}>
                              +{p.restriccionEdad} años
                            </Badge>
                          ) : (
                            <span className="font-mono text-xs text-slate-400">#{id}</span>
                          )}
                        </div>

                        {/* Nombre del Producto */}
                        <h2 className="text-base font-bold text-slate-900 group-hover:text-blue-700 transition-colors line-clamp-2 leading-snug">
                          <Link
                            to={`/productos/${id}`}
                            className="focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
                          >
                            {nombre}
                          </Link>
                        </h2>

                        {/* Descripción breve */}
                        {desc && (
                          <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                            {desc}
                          </p>
                        )}

                        {/* Precios y Stock */}
                        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                          <div>
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Precio
                            </span>
                            <span className="text-lg font-black text-slate-900 tracking-tight">
                              {formatPrice(precio)}
                            </span>
                          </div>

                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block tracking-wider">
                              Stock
                            </span>
                            <span
                              className={`font-semibold text-xs px-2.5 py-0.5 rounded-full inline-block ${
                                stock > 10
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : stock > 0
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-red-100 text-red-800'
                              }`}
                            >
                              {stock > 0 ? `${stock} un.` : 'Agotado'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Acciones del Card con Touch Targets >= 44x44px */}
                    <div className="p-3 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                      <Link to={`/productos/${id}`} className="flex-1">
                        <Button
                          variant="outline"
                          className="w-full text-xs font-semibold py-2"
                          icon={<Eye className="w-4 h-4" aria-hidden="true" />}
                        >
                          Ver Detalle
                        </Button>
                      </Link>

                      <Button
                        variant="primary"
                        onClick={() => setProductoToBuy(p)}
                        disabled={stock <= 0}
                        aria-label={`Comprar ${nombre}`}
                        className={`text-xs font-bold py-2 px-3 shadow-xs min-h-[44px] flex items-center gap-1.5 ${
                          stock > 0
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                        }`}
                        icon={<ShoppingCart className="w-4 h-4" aria-hidden="true" />}
                      >
                        {stock > 0 ? 'Comprar' : 'Agotado'}
                      </Button>

                      {isAdmin && (
                        <>
                          <Link to={`/productos/editar/${id}`}>
                            <Button
                              variant="ghost"
                              aria-label={`Editar ${nombre}`}
                              className="p-2 min-h-[44px] min-w-[44px] text-blue-700 hover:bg-blue-50"
                            >
                              <Pencil className="w-4 h-4" aria-hidden="true" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            aria-label={`Eliminar producto ${nombre}`}
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
          ) : (
            /* ============================================================ */
            /* 2. VISTA EN LISTA / TABLA SEMÁNTICA CON MINIATURA DE IMAGEN  */
            /* ============================================================ */
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
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
                    const symbol = getCategorySymbol(p.id_Categoria);
                    const imgUrl = getProductImageUrl(nombre, p.id_Categoria);

                    return (
                      <tr key={id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-4 py-3.5 font-mono text-xs text-slate-500">#{id}</td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-slate-900 shrink-0 border border-slate-200 shadow-2xs">
                              <img
                                src={imgUrl}
                                alt=""
                                loading="lazy"
                                className="w-full h-full object-cover"
                              />
                              <span
                                className="absolute bottom-0 right-0 bg-slate-900/80 text-[10px] px-1 rounded-tl-sm text-white"
                                aria-hidden="true"
                              >
                                {symbol}
                              </span>
                            </div>
                            <div>
                              <Link
                                to={`/productos/${id}`}
                                className="font-bold text-slate-900 hover:text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-sm"
                              >
                                {nombre}
                              </Link>
                              {desc && <p className="text-xs text-slate-500 truncate max-w-xs">{desc}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <Badge variant="blue" >
                            {catNombre}
                          </Badge>
                        </td>
                        <td className="px-4 py-3.5 font-bold text-slate-900">{formatPrice(precio)}</td>
                        <td className="px-4 py-3.5">
                          <span
                            className={`font-semibold text-xs px-2 py-0.5 rounded-full ${
                              stock > 10
                                ? 'bg-emerald-100 text-emerald-800'
                                : stock > 0
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {stock > 0 ? `${stock} un.` : 'Agotado'}
                          </span>
                        </td>
                        <td className="px-4 py-3.5">
                          {p.restriccionEdad > 0 ? (
                            <Badge variant="red"  icon={<Shield className="w-3 h-3" />}>
                              +{p.restriccionEdad} años
                            </Badge>
                          ) : (
                            <span className="text-xs text-slate-400">Sin restricción</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            <Button
                                variant="primary"
                                
                                onClick={() => setProductoToBuy(p)}
                                disabled={stock <= 0}
                                aria-label={`Comprar ${nombre} en tabla`}
                                className={`p-2 min-h-[44px] text-xs font-bold flex items-center gap-1 ${
                                  stock > 0
                                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                                }`}
                              >
                                <ShoppingCart className="w-4 h-4" aria-hidden="true" />
                                <span className="hidden sm:inline">{stock > 0 ? 'Comprar' : 'Agotado'}</span>
                              </Button>
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
          )}

          {/* Controles de Paginación Accesibles */}
          {totalPages > 1 && (
            <nav
              role="navigation"
              aria-label="Paginación de resultados"
              className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200 pt-5 px-2"
            >
              <div className="text-xs text-slate-600">
                Página <span className="font-bold text-slate-900">{currentPage}</span> de{' '}
                <span className="font-bold text-slate-900">{totalPages}</span> &bull; Mostrando{' '}
                <span className="font-bold text-slate-900">
                  {Math.min((currentPage - 1) * pageSize + 1, productos.length)}-
                  {Math.min(currentPage * pageSize, productos.length)}
                </span>{' '}
                de <span className="font-bold text-slate-900">{productos.length}</span> productos
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
                  className="text-xs py-1.5 px-3 min-h-[44px]"
                  aria-label="Ir a página anterior"
                >
                  Anterior
                </Button>

                {/* Botones numéricos de páginas rápidas */}
                <div className="hidden md:flex items-center gap-1">
                  {Array.from({ length: totalPages }, (_, i) => i + 1)
                    .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
                    .map((page, index, array) => {
                      const showEllipsis = index > 0 && page - array[index - 1] > 1;
                      return (
                        <React.Fragment key={page}>
                          {showEllipsis && <span className="px-1 text-slate-400">...</span>}
                          <button
                            type="button"
                            onClick={() => setCurrentPage(page)}
                            aria-current={currentPage === page ? 'page' : undefined}
                            className={`min-h-[40px] min-w-[40px] px-2.5 py-1 text-xs font-bold rounded-md transition-colors cursor-pointer ${
                              currentPage === page
                                ? 'bg-blue-600 text-white shadow-xs'
                                : 'text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            {page}
                          </button>
                        </React.Fragment>
                      );
                    })}
                </div>

                <Button
                  variant="outline"
                  onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                  disabled={currentPage === totalPages}
                  className="text-xs py-1.5 px-3 min-h-[44px]"
                  aria-label="Ir a página siguiente"
                >
                  Siguiente
                </Button>
              </div>
            </nav>
          )}
        </div>
      )}

      {/* Modal de Compra y Pedido Directo */}
      <OrderModal
        producto={productoToBuy}
        isOpen={!!productoToBuy}
        onClose={() => setProductoToBuy(null)}
        onSuccess={handleOrderSuccess}
      />

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

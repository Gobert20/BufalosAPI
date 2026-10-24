import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Image as ImageIcon,
  Link as LinkIcon,
  Package,
  Save,
  Trash2,
  Truck,
  Upload,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { proveedorService } from '../services/proveedorService';
import { ApiError } from '../types/api';
import { Categoria } from '../types/producto';
import { Proveedor } from '../types/proveedor';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';
import { getProductImageUrl } from '../utils/productImages';

const productoSchema = z.object({
  nombre: z
    .string()
    .min(3, 'El nombre debe contener al menos 3 caracteres')
    .max(100, 'El nombre no puede exceder 100 caracteres'),
  descripcion: z.string().max(500, 'La descripción no puede exceder 500 caracteres').optional(),
  precio: z.coerce
    .number({ invalid_type_error: 'Debe ingresar un precio válido' })
    .positive('El precio debe ser mayor a 0'),
  stock: z.coerce
    .number({ invalid_type_error: 'Debe ingresar un stock válido' })
    .int('El stock debe ser un número entero')
    .min(0, 'El stock no puede ser negativo'),
  id_Categoria: z.coerce
    .number()
    .int()
    .positive('Debe seleccionar una categoría válida'),
  restriccionEdad: z.coerce
    .number()
    .int()
    .min(0, 'La restricción de edad no puede ser negativa'),
  requierePermiso: z.boolean(),
  soloPersonalAutorizado: z.boolean(),
  numeroSerie: z.string().max(50, 'El número de serie no puede exceder 50 caracteres').optional(),
  imagenUrl: z.string().max(500, 'La URL de la imagen no puede exceder 500 caracteres').optional().nullable(),
});

type ProductoFormData = z.infer<typeof productoSchema>;

export const ProductoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();
  const { isAdmin } = useAuth();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  // Estados para la gestión de imágenes
  const [imageMode, setImageMode] = useState<'upload' | 'url'>('upload');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [imageUploadStatus, setImageUploadStatus] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  // Estados para la gestión de proveedores
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [selectedProveedores, setSelectedProveedores] = useState<number[]>([]);
  const [originalProveedores, setOriginalProveedores] = useState<number[]>([]);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ProductoFormData>({
    resolver: zodResolver(productoSchema),
    defaultValues: {
      nombre: '',
      descripcion: '',
      precio: 0,
      stock: 0,
      id_Categoria: 0,
      restriccionEdad: 0,
      requierePermiso: false,
      soloPersonalAutorizado: false,
      numeroSerie: '',
      imagenUrl: '',
    },
  });

  const watchedNombre = watch('nombre');
  const watchedCategoriaId = watch('id_Categoria');
  const watchedImagenUrl = watch('imagenUrl');

  useEffect(() => {
    const init = async () => {
      setIsLoadingData(true);
      setServerError(null);
      try {
        const [cats, provs] = await Promise.all([
          categoriaService.getCategorias(),
          proveedorService.getProveedores().catch(() => []),
        ]);
        setCategorias(cats);
        setProveedores(provs);

        if (isEditing && id) {
          const prod = await productoService.getProductoById(Number(id));
          reset({
            nombre: prod.nombre,
            descripcion: prod.descripcion || '',
            precio: prod.precio,
            stock: prod.stock,
            id_Categoria: prod.id_Categoria,
            restriccionEdad: prod.restriccionEdad,
            requierePermiso: prod.requierePermiso,
            soloPersonalAutorizado: prod.soloPersonalAutorizado,
            numeroSerie: prod.numeroSerie || '',
            imagenUrl: prod.imagenUrl || '',
          });

          if (prod.proveedores && prod.proveedores.length > 0) {
            const provIds = prod.proveedores.map((p) => p.id_Proveedor);
            setSelectedProveedores(provIds);
            setOriginalProveedores(provIds);
          }

          if (prod.imagenUrl) {
            setImagePreview(getProductImageUrl(prod.nombre, prod.id_Categoria, prod.imagenUrl));
          }
        } else if (cats.length > 0) {
          reset({
            nombre: '',
            descripcion: '',
            precio: 1000,
            stock: 10,
            id_Categoria: cats[0].id_Categoria,
            restriccionEdad: 0,
            requierePermiso: false,
            soloPersonalAutorizado: false,
            numeroSerie: '',
            imagenUrl: '',
          });
        }
      } catch (err) {
        const apiErr = err as ApiError;
        setServerError(apiErr.message || 'Error al cargar los datos del formulario.');
      } finally {
        setIsLoadingData(false);
      }
    };

    init();
  }, [id, isEditing, reset]);

  // Manejo de selección/deselección de proveedores
  const handleToggleProveedor = (provId: number) => {
    setSelectedProveedores((prev) =>
      prev.includes(provId) ? prev.filter((pid) => pid !== provId) : [...prev, provId]
    );
  };

  // Manejo de carga de archivo físico
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validación OWASP en cliente: tamaño máximo 5 MB
    const maxFileSize = 5 * 1024 * 1024;
    if (file.size > maxFileSize) {
      setImageUploadStatus({
        type: 'error',
        message: 'El archivo excede el tamaño máximo permitido de 5 MB.',
      });
      return;
    }

    // Validación de tipo de imagen permitido
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (!allowedTypes.includes(file.type)) {
      setImageUploadStatus({
        type: 'error',
        message: 'Formato no soportado. Debe ser un archivo JPG, PNG, WEBP o GIF.',
      });
      return;
    }

    // Generar vista previa inmediata en el cliente
    const localPreviewUrl = URL.createObjectURL(file);
    setImagePreview(localPreviewUrl);
    setImageUploadStatus(null);
    setIsUploadingImage(true);

    try {
      // Subir archivo al backend seguro
      const result = await productoService.uploadImagen(file);
      setValue('imagenUrl', result.url, { shouldValidate: true, shouldDirty: true });
      setImageUploadStatus({
        type: 'success',
        message: 'Imagen subida exitosamente al almacenamiento seguro del servidor.',
      });
    } catch (err) {
      const apiErr = err as ApiError;
      setImageUploadStatus({
        type: 'error',
        message: apiErr.message || 'Error al subir la imagen al servidor.',
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Manejo de cambio en la URL manual
  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setValue('imagenUrl', url, { shouldValidate: true, shouldDirty: true });
    if (url.trim()) {
      setImagePreview(getProductImageUrl(watchedNombre, watchedCategoriaId, url));
    } else {
      setImagePreview(null);
    }
    setImageUploadStatus(null);
  };

  // Quitar la imagen seleccionada
  const handleRemoveImage = () => {
    setValue('imagenUrl', '', { shouldValidate: true, shouldDirty: true });
    setImagePreview(null);
    setImageUploadStatus(null);
  };

  const onSubmit = async (data: ProductoFormData) => {
    setServerError(null);
    try {
      const payload = {
        ...data,
        descripcion: data.descripcion || null,
        numeroSerie: data.numeroSerie || null,
        imagenUrl: data.imagenUrl && data.imagenUrl.trim() !== '' ? data.imagenUrl.trim() : null,
        proveedorIds: selectedProveedores,
      };

      if (isEditing && id) {
        await productoService.updateProducto(Number(id), payload);
        navigate(`/productos/${id}`);
      } else {
        const created = await productoService.createProducto(payload);
        navigate(`/productos/${created.id_Producto}`);
      }
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(apiErr.message || 'Error al guardar el producto. Verifique los datos.');
    }
  };

  if (isLoadingData) {
    return (
      <div className="max-w-2xl mx-auto space-y-4">
        <LoadingSkeleton count={1} className="h-10 w-48" />
        <div className="bg-white p-6 rounded-2xl border border-slate-200">
          <LoadingSkeleton count={6} className="h-10 w-full mb-3" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 text-left">
      {/* Botón Volver */}
      <Link to="/productos">
        <Button variant="ghost" icon={<ArrowLeft className="w-4 h-4" />}>
          Volver al catálogo
        </Button>
      </Link>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Encabezado */}
        <div className="bg-slate-900 text-white p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white" aria-hidden="true">
              <Package className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
                {isEditing ? 'Editar Producto Táctico' : 'Registrar Nuevo Producto'}
              </h1>
              <p className="text-slate-400 text-xs mt-0.5">
                {isEditing
                  ? 'Modifique los atributos, imagen y guarde los cambios en la API RESTful'
                  : 'Complete los datos requeridos e incorpore la imagen al inventario'}
              </p>
            </div>
          </div>
        </div>

        {/* Formulario */}
        <div className="p-6 sm:p-8">
          {serverError && (
            <Alert type="error" title="Falla en la validación o procesamiento" className="mb-6">
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6" noValidate>
            {/* Nombre */}
            <Input
              id="form-nombre"
              label="Nombre del Producto"
              required
              placeholder="Ej: Chaqueta Militar Ripstop"
              error={errors.nombre?.message}
              {...register('nombre')}
            />

            {/* Categoría (Recurso Relacionado) */}
            <Select
              id="form-categoria"
              label="Categoría"
              required
              placeholder="Seleccione una categoría"
              options={categorias.map((c) => ({
                value: c.id_Categoria,
                label: c.nombre,
              }))}
              error={errors.id_Categoria?.message}
              {...register('id_Categoria')}
            />

            {/* Precio y Stock en Grilla Responsiva */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                id="form-precio"
                label="Precio (CLP $)"
                type="number"
                step="1"
                min="1"
                required
                placeholder="Ej: 49990"
                error={errors.precio?.message}
                {...register('precio')}
              />

              <Input
                id="form-stock"
                label="Cantidad en Stock"
                type="number"
                step="1"
                min="0"
                required
                placeholder="Ej: 20"
                error={errors.stock?.message}
                {...register('stock')}
              />
            </div>

            {/* ============================================================== */}
            {/* SECCIÓN DE GESTIÓN DE IMAGEN (REQUERIMIENTO ROL ADMIN)        */}
            {/* ============================================================== */}
            {isAdmin && (
              <div className="p-5 bg-slate-50 rounded-xl border border-slate-200 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
                  <div className="flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-600" aria-hidden="true" />
                    <div>
                      <h2 className="text-sm font-bold text-slate-900">
                        Imagen del Producto (Administración)
                      </h2>
                      <p className="text-xs text-slate-500">
                        Cargue un archivo local o especifique una URL externa
                      </p>
                    </div>
                  </div>

                  {/* Selector de modo: Subir archivo o Ingresar URL */}
                  <div className="inline-flex rounded-lg border border-slate-200 bg-white p-1 self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setImageMode('upload')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        imageMode === 'upload'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <Upload className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Subir archivo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setImageMode('url')}
                      className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-all cursor-pointer ${
                        imageMode === 'url'
                          ? 'bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      <LinkIcon className="w-3.5 h-3.5" aria-hidden="true" />
                      <span>Enlace URL</span>
                    </button>
                  </div>
                </div>

                {/* Modo 1: Carga de archivo de imagen */}
                {imageMode === 'upload' && (
                  <div className="space-y-3">
                    <label
                      htmlFor="form-image-file"
                      className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
                    >
                      Seleccionar imagen desde su equipo (Máx. 5 MB)
                    </label>
                    <div className="flex items-center gap-3">
                      <input
                        id="form-image-file"
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileChange}
                        disabled={isUploadingImage}
                        className="block w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer border border-slate-200 rounded-lg p-1 bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Formatos compatibles: JPG, JPEG, PNG, WEBP, GIF. Los archivos se almacenan de forma segura en <code>/wwwroot/uploads/productos</code> con GUID para prevenir Directory Traversal (OWASP).
                    </p>
                  </div>
                )}

                {/* Modo 2: Entrada directa de URL */}
                {imageMode === 'url' && (
                  <div className="space-y-2">
                    <Input
                      id="form-image-url"
                      label="URL o Ruta de la Imagen"
                      placeholder="https://ejemplo.com/imagen.jpg o /uploads/productos/archivo.webp"
                      value={watchedImagenUrl || ''}
                      onChange={handleUrlChange}
                      error={errors.imagenUrl?.message}
                    />
                    <p className="text-[11px] text-slate-500">
                      Puede ingresar una URL web absoluta o la ruta relativa interna del servidor.
                    </p>
                  </div>
                )}

                {/* Mensaje de estado de subida */}
                {imageUploadStatus && (
                  <div
                    className={`p-3 rounded-lg text-xs flex items-center gap-2 ${
                      imageUploadStatus.type === 'success'
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}
                  >
                    {imageUploadStatus.type === 'success' ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    ) : (
                      <Package className="w-4 h-4 text-red-600 shrink-0" />
                    )}
                    <span>{imageUploadStatus.message}</span>
                  </div>
                )}

                {/* Previsualización en tiempo real */}
                <div className="pt-2">
                  <span className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                    Previsualización en Tiempo Real
                  </span>

                  <div className="relative w-full sm:w-64 h-44 rounded-xl overflow-hidden bg-slate-900 border border-slate-200 flex items-center justify-center group shadow-xs">
                    {imagePreview || watchedImagenUrl ? (
                      <>
                        <img
                          src={imagePreview || getProductImageUrl(watchedNombre, watchedCategoriaId, watchedImagenUrl)}
                          alt="Vista previa del producto"
                          className="w-full h-full object-cover"
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = getProductImageUrl(watchedNombre, watchedCategoriaId, null);
                          }}
                        />
                        <button
                          type="button"
                          onClick={handleRemoveImage}
                          className="absolute top-2 right-2 bg-red-600/90 hover:bg-red-700 text-white p-1.5 rounded-md shadow-xs opacity-90 hover:opacity-100 transition-opacity cursor-pointer"
                          title="Quitar imagen"
                          aria-label="Quitar imagen actual"
                        >
                          <Trash2 className="w-3.5 h-3.5" aria-hidden="true" />
                        </button>
                      </>
                    ) : (
                      /* Fallback táctico predeterminado */
                      <div className="flex flex-col items-center justify-center text-slate-400 gap-1.5 p-4 text-center">
                        <ImageIcon className="w-8 h-8 text-slate-500" aria-hidden="true" />
                        <span className="text-xs font-semibold text-slate-300">
                          Sin imagen personalizada
                        </span>
                        <span className="text-[10px] text-slate-400">
                          Se aplicará la imagen táctica automática de su categoría
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Descripción */}
            <Textarea
              id="form-descripcion"
              label="Descripción detallada"
              placeholder="Especificaciones de material, bolsillos, resistencia, etc."
              error={errors.descripcion?.message}
              {...register('descripcion')}
            />

            {/* Número de Serie */}
            <Input
              id="form-serie"
              label="Número de Serie / SKU (Opcional)"
              placeholder="Ej: BUF-MIL-2026-X1"
              error={errors.numeroSerie?.message}
              {...register('numeroSerie')}
            />

            {/* Proveedores Oficiales Asociados (TB_Proveedores y TB_ProveedoresProductos) */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-blue-600" aria-hidden="true" />
                  <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                    Proveedores Oficiales Asociados
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  {selectedProveedores.length} seleccionado{selectedProveedores.length !== 1 ? 's' : ''}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Selecciona uno o más proveedores o distribuidores oficiales para este producto.
              </p>

              {proveedores.length === 0 ? (
                <p className="text-xs text-slate-400 italic">No hay proveedores registrados en el sistema.</p>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                  {proveedores.map((prov) => {
                    const isChecked = selectedProveedores.includes(prov.id_Proveedor);
                    return (
                      <label
                        key={prov.id_Proveedor}
                        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                          isChecked
                            ? 'bg-blue-50/80 border-blue-400 text-slate-900 shadow-xs'
                            : 'bg-white border-slate-200 text-slate-700 hover:border-slate-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={() => handleToggleProveedor(prov.id_Proveedor)}
                          className="mt-1 w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-bold text-slate-900 leading-snug truncate">
                            {prov.nombreEmpresa}
                          </p>
                          {prov.contacto && (
                            <p className="text-xs text-slate-500 truncate">
                              Contacto: {prov.contacto}
                            </p>
                          )}
                          {(prov.telefono || prov.correo) && (
                            <p className="text-[11px] text-slate-400 truncate">
                              {prov.telefono || prov.correo}
                            </p>
                          )}
                        </div>
                      </label>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Controles de Seguridad y Permisos */}
            <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
              <h2 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                Controles de Seguridad y Restricciones
              </h2>

              <Input
                id="form-restriccion-edad"
                label="Restricción de Edad Mínima (0 para todo público)"
                type="number"
                min="0"
                placeholder="0"
                error={errors.restriccionEdad?.message}
                {...register('restriccionEdad')}
              />

              <div className="space-y-2 pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-800 min-h-[44px]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    {...register('requierePermiso')}
                  />
                  <span>Requiere permiso o registro ante autoridad fiscalizadora</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm text-slate-800 min-h-[44px]">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                    {...register('soloPersonalAutorizado')}
                  />
                  <span>Venta exclusiva a personal militar o policial acreditado</span>
                </label>
              </div>
            </div>

            {/* Botones de Envío */}
            <div className="flex flex-col sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Link to="/productos" className="w-full sm:w-auto">
                <Button variant="outline" className="w-full sm:w-auto">
                  Cancelar
                </Button>
              </Link>
              <Button
                type="submit"
                variant="primary"
                isLoading={isSubmitting || isUploadingImage}
                icon={isEditing ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
                className="w-full sm:w-auto font-bold shadow-md"
              >
                {isEditing ? 'Guardar Cambios' : 'Registrar Producto'}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

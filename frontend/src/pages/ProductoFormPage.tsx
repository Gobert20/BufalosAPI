import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, Check, Package, Save } from 'lucide-react';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { ApiError } from '../types/api';
import { Categoria } from '../types/producto';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { LoadingSkeleton } from '../components/ui/LoadingSkeleton';
import { Select } from '../components/ui/Select';
import { Textarea } from '../components/ui/Textarea';

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
});

type ProductoFormData = z.infer<typeof productoSchema>;

export const ProductoFormPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  const navigate = useNavigate();

  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
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
    },
  });

  useEffect(() => {
    const init = async () => {
      setIsLoadingData(true);
      setServerError(null);
      try {
        const cats = await categoriaService.getCategorias();
        setCategorias(cats);

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
          });
        } else if (cats.length > 0) {
          // Pre-seleccionar primera categoría en creación
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

  const onSubmit = async (data: ProductoFormData) => {
    setServerError(null);
    try {
      if (isEditing && id) {
        await productoService.updateProducto(Number(id), {
          ...data,
          descripcion: data.descripcion || null,
          numeroSerie: data.numeroSerie || null,
        });
        navigate(`/productos/${id}`);
      } else {
        const created = await productoService.createProducto({
          ...data,
          descripcion: data.descripcion || null,
          numeroSerie: data.numeroSerie || null,
        });
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
                  ? 'Modifique los atributos y guarde los cambios en la API RESTful'
                  : 'Complete los datos requeridos para incorporar el artículo al inventario'}
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

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
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
                isLoading={isSubmitting}
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

import React, { useState } from 'react';
import { CheckCircle, MapPin, Package, ShoppingBag, Truck } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { pedidoService } from '../../services/pedidoService';
import { ApiError } from '../../types/api';
import { Producto } from '../../types/producto';
import { Alert } from '../ui/Alert';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';
import { getCategorySymbol } from '../../utils/productImages';

interface OrderModalProps {
  producto: Producto | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (pedidoId: number, productoId: number, cantidad: number) => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  producto,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [cantidad, setCantidad] = useState(1);
  const [metodoEntrega, setMetodoEntrega] = useState('Starken');
  const [direccionEnvio, setDireccionEnvio] = useState('');
  const [clienteCorreo, setClienteCorreo] = useState(user?.correo || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pedidoExitoso, setPedidoExitoso] = useState<number | null>(null);

  if (!producto) return null;

  const precioTotal = producto.precio * cantidad;

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleCantidadChange = (delta: number) => {
    setCantidad((prev) => {
      const next = prev + delta;
      if (next < 1) return 1;
      if (next > producto.stock) return producto.stock;
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (producto.stock < cantidad) {
      setError(`Stock insuficiente. Máximo disponible: ${producto.stock} unidades.`);
      return;
    }

    if (metodoEntrega === 'Starken' && !direccionEnvio.trim()) {
      setError('Por favor ingrese la dirección o sucursal Starken para el despacho.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        id_Usuario: user?.id,
        correo: clienteCorreo.trim() || user?.correo || 'cliente@bufalos.cl',
        metodoEntrega,
        direccionEnvio: metodoEntrega === 'Starken' ? direccionEnvio.trim() : 'Retiro en Armería Búfalos (Santiago)',
        items: [
          {
            id_Producto: producto.id_Producto,
            cantidad,
          },
        ],
      };

      const res = await pedidoService.crearPedido(payload);
      setPedidoExitoso(res.id_Pedido);
      onSuccess(res.id_Pedido, producto.id_Producto, cantidad);
    } catch (err) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al procesar el pedido.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
    setPedidoExitoso(null);
    setCantidad(1);
    setDireccionEnvio('');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={pedidoExitoso ? '¡Pedido Confirmado con Éxito!' : 'Realizar Pedido / Compra'}
      maxWidth="md"
    >
      {pedidoExitoso ? (
        <div className="space-y-5 text-center py-3 text-left">
          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto" aria-hidden="true">
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              Orden #{pedidoExitoso.toString().padStart(5, '0')} Registrada
            </h3>
            <p className="text-sm text-slate-600">
              Tu solicitud ha sido guardada en la base de datos y ya se encuentra visible en el <strong>Panel Técnico de Despacho</strong>.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Artículo:</span>
              <span className="font-bold text-slate-900">{producto.nombre}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Cantidad:</span>
              <span className="font-bold text-slate-900">{cantidad} un.</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Modalidad:</span>
              <span className="font-bold text-slate-900">{metodoEntrega}</span>
            </div>
            <div className="flex justify-between py-1 text-sm font-extrabold">
              <span className="text-slate-900">Total Facturado:</span>
              <span className="text-emerald-700">{formatCLP(precioTotal)}</span>
            </div>
          </div>

          <Button variant="primary" className="w-full" onClick={handleModalClose}>
            Entendido, Cerrar
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 text-left" noValidate>
          {error && (
            <Alert type="error" title="Atención" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Resumen del producto a adquirir */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center text-xl shrink-0">
                {getCategorySymbol(producto.id_Categoria)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-slate-900 leading-tight">
                  {producto.nombre}
                </h4>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant={producto.stock > 5 ? 'emerald' : 'amber'} size="sm">
                    Stock: {producto.stock} un.
                  </Badge>
                  <span className="text-xs text-slate-500">
                    Precio unitario: {formatCLP(producto.precio)}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Selector de cantidad */}
          <div className="space-y-1.5">
            <label htmlFor="order-qty" className="block text-sm font-semibold text-slate-900">
              Cantidad de Unidades
            </label>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleCantidadChange(-1)}
                disabled={cantidad <= 1}
                aria-label="Disminuir cantidad"
                className="w-11 h-11 rounded-lg border border-slate-300 bg-white font-bold text-lg hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                -
              </button>
              <input
                id="order-qty"
                type="number"
                min={1}
                max={producto.stock}
                value={cantidad}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  if (!isNaN(val)) {
                    if (val < 1) setCantidad(1);
                    else if (val > producto.stock) setCantidad(producto.stock);
                    else setCantidad(val);
                  }
                }}
                className="w-20 h-11 text-center font-bold text-base border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
              <button
                type="button"
                onClick={() => handleCantidadChange(1)}
                disabled={cantidad >= producto.stock}
                aria-label="Aumentar cantidad"
                className="w-11 h-11 rounded-lg border border-slate-300 bg-white font-bold text-lg hover:bg-slate-100 disabled:opacity-50 flex items-center justify-center cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
              >
                +
              </button>
              <span className="text-xs text-slate-500">
                Máximo permitido: {producto.stock} unidades
              </span>
            </div>
          </div>

          {/* Método de Entrega */}
          <Select
            id="order-metodo"
            label="Método de Entrega / Despacho"
            value={metodoEntrega}
            onChange={(e) => setMetodoEntrega(e.target.value)}
            options={[
              { value: 'Starken', label: 'Envío por Starken a Domicilio o Sucursal' },
              { value: 'RetiroTienda', label: 'Retiro Presencial en Armería Búfalos (Sin Costo)' },
            ]}
          />

          {metodoEntrega === 'Starken' && (
            <Input
              id="order-direccion"
              label="Dirección de Envío o Agencia Starken"
              required
              placeholder="Ej. Av. Libertador Bernardo O'Higgins 1500, Santiago"
              value={direccionEnvio}
              onChange={(e) => setDireccionEnvio(e.target.value)}
            />
          )}

          {!user && (
            <Input
              id="order-correo"
              label="Correo de Contacto para Confirmación"
              type="email"
              required
              placeholder="ejemplo@bufalos.cl"
              value={clienteCorreo}
              onChange={(e) => setClienteCorreo(e.target.value)}
            />
          )}

          {/* Cuadro de Total */}
          <div className="bg-slate-900 text-white p-4 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block uppercase font-semibold">
                Total a Pagar
              </span>
              <span className="text-2xl font-black text-emerald-400">
                {formatCLP(precioTotal)}
              </span>
            </div>
            <div className="text-right text-xs text-slate-300">
              <span>{cantidad} {cantidad === 1 ? 'unidad' : 'unidades'}</span>
              <span className="block text-slate-400">IVA Incluido</span>
            </div>
          </div>

          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" type="button" onClick={handleModalClose}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              type="submit"
              isLoading={isSubmitting}
              icon={<ShoppingBag className="w-5 h-5" aria-hidden="true" />}
              className="font-bold text-base shadow-sm"
            >
              Confirmar Pedido
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

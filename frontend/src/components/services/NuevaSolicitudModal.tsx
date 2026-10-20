import React, { useEffect, useState } from 'react';
import { CheckCircle, Sparkles, Wrench } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { servicioTecnicoService } from '../../services/servicioTecnicoService';
import { ApiError } from '../../types/api';
import { TipoServicio } from '../../types/servicio';
import { Alert } from '../ui/Alert';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { Modal } from '../ui/Modal';
import { Select } from '../ui/Select';

interface NuevaSolicitudModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const NuevaSolicitudModal: React.FC<NuevaSolicitudModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  const [tipos, setTipos] = useState<TipoServicio[]>([]);
  const [selectedTipoId, setSelectedTipoId] = useState<number>(1);
  const [equipoModelo, setEquipoModelo] = useState('');
  const [descripcionProblema, setDescripcionProblema] = useState('');

  // Campos específicos de personalización de parches (TB_DetallesParchesCustom)
  const [textoParche, setTextoParche] = useState('');
  const [dimensionesParche, setDimensionesParche] = useState('8x5 cm');
  const [tipoBordado, setTipoBordado] = useState('Velcro Táctico Macho/Hembra');
  const [cantidadParches, setCantidadParches] = useState(1);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successTicket, setSuccessTicket] = useState<number | null>(null);

  useEffect(() => {
    if (isOpen) {
      servicioTecnicoService.getTipos().then((data) => {
        setTipos(data);
        if (data.length > 0 && selectedTipoId === 1) {
          setSelectedTipoId(data[0].id_TipoServicio);
        }
      }).catch(() => {});
    }
  }, [isOpen, selectedTipoId]);

  const selectedTipo = tipos.find((t) => t.id_TipoServicio === selectedTipoId);
  const esParche = selectedTipo?.nombre.toLowerCase().includes('parche');

  const formatCLP = (amount: number) => {
    return new Intl.NumberFormat('es-CL', {
      style: 'currency',
      currency: 'CLP',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!equipoModelo.trim()) {
      setError('Por favor indique el equipo, réplica o artículo táctico a ingresar.');
      return;
    }

    if (!descripcionProblema.trim()) {
      setError('Por favor detalle el problema o la especificación del trabajo solicitado.');
      return;
    }

    setIsSubmitting(true);
    try {
      const fullDescripcion = `${equipoModelo.trim()} - ${descripcionProblema.trim()}`;
      const payload = {
        id_Cliente: user?.id,
        clienteCorreo: user?.correo || 'cliente@bufalos.cl',
        id_TipoServicio: selectedTipoId,
        descripcionProblemaOrItem: fullDescripcion,
        costoTotal: selectedTipo ? selectedTipo.costoBase : 25000,
        textoParche: esParche ? textoParche.trim() : undefined,
        dimensionesParche: esParche ? dimensionesParche : undefined,
        tipoBordado: esParche ? tipoBordado : undefined,
        cantidadParches: esParche ? cantidadParches : 1,
      };

      const res = await servicioTecnicoService.crearServicio(payload);
      setSuccessTicket(res.id_OrdenServicio);
      onSuccess();
    } catch (err: unknown) {
      const apiErr = err as ApiError;
      setError(apiErr.message || 'Error al ingresar la solicitud técnica.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleModalClose = () => {
    setError(null);
    setSuccessTicket(null);
    setEquipoModelo('');
    setDescripcionProblema('');
    setTextoParche('');
    onClose();
  };

  const tipoOptions = tipos.map((t) => ({
    value: t.id_TipoServicio,
    label: `${t.nombre} - Desde ${formatCLP(t.costoBase)} (~${t.tiempoEstimadoDias} días)`,
  }));

  const fijacionOptions = [
    { value: 'Velcro Táctico Macho/Hembra', label: 'Velcro Táctico (Macho/Hembra)' },
    { value: 'Bordado Termoadhesivo', label: 'Bordado Termoadhesivo' },
    { value: 'Goma PVC en Relieve 3D', label: 'Goma PVC en Relieve 3D' },
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleModalClose}
      title={successTicket ? '¡Solicitud Registrada!' : 'Nueva Solicitud de Servicio Técnico'}
      maxWidth="md"
    >
      {successTicket ? (
        <div className="space-y-5 text-center py-4 text-left">
          <div
            className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto"
            aria-hidden="true"
          >
            <CheckCircle className="w-10 h-10" />
          </div>

          <div className="space-y-1">
            <h3 className="text-xl font-extrabold text-slate-900">
              Ticket #{successTicket.toString().padStart(5, '0')} Creado con Éxito
            </h3>
            <p className="text-sm text-slate-600">
              Tu solicitud ha sido ingresada a nuestro taller de armería. Nuestros técnicos revisarán el requerimiento y podrás seguir el progreso en tiempo real.
            </p>
          </div>

          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left text-xs space-y-2">
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Servicio:</span>
              <span className="font-bold text-slate-900">{selectedTipo?.nombre}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Equipo / Item:</span>
              <span className="font-bold text-slate-900">{equipoModelo}</span>
            </div>
            <div className="flex justify-between py-1 border-b border-slate-200">
              <span className="text-slate-500">Costo Base Estimado:</span>
              <span className="font-bold text-emerald-700">
                {selectedTipo ? formatCLP(selectedTipo.costoBase) : '-'}
              </span>
            </div>
            <div className="flex justify-between py-1">
              <span className="text-slate-500">Tiempo de Taller:</span>
              <span className="font-semibold text-slate-800">
                ~{selectedTipo?.tiempoEstimadoDias || 3} días hábiles
              </span>
            </div>
          </div>

          <Button variant="primary" onClick={handleModalClose} className="w-full font-bold">
            Entendido, volver a Mis Servicios
          </Button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4 text-left">
          {error && (
            <Alert type="error" title="Atención" onClose={() => setError(null)}>
              {error}
            </Alert>
          )}

          {/* Selector de Especialidad / Tipo de Servicio */}
          <Select
            id="tipo-servicio-select"
            label="Tipo de Servicio / Trabajo Requerido"
            options={tipoOptions}
            value={selectedTipoId}
            onChange={(e) => setSelectedTipoId(Number(e.target.value))}
            required
          />

          {/* Equipo o Réplica */}
          <Input
            id="equipo-input"
            label="Equipo, Réplica o Artículo Táctico"
            value={equipoModelo}
            onChange={(e) => setEquipoModelo(e.target.value)}
            placeholder="Ej: Fusil M4 Specna Arms, Mira Red Dot, Holster Glock 17..."
            required
          />

          {/* Si es parche, campos adicionales para TB_DetallesParchesCustom */}
          {esParche && (
            <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-3.5 space-y-3">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-600" aria-hidden="true" />
                Detalles del Bordado Táctico Personalizado (TB_DetallesParchesCustom)
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Input
                  id="texto-parche"
                  label="Texto o Indicativo"
                  value={textoParche}
                  onChange={(e) => setTextoParche(e.target.value)}
                  placeholder="Ej: BÚFALOS O+ POS"
                />
                <Input
                  id="dimensiones-parche"
                  label="Dimensiones"
                  value={dimensionesParche}
                  onChange={(e) => setDimensionesParche(e.target.value)}
                  placeholder="Ej: 8x5 cm"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Select
                  id="tipo-bordado"
                  label="Tipo de Fijación"
                  options={fijacionOptions}
                  value={tipoBordado}
                  onChange={(e) => setTipoBordado(e.target.value)}
                />
                <Input
                  id="cantidad-parches"
                  label="Cantidad de Unidades"
                  type="number"
                  min={1}
                  max={100}
                  value={cantidadParches}
                  onChange={(e) => setCantidadParches(Math.max(1, Number(e.target.value)))}
                />
              </div>
            </div>
          )}

          {/* Descripción del Trabajo / Fallo */}
          <div>
            <label htmlFor="descripcion-trabajo" className="block text-sm font-semibold text-slate-900 mb-1.5">
              Descripción del Problema o Requerimiento <span className="text-red-700">*</span>
            </label>
            <textarea
              id="descripcion-trabajo"
              rows={3}
              value={descripcionProblema}
              onChange={(e) => setDescripcionProblema(e.target.value)}
              placeholder="Describa el fallo (ej: atasco en gearbox, pérdida de alcance, desajuste de retícula) o especificaciones del trabajo requerido..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:border-blue-600"
              required
            />
          </div>

          {/* Resumen de Costo y Tiempos */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 flex items-center justify-between text-xs">
            <div>
              <span className="text-slate-500 block">Costo base presupuestado:</span>
              <span className="font-black text-slate-900 text-sm">
                {selectedTipo ? formatCLP(selectedTipo.costoBase) : '-'}
              </span>
            </div>
            <div className="text-right">
              <span className="text-slate-500 block">Tiempo estimado:</span>
              <span className="font-semibold text-slate-700">
                ~{selectedTipo?.tiempoEstimadoDias || 3} días hábiles
              </span>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={handleModalClose} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="primary"
              isLoading={isSubmitting}
              icon={<Wrench className="w-4 h-4" aria-hidden="true" />}
              className="font-bold"
            >
              Ingresar Solicitud
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
};

import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Lock, LogIn, ShieldAlert, UserCheck } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { ApiError } from '../types/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';

const loginSchema = z.object({
  correo: z
    .string()
    .min(1, 'El correo electrónico es requerido')
    .email('Debe ingresar un formato de correo electrónico válido'),
  password: z
    .string()
    .min(6, 'La contraseña debe contener al menos 6 caracteres'),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [serverError, setServerError] = useState<string | null>(null);
  const [rateLimitActive, setRateLimitActive] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/productos';

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    setServerError(null);
    setRateLimitActive(false);

    try {
      await login(
        {
          correo: data.correo,
          password: data.password,
        },
        data.rememberMe
      );
      navigate(from, { replace: true });
    } catch (err) {
      const apiErr = err as ApiError;
      if (apiErr.status === 429) {
        setRateLimitActive(true);
        setServerError('Demasiados intentos fallidos en poco tiempo (429 Too Many Requests). Por seguridad, espere 1 minuto antes de reintentar.');
      } else if (apiErr.status === 401) {
        setServerError('Credenciales incorrectas. Verifique el correo y la contraseña ingresados.');
      } else {
        setServerError(apiErr.message || 'Error inesperado al iniciar sesión.');
      }
    }
  };

  const handleFillDemo = (role: 'Admin' | 'Cliente') => {
    if (role === 'Admin') {
      setValue('correo', 'admin@bufalos.cl', { shouldValidate: true });
      setValue('password', 'Admin123!', { shouldValidate: true });
    } else {
      setValue('correo', 'cliente@bufalos.cl', { shouldValidate: true });
      setValue('password', 'Cliente123!', { shouldValidate: true });
    }
    setServerError(null);
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        {/* Encabezado */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 text-white" aria-hidden="true">
            <Lock className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">Iniciar Sesión</h1>
          <p className="text-slate-300 text-sm mt-1">Acceso seguro con autenticación JWT</p>
        </div>

        {/* Contenido del formulario */}
        <div className="p-6 sm:p-8 space-y-6">
          {serverError && (
            <Alert
              type={rateLimitActive ? 'warning' : 'error'}
              title={rateLimitActive ? 'Seguridad: Rate Limiting Activo' : 'Error de Autenticación'}
              onClose={() => setServerError(null)}
            >
              {serverError}
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
            <Input
              id="login-correo"
              label="Correo Electrónico"
              type="email"
              autoComplete="email"
              required
              placeholder="ejemplo@bufalos.cl"
              error={errors.correo?.message}
              {...register('correo')}
            />

            <Input
              id="login-password"
              label="Contraseña"
              type="password"
              autoComplete="current-password"
              required
              placeholder="••••••••"
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-sm">
              <label htmlFor="rememberMe" className="flex items-center gap-2 cursor-pointer text-slate-700 min-h-[44px]">
                <input
                  id="rememberMe"
                  type="checkbox"
                  className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                  {...register('rememberMe')}
                />
                <span>Recordar sesión</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              className="w-full text-base font-bold shadow-md"
              isLoading={isSubmitting}
              disabled={rateLimitActive}
              icon={<LogIn className="w-5 h-5" aria-hidden="true" />}
            >
              Ingresar al Sistema
            </Button>
          </form>

          {/* Atajos para Demostración y Evaluación */}
          <div className="pt-5 border-t border-slate-200">
            <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3 text-center">
              Credenciales de Demostración (Evaluación 2)
            </h2>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                className="text-xs py-2 h-auto"
                onClick={() => handleFillDemo('Admin')}
                icon={<ShieldAlert className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />}
              >
                Cargar Admin
              </Button>
              <Button
                variant="outline"
                className="text-xs py-2 h-auto"
                onClick={() => handleFillDemo('Cliente')}
                icon={<UserCheck className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
              >
                Cargar Cliente
              </Button>
            </div>
            <p className="text-[11px] text-slate-500 text-center mt-2">
              Admin: permisos CRUD completos &bull; Cliente: modo catálogo de solo lectura.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

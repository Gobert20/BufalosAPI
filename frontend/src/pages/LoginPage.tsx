import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Lock,
  LogIn,
  Shield,
  ShieldAlert,
  UserCheck,
  UserPlus,
  Wrench,
} from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { authService } from '../services/authService';
import { ApiError } from '../types/api';
import { Alert } from '../components/ui/Alert';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { Select } from '../components/ui/Select';

// Esquema de validación para inicio de sesión
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

// Esquema de validación para registro de usuario por rol
const registerSchema = z
  .object({
    nombreCompleto: z
      .string()
      .min(3, 'El nombre debe contener al menos 3 caracteres'),
    correo: z
      .string()
      .min(1, 'El correo electrónico es requerido')
      .email('Debe ingresar un formato de correo electrónico válido'),
    password: z
      .string()
      .min(6, 'La contraseña debe contener al menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(1, 'Debe confirmar su contraseña'),
    rol: z
      .string()
      .min(1, 'Debe seleccionar un rol para la cuenta'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

type RegisterFormData = z.infer<typeof registerSchema>;

const ROLE_OPTIONS = [
  { value: 'Cliente', label: 'Cliente (Catálogo y compras)' },
  { value: 'Técnico', label: 'Técnico (Servicio técnico y mantención)' },
  { value: 'Administrador', label: 'Administrador (Gestión total e inventario)' },
];

const ROLE_ID_MAP: Record<string, number> = {
  Administrador: 1,
  Admin: 1,
  Cliente: 2,
  Técnico: 3,
  Tecnico: 3,
};

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Pestaña activa: 'login' o 'register'
  const [activeTab, setActiveTab] = useState<'login' | 'register'>('login');

  const [serverError, setServerError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [rateLimitActive, setRateLimitActive] = useState(false);

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname || '/productos';

  // Formulario de Inicio de Sesión
  const {
    register: registerLogin,
    handleSubmit: handleSubmitLogin,
    setValue: setLoginValue,
    formState: { errors: loginErrors, isSubmitting: isSubmittingLogin },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      correo: '',
      password: '',
      rememberMe: false,
    },
  });

  // Formulario de Registro
  const {
    register: registerRegister,
    handleSubmit: handleSubmitRegister,
    reset: resetRegister,
    watch: watchRegister,
    formState: { errors: registerErrors, isSubmitting: isSubmittingRegister },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      nombreCompleto: '',
      correo: '',
      password: '',
      confirmPassword: '',
      rol: 'Cliente',
    },
  });

  const selectedRole = watchRegister('rol');

  // Submit Login
  const onSubmitLogin = async (data: LoginFormData) => {
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
        setServerError(
          'Demasiados intentos fallidos en poco tiempo (429 Too Many Requests). Por seguridad, espere 1 minuto antes de reintentar.'
        );
      } else if (apiErr.status === 401) {
        setServerError('Credenciales incorrectas. Verifique el correo y la contraseña ingresados.');
      } else {
        setServerError(apiErr.message || 'Error inesperado al iniciar sesión.');
      }
    }
  };

  // Submit Registro
  const onSubmitRegister = async (data: RegisterFormData) => {
    setServerError(null);
    setSuccessMessage(null);

    try {
      const id_Rol = ROLE_ID_MAP[data.rol] || 2;
      const res = await authService.registro({
        nombreCompleto: data.nombreCompleto,
        correo: data.correo,
        password: data.password,
        rol: data.rol,
        id_Rol,
        esVerificado: true,
      });

      setSuccessMessage(
        `¡Cuenta creada exitosamente! Usuario registrado como "${res.rol}". Ya puedes iniciar sesión.`
      );

      // Pre-cargar credenciales en el formulario de login y cambiar de pestaña
      setLoginValue('correo', data.correo, { shouldValidate: true });
      setLoginValue('password', data.password, { shouldValidate: true });
      resetRegister();
      setActiveTab('login');
    } catch (err) {
      const apiErr = err as ApiError;
      setServerError(
        apiErr.message || 'No fue posible registrar la cuenta. Verifique los datos o intente con otro correo.'
      );
    }
  };

  // Atajos de demostración
  const handleFillDemo = (role: 'Admin' | 'Cliente' | 'Tecnico') => {
    setActiveTab('login');
    setServerError(null);
    setSuccessMessage(null);

    if (role === 'Admin') {
      setLoginValue('correo', 'admin@bufalos.cl', { shouldValidate: true });
      setLoginValue('password', 'Admin123!', { shouldValidate: true });
    } else if (role === 'Tecnico') {
      setLoginValue('correo', 'tecnico@bufalos.cl', { shouldValidate: true });
      setLoginValue('password', 'Tecnico123!', { shouldValidate: true });
    } else {
      setLoginValue('correo', 'cliente@bufalos.cl', { shouldValidate: true });
      setLoginValue('password', 'Cliente123!', { shouldValidate: true });
    }
  };

  return (
    <div className="max-w-md mx-auto my-8">
      <div className="bg-white rounded-2xl shadow-md border border-slate-200 overflow-hidden">
        {/* Encabezado */}
        <div className="bg-slate-900 text-white p-6 text-center">
          <div
            className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center mx-auto mb-3 text-white shadow-sm"
            aria-hidden="true"
          >
            {activeTab === 'login' ? <Lock className="w-6 h-6" /> : <UserPlus className="w-6 h-6" />}
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            {activeTab === 'login' ? 'Iniciar Sesión' : 'Registro de Nuevo Usuario'}
          </h1>
          <p className="text-slate-300 text-sm mt-1">
            {activeTab === 'login'
              ? 'Acceso seguro con autenticación JWT'
              : 'Crea tu cuenta seleccionando tu rol'}
          </p>
        </div>

        {/* Selector de Pestañas (Tabs WAI-ARIA) */}
        <div
          className="flex border-b border-slate-200 bg-slate-100"
          role="tablist"
          aria-label="Opciones de acceso"
        >
          <button
            type="button"
            role="tab"
            id="tab-login"
            aria-selected={activeTab === 'login'}
            aria-controls="panel-login"
            onClick={() => {
              setActiveTab('login');
              setServerError(null);
            }}
            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              activeTab === 'login'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <LogIn className="w-4 h-4" aria-hidden="true" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            role="tab"
            id="tab-register"
            aria-selected={activeTab === 'register'}
            aria-controls="panel-register"
            onClick={() => {
              setActiveTab('register');
              setServerError(null);
              setSuccessMessage(null);
            }}
            className={`flex-1 py-3 px-4 text-sm font-bold flex items-center justify-center gap-2 transition-all border-b-2 min-h-[44px] cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              activeTab === 'register'
                ? 'border-blue-600 text-blue-600 bg-white shadow-xs'
                : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <UserPlus className="w-4 h-4" aria-hidden="true" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Contenido de Formularios */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Alertas globales de éxito y error */}
          {successMessage && (
            <Alert
              type="success"
              title="Registro Exitoso"
              onClose={() => setSuccessMessage(null)}
            >
              {successMessage}
            </Alert>
          )}

          {serverError && (
            <Alert
              type={rateLimitActive ? 'warning' : 'error'}
              title={rateLimitActive ? 'Seguridad: Rate Limiting Activo' : 'Atención'}
              onClose={() => setServerError(null)}
            >
              {serverError}
            </Alert>
          )}

          {/* PANEL 1: INICIO DE SESIÓN */}
          {activeTab === 'login' && (
            <div id="panel-login" role="tabpanel" aria-labelledby="tab-login" className="space-y-6">
              <form onSubmit={handleSubmitLogin(onSubmitLogin)} className="space-y-5" noValidate>
                <Input
                  id="login-correo"
                  label="Correo Electrónico"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="ejemplo@bufalos.cl"
                  error={loginErrors.correo?.message}
                  {...registerLogin('correo')}
                />

                <Input
                  id="login-password"
                  label="Contraseña"
                  type="password"
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  error={loginErrors.password?.message}
                  {...registerLogin('password')}
                />

                <div className="flex items-center justify-between text-sm">
                  <label
                    htmlFor="rememberMe"
                    className="flex items-center gap-2 cursor-pointer text-slate-700 min-h-[44px]"
                  >
                    <input
                      id="rememberMe"
                      type="checkbox"
                      className="w-4 h-4 rounded text-blue-600 border-slate-300 focus:ring-blue-500 cursor-pointer"
                      {...registerLogin('rememberMe')}
                    />
                    <span>Recordar sesión</span>
                  </label>
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-base font-bold shadow-md"
                  isLoading={isSubmittingLogin}
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
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  <Button
                    variant="outline"
                    className="text-xs py-2 h-auto"
                    onClick={() => handleFillDemo('Admin')}
                    icon={<ShieldAlert className="w-3.5 h-3.5 text-purple-600" aria-hidden="true" />}
                  >
                    Admin
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs py-2 h-auto"
                    onClick={() => handleFillDemo('Tecnico')}
                    icon={<Wrench className="w-3.5 h-3.5 text-amber-600" aria-hidden="true" />}
                  >
                    Técnico
                  </Button>
                  <Button
                    variant="outline"
                    className="text-xs py-2 h-auto"
                    onClick={() => handleFillDemo('Cliente')}
                    icon={<UserCheck className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />}
                  >
                    Cliente
                  </Button>
                </div>
                <p className="text-[11px] text-slate-500 text-center mt-2">
                  Admin: control total &bull; Técnico: mantención y órdenes &bull; Cliente: catálogo.
                </p>
              </div>
            </div>
          )}

          {/* PANEL 2: REGISTRO DE NUEVO USUARIO */}
          {activeTab === 'register' && (
            <div id="panel-register" role="tabpanel" aria-labelledby="tab-register" className="space-y-6">
              <form onSubmit={handleSubmitRegister(onSubmitRegister)} className="space-y-4" noValidate>
                <Input
                  id="reg-nombre"
                  label="Nombre Completo"
                  type="text"
                  autoComplete="name"
                  required
                  placeholder="Ej. Rodrigo Tapia"
                  error={registerErrors.nombreCompleto?.message}
                  {...registerRegister('nombreCompleto')}
                />

                <Input
                  id="reg-correo"
                  label="Correo Electrónico"
                  type="email"
                  autoComplete="email"
                  required
                  placeholder="usuario@bufalos.cl"
                  error={registerErrors.correo?.message}
                  {...registerRegister('correo')}
                />

                <Select
                  id="reg-rol"
                  label="Rol de Usuario en Plataforma"
                  required
                  options={ROLE_OPTIONS}
                  error={registerErrors.rol?.message}
                  helperText="Define los permisos de acceso y funciones autorizadas en el sistema."
                  {...registerRegister('rol')}
                />

                {/* Explicación contextual del Rol seleccionado */}
                <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-xs text-slate-700 space-y-1">
                  <div className="font-semibold text-slate-900 flex items-center gap-1.5">
                    <Shield className="w-3.5 h-3.5 text-blue-600" aria-hidden="true" />
                    <span>Permisos asociados al rol {selectedRole}:</span>
                  </div>
                  {selectedRole === 'Administrador' && (
                    <p className="text-purple-900 font-medium">
                      Control total: alta, edición y baja de productos, estadísticas de ganancias y gestión de inventario.
                    </p>
                  )}
                  {selectedRole === 'Técnico' && (
                    <p className="text-amber-900 font-medium">
                      Operación técnica: mantención de armamento, personalización de parches y gestión de órdenes de servicio.
                    </p>
                  )}
                  {selectedRole === 'Cliente' && (
                    <p className="text-blue-900 font-medium">
                      Consulta de catálogo táctico, visualización en galería, detalles de productos y cotizaciones.
                    </p>
                  )}
                </div>

                <Input
                  id="reg-password"
                  label="Contraseña"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Mínimo 6 caracteres"
                  error={registerErrors.password?.message}
                  {...registerRegister('password')}
                />

                <Input
                  id="reg-confirmPassword"
                  label="Confirmar Contraseña"
                  type="password"
                  autoComplete="new-password"
                  required
                  placeholder="Repita la contraseña"
                  error={registerErrors.confirmPassword?.message}
                  {...registerRegister('confirmPassword')}
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full text-base font-bold shadow-md mt-2"
                  isLoading={isSubmittingRegister}
                  icon={<UserPlus className="w-5 h-5" aria-hidden="true" />}
                >
                  Crear Cuenta y Registrarse
                </Button>
              </form>

              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('login');
                    setServerError(null);
                  }}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-800 hover:underline cursor-pointer min-h-[44px] inline-flex items-center"
                >
                  ¿Ya tienes una cuenta registrada? Inicia sesión aquí
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

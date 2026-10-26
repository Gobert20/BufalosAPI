import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BarChart3,
  LogIn,
  LogOut,
  Menu,
  Package,
  PlusCircle,
  Shield,
  ShoppingBag,
  User as UserIcon,
  Users,
  Wrench,
  X,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, isTecnico, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  const canAccessTecnico = isAdmin || isTecnico;

  const getRoleBadgeVariant = (rol: string): 'purple' | 'amber' | 'blue' => {
    if (rol === 'Admin' || rol === 'Administrador') return 'purple';
    if (rol === 'Técnico' || rol === 'Tecnico') return 'amber';
    return 'blue';
  };

  return (
    <header className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Enlaces Principales */}
          <div className="flex items-center gap-8">
            <Link
              to="/productos"
              className="flex items-center gap-2.5 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-md p-1"
              aria-label="Búfalos Tactical - Inicio"
            >
              <div className="w-9 h-9 rounded-lg bg-blue-600 flex items-center justify-center font-black text-xl text-yellow-400 group-hover:scale-105 transition-transform shadow-inner">
                <Shield className="w-5 h-5 text-yellow-400" aria-hidden="true" />
              </div>
              <div className="text-left">
                <span className="text-lg font-black tracking-wider text-white uppercase block leading-none">
                  Búfalos
                </span>
                <span className="text-[10px] font-bold tracking-widest text-yellow-400 uppercase block">
                  Tactical &bull; Armería
                </span>
              </div>
            </Link>

            {/* Enlaces de Navegación de Escritorio */}
            <nav role="navigation" aria-label="Navegación principal" className="hidden md:flex items-center gap-1.5">
              <Link
                to="/productos"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isActive('/productos')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Package className="w-4 h-4" aria-hidden="true" />
                Catálogo
              </Link>

              {/* Enlaces para Usuarios Autenticados (Cliente y demás) */}
              {isAuthenticated && (
                <>
                  <Link
                    to="/mis-pedidos"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                      isActive('/mis-pedidos')
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <ShoppingBag className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                    Mis Pedidos
                  </Link>

                  <Link
                    to="/servicios-cliente"
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                      isActive('/servicios-cliente')
                        ? 'bg-blue-600 text-white shadow-xs'
                        : 'text-slate-300 hover:text-white hover:bg-slate-800'
                    }`}
                  >
                    <Wrench className="w-4 h-4 text-amber-400" aria-hidden="true" />
                    Servicio Técnico
                  </Link>
                </>
              )}

              {/* Panel de Estadísticas y Administración (Exclusivo Admin y Técnico) */}
              {canAccessTecnico && (
                <Link
                  to="/estadisticas"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    isActive('/estadisticas')
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <BarChart3 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                  Estadísticas / Admin
                </Link>
              )}

              {/* Panel Técnico para Técnicos y Administradores */}
              {canAccessTecnico && (
                <Link
                  to="/panel-tecnico"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    isActive('/panel-tecnico')
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-4 h-4 text-amber-400" aria-hidden="true" />
                  Panel Técnico
                </Link>
              )}

              {/* Panel de Usuarios y Permisos: Exclusivo Admin */}
              {isAdmin && (
                <Link
                  to="/admin/usuarios"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    isActive('/admin/usuarios')
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-4 h-4 text-purple-400" aria-hidden="true" />
                  Usuarios y Permisos
                </Link>
              )}

              {/* Botón de Creación: Exclusivo Admin */}
              {isAdmin && (
                <Link
                  to="/productos/nuevo"
                  className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                    isActive('/productos/nuevo')
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <PlusCircle className="w-4 h-4 text-emerald-400" aria-hidden="true" />
                  Nuevo Producto
                </Link>
              )}
            </nav>
          </div>

          {/* Área de Autenticación de Escritorio */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && user ? (
              <div className="flex items-center gap-3 bg-slate-800/80 px-3.5 py-1.5 rounded-lg border border-slate-700">
                <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-300" aria-hidden="true">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="text-left text-xs">
                  <span className="block font-semibold text-slate-200 truncate max-w-[150px]">{user.nombreCompleto}</span>
                  <Badge variant={getRoleBadgeVariant(user.rol)} size="sm">
                    {user.rol}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className="p-1.5 min-h-[36px] min-w-[36px] text-slate-400 hover:text-red-400 hover:bg-slate-700/50"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-bold min-h-[44px] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 shadow-sm"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>

          {/* Botón de Menú Hamburguesa Móvil */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
            >
              {mobileMenuOpen ? (
                <X className="w-6 h-6" aria-hidden="true" />
              ) : (
                <Menu className="w-6 h-6" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Menú Desplegable Móvil */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-3">
          <div className="space-y-1">
            <Link
              to="/productos"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                isActive('/productos') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <Package className="w-5 h-5" aria-hidden="true" />
              Catálogo de Productos
            </Link>

            {isAuthenticated && (
              <>
                <Link
                  to="/mis-pedidos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                    isActive('/mis-pedidos') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <ShoppingBag className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  Mis Pedidos y Compras
                </Link>

                <Link
                  to="/servicios-cliente"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                    isActive('/servicios-cliente') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Wrench className="w-5 h-5 text-amber-400" aria-hidden="true" />
                  Servicio Técnico y Taller
                </Link>
              </>
            )}

            {canAccessTecnico && (
              <Link
                to="/estadisticas"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                  isActive('/estadisticas') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-5 h-5 text-cyan-400" aria-hidden="true" />
                Estadísticas / Admin
              </Link>
            )}

            {canAccessTecnico && (
              <Link
                to="/panel-tecnico"
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                  isActive('/panel-tecnico') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Wrench className="w-5 h-5 text-amber-400" aria-hidden="true" />
                Panel Técnico
              </Link>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/usuarios"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                    isActive('/admin/usuarios') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-5 h-5 text-purple-400" aria-hidden="true" />
                  Usuarios y Permisos
                </Link>

                <Link
                  to="/productos/nuevo"
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                    isActive('/productos/nuevo') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <PlusCircle className="w-5 h-5 text-emerald-400" aria-hidden="true" />
                  Nuevo Producto
                </Link>
              </>
            )}
          </div>

          <div className="pt-3 border-t border-slate-800">
            {isAuthenticated && user ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between bg-slate-800 p-3 rounded-lg">
                  <div>
                    <span className="block font-semibold text-slate-200 text-sm">{user.nombreCompleto}</span>
                    <span className="block text-xs text-slate-400">{user.correo}</span>
                  </div>
                  <Badge variant={getRoleBadgeVariant(user.rol)} size="sm">
                    {user.rol}
                  </Badge>
                </div>
                <Button
                  variant="outline"
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-red-400 border-slate-700 hover:bg-slate-800 font-semibold"
                  icon={<LogOut className="w-4 h-4" aria-hidden="true" />}
                >
                  Cerrar Sesión
                </Button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 rounded-lg font-bold min-h-[44px]"
              >
                <LogIn className="w-5 h-5" aria-hidden="true" />
                <span>Iniciar Sesión</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

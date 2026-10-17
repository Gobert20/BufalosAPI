import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BarChart3, LogIn, LogOut, Menu, Package, PlusCircle, Shield, User as UserIcon, X } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { Badge } from '../ui/Badge';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header role="banner" className="bg-slate-900 text-white shadow-md border-b border-slate-800 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo y Enlace Principal */}
          <div className="flex items-center gap-8">
            <Link
              to="/productos"
              className="flex items-center gap-2.5 text-white font-bold text-lg tracking-tight hover:text-blue-400 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 rounded-md p-1 min-h-[44px]"
              aria-label="Búfalos Táctico - Ir al catálogo"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white" aria-hidden="true">
                <Shield className="w-5 h-5" />
              </div>
              <span className="text-xl font-extrabold tracking-wide">BÚFALOS</span>
            </Link>

            {/* Enlaces de Navegación de Escritorio */}
            <nav role="navigation" aria-label="Navegación principal" className="hidden md:flex items-center gap-2">
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

              <Link
                to="/estadisticas"
                className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-semibold transition-colors min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400 ${
                  isActive('/estadisticas')
                    ? 'bg-blue-600 text-white shadow-xs'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-4 h-4 text-cyan-400" aria-hidden="true" />
                Estadísticas
              </Link>

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
                  <Badge variant={isAdmin ? 'purple' : 'blue'} size="sm">
                    {user.rol}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  aria-label="Cerrar sesión"
                  className="ml-2 text-slate-400 hover:text-red-400 p-1.5 rounded-md hover:bg-slate-700/50 transition-colors cursor-pointer min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
                >
                  <LogOut className="w-5 h-5" aria-hidden="true" />
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 active:bg-blue-800 transition-colors shadow-xs min-h-[44px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
              >
                <LogIn className="w-4 h-4" aria-hidden="true" />
                Iniciar Sesión
              </Link>
            )}
          </div>

          {/* Botón Menú Móvil */}
          <div className="flex md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-nav"
              aria-label={mobileMenuOpen ? 'Cerrar menú principal' : 'Abrir menú principal'}
              className="text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-400"
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

      {/* Menú Móvil Desplegable */}
      {mobileMenuOpen && (
        <nav
          id="mobile-nav"
          role="navigation"
          aria-label="Navegación móvil"
          className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-3 animate-in slide-in-from-top-2 duration-150"
        >
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

            <Link
              to="/estadisticas"
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-base font-semibold min-h-[44px] ${
                isActive('/estadisticas') ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <BarChart3 className="w-5 h-5 text-cyan-400" aria-hidden="true" />
              Estadísticas y Negocio
            </Link>

            {isAdmin && (
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
                  <Badge variant={isAdmin ? 'purple' : 'blue'} size="sm">
                    {user.rol}
                  </Badge>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center justify-center gap-2 bg-red-800/80 hover:bg-red-800 text-white py-2.5 px-4 rounded-lg text-sm font-semibold min-h-[44px] transition-colors"
                >
                  <LogOut className="w-4 h-4" aria-hidden="true" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-2.5 px-4 rounded-lg text-base font-bold min-h-[44px]"
              >
                <LogIn className="w-5 h-5" aria-hidden="true" />
                Iniciar Sesión
              </Link>
            )}
          </div>
        </nav>
      )}
    </header>
  );
};

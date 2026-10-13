import React from 'react';
import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Enlace de omisión de navegación para lectores de pantalla y teclado (WCAG 2.2) */}
      <a href="#main-content" className="skip-to-content">
        Saltar al contenido principal
      </a>

      <Navbar />

      <main id="main-content" role="main" className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
};

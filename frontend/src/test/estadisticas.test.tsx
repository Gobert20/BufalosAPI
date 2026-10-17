import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { EstadisticasPage } from '../pages/EstadisticasPage';
import { productoService } from '../services/productoService';
import { EstadisticasResponse } from '../types/producto';

vi.mock('../services/productoService', () => ({
  productoService: {
    getEstadisticas: vi.fn(),
  },
}));

const mockStats: EstadisticasResponse = {
  totalProductos: 44,
  totalStock: 2648,
  valorInventario: 60852110,
  stockBajoCount: 5,
  stockCriticoCount: 0,
  porCategoria: [
    {
      idCategoria: 1,
      nombre: 'Calzado y Vestuario Táctico',
      totalProductos: 12,
      stockTotal: 415,
      valorInventario: 21366830,
    },
    {
      idCategoria: 5,
      nombre: 'Airsoft y Réplicas',
      totalProductos: 10,
      stockTotal: 387,
      valorInventario: 12026630,
    },
  ],
  topVendidos: [
    {
      idProducto: 1,
      nombre: 'Botas Tácticas M-600',
      cantidadVendida: 2,
      totalRecaudado: 179980,
    },
  ],
  alertasStock: [
    {
      idProducto: 3,
      nombre: 'Pistola Traumática 9mm',
      categoria: 'Defensa Personal',
      stock: 5,
      precio: 290000,
    },
  ],
};

const renderPage = () => {
  return render(
    <BrowserRouter>
      <EstadisticasPage />
    </BrowserRouter>
  );
};

describe('EstadisticasPage Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renderiza correctamente las métricas y KPIs del catálogo', async () => {
    vi.mocked(productoService.getEstadisticas).mockResolvedValue(mockStats);

    renderPage();

    expect(await screen.findByText('Panel de Estadísticas y Negocio')).toBeInTheDocument();
    expect(screen.getByText('44')).toBeInTheDocument();
    expect(screen.getByText('Calzado y Vestuario Táctico')).toBeInTheDocument();
    expect(screen.getByText('Airsoft y Réplicas')).toBeInTheDocument();
    expect(screen.getByText('Botas Tácticas M-600')).toBeInTheDocument();
    expect(screen.getByText('Pistola Traumática 9mm')).toBeInTheDocument();
  });

  it('muestra mensaje de error cuando la API falla', async () => {
    vi.mocked(productoService.getEstadisticas).mockRejectedValue(new Error('Error de conexión'));

    renderPage();

    expect(await screen.findByText(/Error de conexión/i)).toBeInTheDocument();
  });
});

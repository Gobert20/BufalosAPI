import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { BrowserRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { AuthContext, AuthContextType } from '../context/AuthContext';
import { ProductosListPage } from '../pages/ProductosListPage';
import { categoriaService } from '../services/categoriaService';
import { productoService } from '../services/productoService';
import { Producto } from '../types/producto';

vi.mock('../services/productoService', () => ({
  productoService: {
    getProductos: vi.fn(),
    getProductoById: vi.fn(),
    createProducto: vi.fn(),
    updateProducto: vi.fn(),
    deleteProducto: vi.fn(),
  },
}));

vi.mock('../services/categoriaService', () => ({
  categoriaService: {
    getCategorias: vi.fn(),
    getCategoriaById: vi.fn(),
  },
}));

const mockProductos: Producto[] = [
  {
    id_Producto: 1,
    nombre: 'Chaqueta Militar Ripstop',
    descripcion: 'Chaqueta táctica impermeable',
    precio: 59990,
    stock: 12,
    id_Categoria: 1,
    restriccionEdad: 0,
    requierePermiso: false,
    soloPersonalAutorizado: false,
    numeroSerie: 'BUF-CHA-01',
    categoria: { id_Categoria: 1, nombre: 'Ropa Táctica' },
  },
  {
    id_Producto: 2,
    nombre: 'Botas Tácticas de Acero',
    descripcion: 'Botas con puntera reforzada',
    precio: 79990,
    stock: 5,
    id_Categoria: 2,
    restriccionEdad: 0,
    requierePermiso: false,
    soloPersonalAutorizado: false,
    numeroSerie: 'BUF-BOT-02',
    categoria: { id_Categoria: 2, nombre: 'Calzado' },
  },
];

const renderComponent = (isAdmin = true) => {
  const authValue: AuthContextType = {
    user: { id: 1, nombreCompleto: 'Admin User', correo: 'admin@bufalos.cl', rol: isAdmin ? 'Admin' : 'Cliente' },
    token: 'valid.token',
    isAuthenticated: true,
    isAdmin,
    isCliente: !isAdmin,
    isLoading: false,
    login: async () => {},
    logout: () => {},
  };

  return render(
    <AuthContext.Provider value={authValue}>
      <BrowserRouter>
        <ProductosListPage />
      </BrowserRouter>
    </AuthContext.Provider>
  );
};

describe('CRUD Operaciones en ProductosListPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(categoriaService.getCategorias).mockResolvedValue([
      { id_Categoria: 1, nombre: 'Ropa Táctica' },
      { id_Categoria: 2, nombre: 'Calzado' },
    ]);
  });

  it('lista correctamente los productos obtenidos desde la API (Operación READ)', async () => {
    vi.mocked(productoService.getProductos).mockResolvedValue(mockProductos);

    renderComponent(true);

    const items = await screen.findAllByText('Chaqueta Militar Ripstop');
    expect(items.length).toBeGreaterThan(0);
    expect(screen.getAllByText('Botas Tácticas de Acero').length).toBeGreaterThan(0);
  });

  it('muestra mensaje accesible de estado vacío cuando no hay registros', async () => {
    vi.mocked(productoService.getProductos).mockResolvedValue([]);

    renderComponent(true);

    expect(await screen.findByText(/no se encontraron productos/i)).toBeInTheDocument();
  });

  it('abre el diálogo accesible y confirma la eliminación de un producto (Operación DELETE)', async () => {
    const user = userEvent.setup();
    vi.mocked(productoService.getProductos).mockResolvedValue(mockProductos);
    vi.mocked(productoService.deleteProducto).mockResolvedValue();

    renderComponent(true);

    // Esperar a que se renderice la lista
    const items = await screen.findAllByText('Chaqueta Militar Ripstop');
    expect(items.length).toBeGreaterThan(0);

    // Clic en botón eliminar del primer producto
    const deleteButtons = screen.getAllByRole('button', { name: /eliminar producto/i });
    await user.click(deleteButtons[0]);

    // Verificar apertura de modal de confirmación
    expect(await screen.findByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText(/¿está seguro de que desea eliminar/i)).toBeInTheDocument();

    // Confirmar eliminación
    const confirmBtn = screen.getByRole('button', { name: /sí, eliminar producto/i });
    await user.click(confirmBtn);

    await waitFor(() => {
      expect(productoService.deleteProducto).toHaveBeenCalledWith(1);
    });
  });
});

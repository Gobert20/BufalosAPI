import { test, expect } from '@playwright/test';

test.describe('Flujo End-to-End: Login, Crear Producto y Listar en Catálogo', () => {
  test('debe iniciar sesión como Admin, crear un producto y verificarlo en el listado', async ({ page }) => {
    // 1. Navegar a la página de login
    await page.goto('/login');
    await expect(page.getByRole('heading', { name: /iniciar sesión/i })).toBeVisible();

    // 2. Ingresar credenciales de Administrador
    await page.getByLabel(/correo electrónico/i).fill('admin@bufalos.cl');
    await page.getByLabel(/contraseña/i).fill('Admin123!');
    await page.getByRole('button', { name: /ingresar al sistema/i }).click();

    // 3. Confirmar redirección exitosa al catálogo
    await expect(page).toHaveURL(/\/productos/);
    await expect(page.getByRole('heading', { name: /catálogo de productos tácticos/i })).toBeVisible();

    // 4. Navegar a la creación de producto mediante el botón visible para Admin
    const nuevoProductoBtn = page.getByRole('button', { name: /nuevo producto/i });
    await expect(nuevoProductoBtn).toBeVisible();
    await nuevoProductoBtn.click();

    await expect(page).toHaveURL(/\/productos\/nuevo/);
    await expect(page.getByRole('heading', { name: /registrar nuevo producto/i })).toBeVisible();

    // 5. Completar formulario de nuevo producto con validación
    const nombreAleatorio = `Casco Táctico Balístico E2E-${Date.now().toString().slice(-4)}`;

    await page.getByLabel(/nombre del producto/i).fill(nombreAleatorio);
    await page.getByLabel(/precio/i).fill('89990');
    await page.getByLabel(/cantidad en stock/i).fill('12');
    await page.getByLabel(/descripción detallada/i).fill('Casco de alta protección para personal de operaciones especiales.');

    // 6. Enviar formulario
    await page.getByRole('button', { name: /registrar producto/i }).click();

    // 7. Verificar redirección y presencia en la vista de detalle
    await expect(page).toHaveURL(/\/productos\/\d+/);
    await expect(page.getByRole('heading', { name: nombreAleatorio })).toBeVisible();

    // 8. Volver al catálogo y verificar que el producto aparece listado
    await page.getByRole('button', { name: /volver al catálogo/i }).click();
    await expect(page).toHaveURL(/\/productos/);

    // Buscar el producto recién creado
    await page.getByLabel(/buscar por nombre o descripción/i).fill(nombreAleatorio);
    await page.getByRole('button', { name: /buscar/i }).click();

    await expect(page.getByText(nombreAleatorio).first()).toBeVisible();
  });
});

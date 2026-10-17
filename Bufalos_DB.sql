CREATE DATABASE Bufalos_DB;
GO

USE Bufalos_DB;
GO

-- 1. Tabla de Roles
CREATE TABLE TB_Roles (
    Id_Rol INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL UNIQUE
);
GO

-- 2. Tabla de Usuarios
CREATE TABLE TB_Usuarios (
    Id_Usuario INT IDENTITY(1,1) PRIMARY KEY,
    NombreCompleto NVARCHAR(100) NOT NULL,
    Correo NVARCHAR(100) NOT NULL UNIQUE,
    ContrasenaHash VARCHAR(255) NOT NULL,
    Id_Rol INT NOT NULL,
    FechaNacimiento DATE NOT NULL,
    EsVerificado BIT DEFAULT 0,
    FechaCreacion DATETIME2 DEFAULT GETDATE(),
    CONSTRAINT FK_Usuario_Rol FOREIGN KEY (Id_Rol) REFERENCES TB_Roles(Id_Rol)
);
GO

-- 3. Tabla de Permisos y Licencias
CREATE TABLE TB_PermisosUsuarios (
    Id_Permiso INT IDENTITY(1,1) PRIMARY KEY,
    Id_Usuario INT NOT NULL,
    TipoPermiso NVARCHAR(50) NOT NULL,
    NumeroDocumento VARCHAR(50) NOT NULL,
    FechaExpiracion DATE NOT NULL,
    Estado VARCHAR(20) DEFAULT 'Pendiente' CHECK (Estado IN ('Pendiente', 'Aprobado', 'Rechazado')),
    CONSTRAINT FK_Permiso_Usuario FOREIGN KEY (Id_Usuario) REFERENCES TB_Usuarios(Id_Usuario) ON DELETE CASCADE
);
GO

-- 4. Tabla de Proveedores
CREATE TABLE TB_Proveedores (
    Id_Proveedor INT IDENTITY(1,1) PRIMARY KEY,
    NombreEmpresa NVARCHAR(100) NOT NULL,
    Contacto NVARCHAR(100),
    Telefono VARCHAR(20),
    Correo NVARCHAR(100)
);
GO

-- 5. Tabla de Categor�as
CREATE TABLE TB_Categorias (
    Id_Categoria INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(50) NOT NULL
);
GO

-- 6. Tabla de Productos
CREATE TABLE TB_Productos (
    Id_Producto INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    Descripcion NVARCHAR(MAX),
    Precio DECIMAL(10,2) NOT NULL CHECK (Precio >= 0),
    Stock INT NOT NULL DEFAULT 0 CHECK (Stock >= 0),
    Id_Categoria INT NOT NULL,
    RestriccionEdad INT DEFAULT 0,
    RequierePermiso BIT DEFAULT 0,
    SoloPersonalAutorizado BIT DEFAULT 0,
    NumeroSerie VARCHAR(100) NULL,
    CONSTRAINT FK_Producto_Categoria FOREIGN KEY (Id_Categoria) REFERENCES TB_Categorias(Id_Categoria)
);
GO

-- 7. Tabla Intermedia Proveedores-Productos
CREATE TABLE TB_ProveedoresProductos (
    Id_Proveedor INT NOT NULL,
    Id_Producto INT NOT NULL,
    PRIMARY KEY (Id_Proveedor, Id_Producto),
    CONSTRAINT FK_ProvProd_Proveedor FOREIGN KEY (Id_Proveedor) REFERENCES TB_Proveedores(Id_Proveedor),
    CONSTRAINT FK_ProvProd_Producto FOREIGN KEY (Id_Producto) REFERENCES TB_Productos(Id_Producto) ON DELETE CASCADE
);
GO

-- 8. Tabla de Pedidos
CREATE TABLE TB_Pedidos (
    Id_Pedido INT IDENTITY(1,1) PRIMARY KEY,
    Id_Usuario INT NOT NULL,
    FechaPedido DATETIME2 DEFAULT GETDATE(),
    EstadoPedido VARCHAR(30) DEFAULT 'Creado' CHECK (EstadoPedido IN ('Creado', 'Pagado', 'EnviadoStarken', 'Entregado', 'Cancelado')),
    MetodoEntrega VARCHAR(50) NOT NULL CHECK (MetodoEntrega IN ('RetiroTienda', 'Starken')),
    DireccionEnvio NVARCHAR(MAX) NULL,
    Total DECIMAL(10,2) NOT NULL CHECK (Total >= 0),
    CONSTRAINT FK_Pedido_Usuario FOREIGN KEY (Id_Usuario) REFERENCES TB_Usuarios(Id_Usuario)
);
GO

-- 9. Tabla de Detalle del Pedido
CREATE TABLE TB_DetallePedidos (
    Id_DetallePedido INT IDENTITY(1,1) PRIMARY KEY,
    Id_Pedido INT NOT NULL,
    Id_Producto INT NOT NULL,
    Cantidad INT NOT NULL CHECK (Cantidad > 0),
    PrecioUnitario DECIMAL(10,2) NOT NULL CHECK (PrecioUnitario >= 0),
    CONSTRAINT FK_DetallePedido_Pedido FOREIGN KEY (Id_Pedido) REFERENCES TB_Pedidos(Id_Pedido) ON DELETE CASCADE,
    CONSTRAINT FK_DetallePedido_Producto FOREIGN KEY (Id_Producto) REFERENCES TB_Productos(Id_Producto)
);
GO

-- 10. Tipos de Servicio
CREATE TABLE TB_TiposServicio (
    Id_TipoServicio INT IDENTITY(1,1) PRIMARY KEY,
    Nombre NVARCHAR(100) NOT NULL,
    CostoBase DECIMAL(10,2) NOT NULL CHECK (CostoBase >= 0),
    TiempoEstimadoDias INT DEFAULT 3
);
GO

-- 11. �rdenes de Servicio
CREATE TABLE TB_OrdenesServicio (
    Id_OrdenServicio INT IDENTITY(1,1) PRIMARY KEY,
    Id_Cliente INT NOT NULL,
    Id_TecnicoAsignado INT NULL,
    Id_TipoServicio INT NOT NULL,
    FechaIngreso DATETIME2 DEFAULT GETDATE(),
    FechaEstimadaEntrega DATE,
    Estado VARCHAR(30) DEFAULT 'Recibido' CHECK (Estado IN ('Recibido', 'En Proceso', 'Esperando Repuestos', 'Finalizado', 'Entregado')),
    DescripcionProblemaOrItem NVARCHAR(MAX) NOT NULL,
    CostoTotal DECIMAL(10,2) NOT NULL CHECK (CostoTotal >= 0),
    CONSTRAINT FK_Orden_Cliente FOREIGN KEY (Id_Cliente) REFERENCES TB_Usuarios(Id_Usuario),
    CONSTRAINT FK_Orden_Tecnico FOREIGN KEY (Id_TecnicoAsignado) REFERENCES TB_Usuarios(Id_Usuario),
    CONSTRAINT FK_Orden_TipoServicio FOREIGN KEY (Id_TipoServicio) REFERENCES TB_TiposServicio(Id_TipoServicio)
);
GO

-- 12. Detalles de Parches Personalizados
CREATE TABLE TB_DetallesParchesCustom (
    Id_DetalleParche INT IDENTITY(1,1) PRIMARY KEY,
    Id_OrdenServicio INT NOT NULL,
    TextoPersonalizado NVARCHAR(100) NULL,
    Dimensiones NVARCHAR(50) NOT NULL,
    TipoBordado NVARCHAR(50) NOT NULL,
    Cantidad INT NOT NULL DEFAULT 1 CHECK (Cantidad > 0),
    ObservacionesDiseno NVARCHAR(MAX) NULL,
    CONSTRAINT FK_Parche_OrdenServicio FOREIGN KEY (Id_OrdenServicio) REFERENCES TB_OrdenesServicio(Id_OrdenServicio) ON DELETE CASCADE
);
GO

-- ========================================================
-- SEED DATA (INSERTS) PARA INICIALIZACION DEL SISTEMA
-- ========================================================

-- 1. Roles
IF NOT EXISTS (SELECT 1 FROM TB_Roles WHERE Nombre = 'Administrador')
    INSERT INTO TB_Roles (Nombre) VALUES ('Administrador');
IF NOT EXISTS (SELECT 1 FROM TB_Roles WHERE Nombre = 'Cliente')
    INSERT INTO TB_Roles (Nombre) VALUES ('Cliente');
IF NOT EXISTS (SELECT 1 FROM TB_Roles WHERE Nombre = 'Técnico')
    INSERT INTO TB_Roles (Nombre) VALUES ('Técnico');
GO

-- 2. Categorías
SET IDENTITY_INSERT TB_Categorias ON;
IF NOT EXISTS (SELECT 1 FROM TB_Categorias WHERE Id_Categoria = 1)
    INSERT INTO TB_Categorias (Id_Categoria, Nombre) VALUES (1, 'Calzado y Vestuario Táctico');
IF NOT EXISTS (SELECT 1 FROM TB_Categorias WHERE Id_Categoria = 2)
    INSERT INTO TB_Categorias (Id_Categoria, Nombre) VALUES (2, 'Accesorios y Óptica');
IF NOT EXISTS (SELECT 1 FROM TB_Categorias WHERE Id_Categoria = 3)
    INSERT INTO TB_Categorias (Id_Categoria, Nombre) VALUES (3, 'Defensa Personal');
IF NOT EXISTS (SELECT 1 FROM TB_Categorias WHERE Id_Categoria = 4)
    INSERT INTO TB_Categorias (Id_Categoria, Nombre) VALUES (4, 'Parches y Personalización');
SET IDENTITY_INSERT TB_Categorias OFF;
GO

-- 3. Proveedores
SET IDENTITY_INSERT TB_Proveedores ON;
IF NOT EXISTS (SELECT 1 FROM TB_Proveedores WHERE Id_Proveedor = 1)
    INSERT INTO TB_Proveedores (Id_Proveedor, NombreEmpresa, Contacto, Telefono, Correo)
    VALUES (1, 'Suministros Tácticos SpA', 'Roberto Fernández', '+56912345678', 'contacto@suministrostacticos.cl');
IF NOT EXISTS (SELECT 1 FROM TB_Proveedores WHERE Id_Proveedor = 2)
    INSERT INTO TB_Proveedores (Id_Proveedor, NombreEmpresa, Contacto, Telefono, Correo)
    VALUES (2, 'Importadora Defensiva S.A.', 'Andrea Morales', '+56987654321', 'ventas@defensiva.cl');
IF NOT EXISTS (SELECT 1 FROM TB_Proveedores WHERE Id_Proveedor = 3)
    INSERT INTO TB_Proveedores (Id_Proveedor, NombreEmpresa, Contacto, Telefono, Correo)
    VALUES (3, 'Bordados y Textil Ltda.', 'Gonzalo Soto', '+56955554444', 'contacto@bordadostextil.cl');
SET IDENTITY_INSERT TB_Proveedores OFF;
GO

-- 4. Usuarios (Contraseñas válidas BCrypt de 60 caracteres)
-- admin@bufalos.cl / Admin123!
IF NOT EXISTS (SELECT 1 FROM TB_Usuarios WHERE Correo = 'admin@bufalos.cl')
    INSERT INTO TB_Usuarios (NombreCompleto, Correo, ContrasenaHash, Id_Rol, FechaNacimiento, EsVerificado, FechaCreacion)
    VALUES ('Carlos Gómez (Admin)', 'admin@bufalos.cl', '$2a$11$sXgsEg9RInsDJC4rNFswlu0N5W41Cfra47u8J5tffUAgzDHCEqq.e', 1, '1990-01-01', 1, GETDATE());
ELSE
    UPDATE TB_Usuarios SET ContrasenaHash = '$2a$11$sXgsEg9RInsDJC4rNFswlu0N5W41Cfra47u8J5tffUAgzDHCEqq.e', Id_Rol = 1 WHERE Correo = 'admin@bufalos.cl';

-- cliente@bufalos.cl / Cliente123!
IF NOT EXISTS (SELECT 1 FROM TB_Usuarios WHERE Correo = 'cliente@bufalos.cl')
    INSERT INTO TB_Usuarios (NombreCompleto, Correo, ContrasenaHash, Id_Rol, FechaNacimiento, EsVerificado, FechaCreacion)
    VALUES ('Cliente Demostración', 'cliente@bufalos.cl', '$2a$11$3sw7FbZJEnmjTTCxfWcLgeRu8K8GhIhpEEwKyhlHOZIRI.FT/2XFa', 2, '1998-05-12', 1, GETDATE());
ELSE
    UPDATE TB_Usuarios SET ContrasenaHash = '$2a$11$3sw7FbZJEnmjTTCxfWcLgeRu8K8GhIhpEEwKyhlHOZIRI.FT/2XFa', Id_Rol = 2 WHERE Correo = 'cliente@bufalos.cl';

-- admin2@bufalos.cl / Admin123! (Trabajo 1)
IF NOT EXISTS (SELECT 1 FROM TB_Usuarios WHERE Correo = 'admin2@bufalos.cl')
    INSERT INTO TB_Usuarios (NombreCompleto, Correo, ContrasenaHash, Id_Rol, FechaNacimiento, EsVerificado, FechaCreacion)
    VALUES ('Administrador Sistema', 'admin2@bufalos.cl', '$2a$11$lKApXO2wy.vBWF.qw5GGBOmoEf8l/Haf1vZ1c7d5zwnorpbsDpnZy', 1, '1990-01-01', 1, GETDATE());

-- Técnico / Demás cuentas
IF NOT EXISTS (SELECT 1 FROM TB_Usuarios WHERE Correo = 'rtecnico@bufalos.cl')
    INSERT INTO TB_Usuarios (NombreCompleto, Correo, ContrasenaHash, Id_Rol, FechaNacimiento, EsVerificado, FechaCreacion)
    VALUES ('Rodrigo Técnico', 'rtecnico@bufalos.cl', '$2a$11$sXgsEg9RInsDJC4rNFswlu0N5W41Cfra47u8J5tffUAgzDHCEqq.e', 3, '1992-07-20', 1, GETDATE());
GO

-- 5. Productos
IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Botas Tácticas M-600')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Botas Tácticas M-600', 'Botas impermeables alta resistencia con puntera reforzada y suela antideslizante', 89990.00, 25, 1, 0, 0, 0, 'BOT-M600-01');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Mira Telescópica 4x32')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Mira Telescópica 4x32', 'Mira táctica de alta precisión con retícula iluminada y montura Picatinny', 125000.00, 10, 2, 18, 0, 0, 'MT-99201-B');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Pistola Traumática 9mm')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Pistola Traumática 9mm', 'Dispositivo no letal para defensa personal y adiestramiento disuasivo', 290000.00, 5, 3, 18, 1, 1, 'TRAUM-9MM-402');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Chaleco Táctico Modular')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Chaleco Táctico Modular', 'Chaleco porta-placas sistema MOLLE con compartimentos de liberación rápida', 65000.00, 15, 1, 0, 0, 0, 'CHAL-MOD-101');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Parche Velcro Personalizado')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Parche Velcro Personalizado', 'Insignia bordada militar o identificación táctica de alta durabilidad', 6990.00, 500, 4, 0, 0, 0, 'PAR-VLC-001');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Casco Táctico Kevlar')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Casco Táctico Kevlar', 'Protección balística con rieles laterales para accesorios y linterna', 185000.00, 12, 1, 18, 0, 0, 'CAS-2026-X99');

IF NOT EXISTS (SELECT 1 FROM TB_Productos WHERE Nombre = 'Mochila Militar Modular Assault 45L')
    INSERT INTO TB_Productos (Nombre, Descripcion, Precio, Stock, Id_Categoria, RestriccionEdad, RequierePermiso, SoloPersonalAutorizado, NumeroSerie)
    VALUES ('Mochila Militar Modular Assault 45L', 'Mochila táctica con sistema MOLLE y compartimiento para hidratación', 49990.00, 30, 2, 0, 0, 0, 'BUF-MOC-004');
GO

-- 6. Tipos de Servicio
IF NOT EXISTS (SELECT 1 FROM TB_TiposServicio WHERE Nombre = 'Mantención General de Equipo')
    INSERT INTO TB_TiposServicio (Nombre, CostoBase, TiempoEstimadoDias) VALUES ('Mantención General de Equipo', 35000.00, 3);
IF NOT EXISTS (SELECT 1 FROM TB_TiposServicio WHERE Nombre = 'Calibración e Instalación de Miras')
    INSERT INTO TB_TiposServicio (Nombre, CostoBase, TiempoEstimadoDias) VALUES ('Calibración e Instalación de Miras', 20000.00, 1);
IF NOT EXISTS (SELECT 1 FROM TB_TiposServicio WHERE Nombre = 'Confección de Parches Personalizados')
    INSERT INTO TB_TiposServicio (Nombre, CostoBase, TiempoEstimadoDias) VALUES ('Confección de Parches Personalizados', 15000.00, 5);
GO

CREATE DATABASE Maintegral
GO
USE Maintegral
GO

-- ================================
-- TABLAS
-- ================================

CREATE TABLE Sedes (
    id_sede         INT           PRIMARY KEY IDENTITY(1,1),
    nombre          NVARCHAR(100) NOT NULL UNIQUE,
    direccion       NVARCHAR(200) NOT NULL,
    responsable     NVARCHAR(100) NOT NULL,
    fecha_registro  DATETIME      NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Usuarios (
    id_usuario      INT           PRIMARY KEY IDENTITY(1,1),
    nombre          NVARCHAR(100) NOT NULL,
    rol             NVARCHAR(50)  NOT NULL CHECK (rol IN ('Dueño','Administrador','Jefe de Producción','Encargado de Inventario')),
    id_sede         INT           NOT NULL REFERENCES Sedes(id_sede),
    usuario_acceso  NVARCHAR(50)  NOT NULL UNIQUE,
    contrasena      NVARCHAR(100) NOT NULL,
    fecha_registro  DATETIME      NOT NULL DEFAULT GETDATE()
);

CREATE TABLE Insumos (
    id_insumo              INT           PRIMARY KEY IDENTITY(1,1),
    nombre                 NVARCHAR(100) NOT NULL,
    categoria              NVARCHAR(50)  NOT NULL CHECK (categoria IN ('tela','hilo','botón','cierre','otro')),
    unidad_medida          NVARCHAR(30)  NOT NULL CHECK (unidad_medida IN ('metros','unidades','kilos')),
    cantidad               INT           NOT NULL DEFAULT 0,
    stock_minimo           INT           NOT NULL DEFAULT 0,
    alertas_stock          INT           NOT NULL DEFAULT 0,
    id_sede                INT           NOT NULL REFERENCES Sedes(id_sede),
    id_usuario_responsable INT           NOT NULL REFERENCES Usuarios(id_usuario),
    fecha_actualizacion    DATETIME      NOT NULL DEFAULT GETDATE(),
    CONSTRAINT UQ_Insumo_Sede UNIQUE (nombre, id_sede)
);

CREATE TABLE MovimientosInventario (
    id_movimiento INT           PRIMARY KEY IDENTITY(1,1),
    tipo          NVARCHAR(10)  NOT NULL CHECK (tipo IN ('Entrada','Salida')),
    id_insumo     INT           NOT NULL REFERENCES Insumos(id_insumo),
    cantidad      INT           NOT NULL,
    fecha         DATETIME      NOT NULL DEFAULT GETDATE(),
    id_usuario    INT           NOT NULL REFERENCES Usuarios(id_usuario),
    motivo        NVARCHAR(200) NOT NULL,
    id_sede       INT           NOT NULL REFERENCES Sedes(id_sede)
);

CREATE TABLE OrdenesProduccion (
    id_orden               INT           PRIMARY KEY IDENTITY(1,1),
    cliente                NVARCHAR(100) NOT NULL,
    prenda                 NVARCHAR(100) NOT NULL,
    cantidad               INT           NOT NULL,
    fecha_creacion         DATETIME      NOT NULL DEFAULT GETDATE(),
    fecha_entrega          DATE          NOT NULL,
    prioridad              NVARCHAR(10)  NOT NULL CHECK (prioridad IN ('Normal','Urgente')),
    estado                 NVARCHAR(20)  NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente','En proceso','Pausada','Terminada')),
    id_sede                INT           NOT NULL REFERENCES Sedes(id_sede),
    id_usuario_responsable INT           NOT NULL REFERENCES Usuarios(id_usuario),
    fecha_finalizacion     DATETIME      NULL
);

CREATE TABLE ConsumoInsumos (
    id_consumo         INT      PRIMARY KEY IDENTITY(1,1),
    id_orden           INT      NOT NULL REFERENCES OrdenesProduccion(id_orden),
    id_insumo          INT      NOT NULL REFERENCES Insumos(id_insumo),
    cantidad_consumida INT      NOT NULL,
    id_usuario         INT      NOT NULL REFERENCES Usuarios(id_usuario),
    fecha_consumo      DATETIME NOT NULL DEFAULT GETDATE()
);
GO

-- ================================
-- DATOS
-- ================================

-- Solo 2 sedes: Laureles (1) y Envigado (2)
SET IDENTITY_INSERT Sedes ON;
INSERT INTO Sedes (id_sede, nombre, direccion, responsable, fecha_registro) VALUES
(1, 'Sede Laureles', 'Calle 33 #76-40, Medellín',  'Carlos Gómez', '2023-02-10 08:00:00'),
(2, 'Sede Envigado', 'Carrera 48 #32-10, Envigado', 'María Ríos',   '2023-03-15 09:30:00');
SET IDENTITY_INSERT Sedes OFF;
GO

-- Usuarios de Laureles y Envigado
SET IDENTITY_INSERT Usuarios ON;
INSERT INTO Usuarios (id_usuario, nombre, rol, id_sede, usuario_acceso, contrasena, fecha_registro) VALUES
(1, 'Juan Maintegral',  'Dueño',                   1, 'dueno',  '1234', '2023-02-10 08:00:00'),
(2, 'Carlos Gómez',     'Administrador',            1, 'admin1', '1234', '2023-02-10 08:05:00'),
(3, 'María Ríos',       'Administrador',            2, 'admin2', '1234', '2023-03-15 09:35:00'),
(5, 'Daniela Ospina',   'Jefe de Producción',       1, 'jprod1', '5678', '2023-04-01 08:00:00'),
(6, 'Ricardo Salazar',  'Jefe de Producción',       2, 'jprod2', '5678', '2023-04-10 08:00:00'),
(8, 'Andrés Patiño',    'Encargado de Inventario',  1, 'inv1',   '5678', '2023-04-05 08:00:00'),
(9, 'Paola Vélez',      'Encargado de Inventario',  2, 'inv2',   '5678', '2023-04-12 08:00:00');
SET IDENTITY_INSERT Usuarios OFF;
GO

-- Insumos de Laureles (1-7) y Envigado (8-13);
SET IDENTITY_INSERT Insumos ON;
INSERT INTO Insumos (id_insumo, nombre, categoria, unidad_medida, cantidad, stock_minimo, alertas_stock, id_sede, id_usuario_responsable, fecha_actualizacion) VALUES
-- Sede 1 · Laureles
(1,  'Tela algodón blanca',   'tela',   'metros',    320, 100, 0, 1, 8, '2025-04-20 09:00:00'),
(2,  'Tela denim azul',       'tela',   'metros',     85, 100, 2, 1, 8, '2025-04-25 10:30:00'),
(3,  'Hilo poliéster blanco', 'hilo',   'kilos',      40,  15, 0, 1, 8, '2025-04-22 11:00:00'),
(4,  'Hilo negro',            'hilo',   'kilos',      12,  15, 1, 1, 8, '2025-04-28 08:45:00'),
(5,  'Botón 4 huecos blanco', 'botón',  'unidades', 1800, 500, 0, 1, 8, '2025-04-15 14:00:00'),
(6,  'Cierre metálico 20cm',  'cierre', 'unidades',  290, 100, 0, 1, 8, '2025-04-18 16:00:00'),
(7,  'Entretela fusionable',  'otro',   'metros',     60,  30, 0, 1, 8, '2025-04-10 09:30:00'),
-- Sede 2 · Envigado
(8,  'Tela lino beige',       'tela',   'metros',    210,  80, 0, 2, 9, '2025-04-21 09:00:00'),
(9,  'Tela seda champán',     'tela',   'metros',     55,  60, 1, 2, 9, '2025-04-26 11:00:00'),
(10, 'Hilo seda crema',       'hilo',   'kilos',      18,  10, 0, 2, 9, '2025-04-20 10:00:00'),
(11, 'Botón nácar redondo',   'botón',  'unidades',  750, 300, 0, 2, 9, '2025-04-17 13:00:00'),
(12, 'Cierre invisible 25cm', 'cierre', 'unidades',  160,  80, 0, 2, 9, '2025-04-19 15:30:00'),
(13, 'Elástico 2cm',          'otro',   'metros',    130,  50, 0, 2, 9, '2025-04-14 09:00:00');
SET IDENTITY_INSERT Insumos OFF;
GO

-- Movimientos de Laureles (1-16) y Envigado (17-27);
SET IDENTITY_INSERT MovimientosInventario ON;
INSERT INTO MovimientosInventario (id_movimiento, tipo, id_insumo, cantidad, fecha, id_usuario, motivo, id_sede) VALUES
-- Sede 1
(1,  'Entrada', 1,  400, '2025-01-10 08:30:00', 8, 'Registro inicial',             1),
(2,  'Entrada', 2,  200, '2025-01-10 08:35:00', 8, 'Registro inicial',             1),
(3,  'Entrada', 3,   50, '2025-01-10 08:40:00', 8, 'Registro inicial',             1),
(4,  'Entrada', 4,   25, '2025-01-10 08:45:00', 8, 'Registro inicial',             1),
(5,  'Entrada', 5, 2000, '2025-01-10 09:00:00', 8, 'Registro inicial',             1),
(6,  'Entrada', 6,  350, '2025-01-10 09:05:00', 8, 'Registro inicial',             1),
(7,  'Entrada', 7,   80, '2025-01-10 09:10:00', 8, 'Registro inicial',             1),
(8,  'Salida',  1,   50, '2025-02-15 14:00:00', 8, 'Uso en orden',                 1),
(9,  'Salida',  2,   40, '2025-02-20 10:00:00', 8, 'Uso en orden',                 1),
(10, 'Salida',  3,    5, '2025-03-01 11:00:00', 8, 'Uso en orden',                 1),
(11, 'Salida',  4,    8, '2025-03-05 09:00:00', 8, 'Uso en orden',                 1),
(12, 'Salida',  5,  100, '2025-03-10 15:00:00', 8, 'Uso en orden',                 1),
(13, 'Salida',  2,   75, '2025-04-10 10:00:00', 8, 'Uso en orden',                 1),
(14, 'Salida',  4,    5, '2025-04-15 08:30:00', 8, 'Uso en orden',                 1),
(15, 'Entrada', 1,   50, '2025-04-01 08:00:00', 2, 'Compra proveedor TextilAndes', 1),
(16, 'Salida',  7,   20, '2025-04-18 12:00:00', 8, 'Pérdida por daño en bodega',   1),
-- Sede 2
(17, 'Entrada', 8,  250, '2025-01-12 09:00:00', 9, 'Registro inicial',                  2),
(18, 'Entrada', 9,  100, '2025-01-12 09:05:00', 9, 'Registro inicial',                  2),
(19, 'Entrada',10,   25, '2025-01-12 09:10:00', 9, 'Registro inicial',                  2),
(20, 'Entrada',11, 1000, '2025-01-12 09:15:00', 9, 'Registro inicial',                  2),
(21, 'Entrada',12,  200, '2025-01-12 09:20:00', 9, 'Registro inicial',                  2),
(22, 'Entrada',13,  150, '2025-01-12 09:25:00', 9, 'Registro inicial',                  2),
(23, 'Salida',  8,   40, '2025-02-18 10:00:00', 9, 'Uso en orden',                      2),
(24, 'Salida',  9,   45, '2025-03-08 11:00:00', 9, 'Uso en orden',                      2),
(25, 'Salida', 11,  250, '2025-03-20 14:00:00', 9, 'Uso en orden',                      2),
(26, 'Entrada', 8,   30, '2025-04-05 08:00:00', 3, 'Compra proveedor Sedas del Valle',  2),
(27, 'Salida', 13,   20, '2025-04-22 09:00:00', 9, 'Uso en orden',                      2);
SET IDENTITY_INSERT MovimientosInventario OFF;
GO

-- Órdenes de Laureles (1-5) y Envigado (6-10);
SET IDENTITY_INSERT OrdenesProduccion ON;
INSERT INTO OrdenesProduccion (id_orden, cliente, prenda, cantidad, fecha_creacion, fecha_entrega, prioridad, estado, id_sede, id_usuario_responsable, fecha_finalizacion) VALUES
-- Sede 1
(1,  'Marca Urbana S.A.',      'Camiseta algodón básica',    200, '2025-02-01 09:00:00', '2025-02-28', 'Normal',  'Terminada',  1, 5, '2025-02-26 17:00:00'),
(2,  'Comercial Ropa Jeans',   'Jean clásico slim fit',       80, '2025-02-15 10:00:00', '2025-03-20', 'Normal',  'Terminada',  1, 5, '2025-03-18 16:30:00'),
(3,  'Tienda Moda Centro',     'Blusa manga larga denim',    120, '2025-03-05 09:00:00', '2025-04-05', 'Urgente', 'Terminada',  1, 5, '2025-04-03 14:00:00'),
(4,  'Exportaciones Textiles', 'Camiseta polo colores',      300, '2025-04-01 08:00:00', '2025-04-30', 'Normal',  'En proceso', 1, 5, NULL),
(5,  'Boutique Élite',         'Vestido cóctel algodón',      40, '2025-04-20 11:00:00', '2025-05-10', 'Urgente', 'Pendiente',  1, 5, NULL),
-- Sede 2
(6,  'Casa de Modas Lucía',    'Blusa seda manga corta',      60, '2025-02-10 09:00:00', '2025-03-10', 'Normal',  'Terminada',  2, 6, '2025-03-08 15:00:00'),
(7,  'Diseños Valentina',      'Vestido lino playa',          35, '2025-03-01 10:00:00', '2025-03-30', 'Normal',  'Terminada',  2, 6, '2025-03-28 17:00:00'),
(8,  'Novias del Valle',       'Traje de noche seda',         15, '2025-03-20 09:00:00', '2025-04-25', 'Urgente', 'En proceso', 2, 6, NULL),
(9,  'Corporativo Textil SA',  'Camisa ejecutiva lino',      100, '2025-04-05 08:00:00', '2025-05-05', 'Normal',  'Pendiente',  2, 6, NULL),
(10, 'Tienda Primavera',       'Vestido casual lino',         50, '2025-04-15 10:00:00', '2025-05-15', 'Normal',  'Pendiente',  2, 6, NULL);
SET IDENTITY_INSERT OrdenesProduccion OFF;
GO

-- Consumos de órdenes
SET IDENTITY_INSERT ConsumoInsumos ON;
INSERT INTO ConsumoInsumos (id_consumo, id_orden, id_insumo, cantidad_consumida, id_usuario, fecha_consumo) VALUES
(1,  1,  1,  30, 8, '2025-02-05 10:00:00'),
(2,  1,  3,   3, 8, '2025-02-10 11:00:00'),
(3,  1,  5,  50, 8, '2025-02-15 14:00:00'),
(4,  2,  2,  40, 8, '2025-02-18 10:00:00'),
(5,  2,  4,   5, 8, '2025-02-22 11:00:00'),
(6,  2,  6,  80, 8, '2025-03-01 09:00:00'),
(7,  3,  2,  35, 8, '2025-03-08 10:00:00'),
(8,  3,  4,   3, 8, '2025-03-12 11:00:00'),
(9,  3,  7,  20, 8, '2025-03-20 14:00:00'),
(10, 4,  1,  20, 8, '2025-04-05 10:00:00'),
(11, 4,  3,   2, 8, '2025-04-10 11:00:00'),
(12, 6,  9,  20, 9, '2025-02-15 10:00:00'),
(13, 6, 10,   2, 9, '2025-02-18 11:00:00'),
(14, 6, 12,  60, 9, '2025-02-22 14:00:00'),
(15, 7,  8,  40, 9, '2025-03-05 10:00:00'),
(16, 7, 11, 100, 9, '2025-03-08 11:00:00'),
(17, 7, 13,  10, 9, '2025-03-15 14:00:00'),
(18, 8,  9,  25, 9, '2025-03-25 10:00:00'),
(19, 8, 10,   5, 9, '2025-04-01 11:00:00');
SET IDENTITY_INSERT ConsumoInsumos OFF;
GO

-- ================================
-- VISTAS
-- ================================

-- Inventario completo con nombre de sede y responsable
CREATE OR ALTER VIEW vw_Inventario AS
SELECT
    i.id_insumo,
    i.nombre,
    i.categoria,
    i.unidad_medida,
    i.cantidad        AS stock_actual,
    i.stock_minimo,
    CASE WHEN i.cantidad < i.stock_minimo THEN 'ALERTA' ELSE 'OK' END AS estado_stock,
    i.stock_minimo - i.cantidad AS faltantes,
    s.nombre          AS sede,
    u.nombre          AS responsable,
    i.fecha_actualizacion
FROM Insumos i
JOIN Sedes    s ON i.id_sede                = s.id_sede
JOIN Usuarios u ON i.id_usuario_responsable = u.id_usuario;
GO

-- Insumos bajo el stock mínimo
CREATE OR ALTER VIEW vw_AlertasStock AS
SELECT
    i.id_insumo, i.nombre, i.categoria, i.unidad_medida,
    i.cantidad AS stock_actual, i.stock_minimo,
    i.stock_minimo - i.cantidad AS faltantes,
    s.nombre AS sede, i.alertas_stock
FROM Insumos i
JOIN Sedes s ON i.id_sede = s.id_sede
WHERE i.cantidad < i.stock_minimo;
GO

-- Órdenes con toda la info legible
CREATE OR ALTER VIEW vw_Ordenes AS
SELECT
    o.id_orden,
    o.cliente,
    o.prenda,
    o.cantidad,
    o.fecha_creacion,
    o.fecha_entrega,
    o.prioridad,
    o.estado,
    s.nombre  AS sede,
    u.nombre  AS responsable,
    o.fecha_finalizacion,
    CASE
        WHEN o.estado = 'Terminada' THEN NULL
        WHEN o.fecha_entrega < CAST(GETDATE() AS DATE)
            THEN DATEDIFF(DAY, o.fecha_entrega, CAST(GETDATE() AS DATE))
        ELSE 0
    END AS dias_retraso
FROM OrdenesProduccion o
JOIN Sedes    s ON o.id_sede                = s.id_sede
JOIN Usuarios u ON o.id_usuario_responsable = u.id_usuario;
GO

-- Órdenes retrasadas (no terminadas y fecha vencida)
CREATE OR ALTER VIEW vw_OrdenesRetrasadas AS
SELECT * FROM vw_Ordenes
WHERE estado <> 'Terminada' AND dias_retraso > 0;
GO

-- Movimientos con nombre de insumo, usuario y sede
CREATE OR ALTER VIEW vw_Movimientos AS
SELECT
    m.id_movimiento,
    m.tipo,
    i.nombre  AS insumo,
    i.categoria,
    m.cantidad,
    m.fecha,
    u.nombre  AS usuario,
    u.rol,
    m.motivo,
    s.nombre  AS sede
FROM MovimientosInventario m
JOIN Insumos  i ON m.id_insumo  = i.id_insumo
JOIN Usuarios u ON m.id_usuario = u.id_usuario
JOIN Sedes    s ON m.id_sede    = s.id_sede;
GO

-- Consumos con detalle de orden e insumo
CREATE OR ALTER VIEW vw_Consumos AS
SELECT
    c.id_consumo,
    o.cliente,
    o.prenda,
    i.nombre  AS insumo,
    i.categoria,
    i.unidad_medida,
    c.cantidad_consumida,
    u.nombre  AS registrado_por,
    c.fecha_consumo,
    s.nombre  AS sede
FROM ConsumoInsumos c
JOIN OrdenesProduccion o ON c.id_orden   = o.id_orden
JOIN Insumos           i ON c.id_insumo  = i.id_insumo
JOIN Usuarios          u ON c.id_usuario = u.id_usuario
JOIN Sedes             s ON o.id_sede    = s.id_sede;
GO

-- KPI: consumo total y promedio por insumo
CREATE OR ALTER VIEW vw_KPI_ConsumoInsumos AS
SELECT
    i.nombre AS insumo, i.unidad_medida, s.nombre AS sede,
    ISNULL(SUM(c.cantidad_consumida), 0)                AS total_consumido,
    COUNT(c.id_consumo)                                 AS num_registros,
    ISNULL(AVG(CAST(c.cantidad_consumida AS FLOAT)), 0) AS promedio_consumo,
    i.cantidad                                          AS stock_actual
FROM Insumos i
JOIN Sedes s ON i.id_sede = s.id_sede
LEFT JOIN ConsumoInsumos c ON c.id_insumo = i.id_insumo
GROUP BY i.id_insumo, i.nombre, i.unidad_medida, s.nombre, i.cantidad;
GO

-- KPI: tiempo promedio de producción por sede (solo órdenes terminadas)
CREATE OR ALTER VIEW vw_KPI_TiempoProduccion AS
SELECT
    s.nombre AS sede,
    COUNT(o.id_orden) AS ordenes_terminadas,
    AVG(DATEDIFF(HOUR, o.fecha_creacion, o.fecha_finalizacion)) AS promedio_horas
FROM OrdenesProduccion o
JOIN Sedes s ON o.id_sede = s.id_sede
WHERE o.estado = 'Terminada' AND o.fecha_finalizacion IS NOT NULL
GROUP BY s.nombre;
GO

-- KPI: resumen de órdenes por sede y estado
CREATE OR ALTER VIEW vw_KPI_OrdenesPorEstado AS
SELECT
    s.nombre AS sede,
    o.estado,
    o.prioridad,
    COUNT(*)        AS total_ordenes,
    SUM(o.cantidad) AS total_prendas
FROM OrdenesProduccion o
JOIN Sedes s ON o.id_sede = s.id_sede
GROUP BY s.nombre, o.estado, o.prioridad;
GO

-- KPI: entradas vs salidas por sede
CREATE OR ALTER VIEW vw_KPI_MovimientosPorSede AS
SELECT
    s.nombre AS sede,
    m.tipo,
    COUNT(*)        AS num_movimientos,
    SUM(m.cantidad) AS unidades_totales
FROM MovimientosInventario m
JOIN Sedes s ON m.id_sede = s.id_sede
GROUP BY s.nombre, m.tipo;
GO

-- ================================
-- CONSULTAS DE FILTRADO
-- ================================

-- Todo el inventario con estado de stock
SELECT * FROM vw_Inventario ORDER BY sede, nombre;

-- Solo los insumos en alerta
SELECT * FROM vw_AlertasStock ORDER BY sede, faltantes DESC;

-- Inventario de una sede específica
SELECT * FROM vw_Inventario WHERE sede = 'Sede Laureles';

-- Inventario filtrado por categoría
SELECT * FROM vw_Inventario WHERE categoria = 'tela' ORDER BY sede;

-- Todas las órdenes
SELECT * FROM vw_Ordenes ORDER BY fecha_creacion DESC;

-- Órdenes retrasadas
SELECT * FROM vw_OrdenesRetrasadas ORDER BY dias_retraso DESC;

-- Órdenes urgentes activas
SELECT * FROM vw_Ordenes WHERE prioridad = 'Urgente' AND estado <> 'Terminada';

-- Órdenes de una sede
SELECT * FROM vw_Ordenes WHERE sede = 'Sede Envigado' ORDER BY fecha_entrega;

-- Órdenes por estado
SELECT * FROM vw_Ordenes WHERE estado = 'En proceso';

-- Historial de movimientos recientes
SELECT TOP 20 * FROM vw_Movimientos ORDER BY fecha DESC;

-- Movimientos de un insumo específico
SELECT * FROM vw_Movimientos WHERE insumo = 'Tela denim azul' ORDER BY fecha;

-- Solo salidas de inventario
SELECT * FROM vw_Movimientos WHERE tipo = 'Salida' ORDER BY fecha DESC;

-- Consumos por orden
SELECT * FROM vw_Consumos WHERE cliente = 'Marca Urbana S.A.' ORDER BY fecha_consumo;

-- Consumos por insumo
SELECT * FROM vw_Consumos WHERE insumo = 'Hilo negro' ORDER BY fecha_consumo;

-- KPI rotación de insumos (ordenado por más consumido)
SELECT * FROM vw_KPI_ConsumoInsumos ORDER BY total_consumido DESC;

-- KPI insumos sin ningún consumo registrado
SELECT * FROM vw_KPI_ConsumoInsumos WHERE num_registros = 0;

-- KPI tiempo de producción por sede
SELECT * FROM vw_KPI_TiempoProduccion;

-- KPI resumen de órdenes por sede y estado
SELECT * FROM vw_KPI_OrdenesPorEstado ORDER BY sede, estado;

-- KPI movimientos (entradas vs salidas) por sede
SELECT * FROM vw_KPI_MovimientosPorSede ORDER BY sede, tipo;

-- Usuarios por sede y rol
SELECT u.nombre, u.rol, u.usuario_acceso, s.nombre AS sede
FROM Usuarios u JOIN Sedes s ON u.id_sede = s.id_sede
ORDER BY s.nombre, u.rol;
-- =============================================================
-- AgroStack — Seed de datos limpio
-- Limpia y repuebla TODAS las tablas excepto `users`.
-- Unidades válidas: kg, L, caja.
-- =============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
-- 1. LIMPIAR TABLAS (todas menos users)
-- ─────────────────────────────────────────────
TRUNCATE TABLE `inventory_movements`;
TRUNCATE TABLE `waste_records`;
TRUNCATE TABLE `sale_items`;
TRUNCATE TABLE `sales`;
TRUNCATE TABLE `provider_order_items`;
TRUNCATE TABLE `provider_orders`;
TRUNCATE TABLE `inventory_items`;
TRUNCATE TABLE `product_presentations`;
TRUNCATE TABLE `products`;
TRUNCATE TABLE `providers`;

SET FOREIGN_KEY_CHECKS = 1;

-- ─────────────────────────────────────────────
-- 2. PRODUCTOS (catálogo)
-- ─────────────────────────────────────────────
INSERT INTO `products` (`id`, `name`, `category`, `stock`, `price`, `unit`, `status`, `image_emoji`, `provider_id`, `provider_name`) VALUES
-- Fertilizantes kg
(1,  'Fertilizante Orgánico Premium',  'Fertilizantes', 0, 380.00, 'kg',   'out',       '🌱', NULL, NULL),
(2,  'Urea Granulada 46-0-0',          'Fertilizantes', 0, 220.00, 'kg',   'out',       '🧪', NULL, NULL),
(3,  'NPK 20-20-20 Soluble',           'Fertilizantes', 0, 450.00, 'kg',   'out',       '⚗️',  NULL, NULL),
(4,  'Sulfato de Amonio',              'Fertilizantes', 0, 195.00, 'kg',   'out',       '🧫', NULL, NULL),
(5,  'Fosfato Diamónico (DAP)',        'Fertilizantes', 0, 510.00, 'kg',   'out',       '🌿', NULL, NULL),
-- Semillas kg
(6,  'Semilla de Maíz Híbrido',        'Semillas',      0, 620.00, 'kg',   'out',       '🌽', NULL, NULL),
(7,  'Semilla de Trigo Dorado',        'Semillas',      0, 340.00, 'kg',   'out',       '🌾', NULL, NULL),
(8,  'Semilla de Frijol Negro',        'Semillas',      0, 280.00, 'kg',   'out',       '🫘', NULL, NULL),
(9,  'Semilla de Sorgo Forrajero',     'Semillas',      0, 260.00, 'kg',   'out',       '🌿', NULL, NULL),
-- Pesticidas L
(10, 'Insecticida Cipermetrina 25%',   'Pesticidas',    0, 890.00, 'L',    'out',       '🐛', NULL, NULL),
(11, 'Fungicida Cúprico Líquido',      'Pesticidas',    0, 760.00, 'L',    'out',       '🍄', NULL, NULL),
(12, 'Nematicida Orgánico',            'Pesticidas',    0, 1100.00,'L',    'out',       '🔬', NULL, NULL),
-- Herbicidas L
(13, 'Herbicida Glifosato 36%',        'Herbicidas',    0, 420.00, 'L',    'out',       '🌿', NULL, NULL),
(14, 'Herbicida 2,4-D Amina',          'Herbicidas',    0, 380.00, 'L',    'out',       '🌱', NULL, NULL),
(15, 'Herbicida Paraquat',             'Herbicidas',    0, 560.00, 'L',    'out',       '⚗️',  NULL, NULL),
-- Otros — cajas
(16, 'Manguera de Riego 1"',           'Otros',         0,  95.00, 'caja', 'out',       '💧', NULL, NULL),
(17, 'Goteros de Presión Regulada',    'Otros',         0,  45.00, 'caja', 'out',       '🚿', NULL, NULL);

-- ─────────────────────────────────────────────
-- 3. PRESENTACIONES (empaques por producto)
-- ─────────────────────────────────────────────
INSERT INTO `product_presentations` (`id`, `product_id`, `presentation_name`, `content_value`, `content_unit`, `price_override`, `is_default`, `is_active`) VALUES
-- Fertilizante Orgánico → costales de 25 kg
(1,  1, 'Costal de 25 kg',   25,  'kg', NULL, 1, 1),
-- Urea → costales de 50 kg
(2,  2, 'Costal de 50 kg',   50,  'kg', NULL, 1, 1),
-- NPK → bolsa de 5 kg
(3,  3, 'Costal de 5 kg',     5,  'kg', NULL, 1, 1),
-- Sulfato Amonio → costal 50 kg
(4,  4, 'Costal de 50 kg',   50,  'kg', NULL, 1, 1),
-- DAP → costal 25 kg
(5,  5, 'Costal de 25 kg',   25,  'kg', NULL, 1, 1),
-- Maíz → costal 20 kg
(6,  6, 'Costal de 20 kg',   20,  'kg', NULL, 1, 1),
-- Trigo → costal 50 kg
(7,  7, 'Costal de 50 kg',   50,  'kg', NULL, 1, 1),
-- Frijol → costal 25 kg
(8,  8, 'Costal de 25 kg',   25,  'kg', NULL, 1, 1),
-- Sorgo → costal 25 kg
(9,  9, 'Costal de 25 kg',   25,  'kg', NULL, 1, 1),
-- Cipermetrina → garrafón 5 L
(10, 10, 'Garrafón de 5 L',   5,  'L',  NULL, 1, 1),
-- Fungicida → garrafón 5 L
(11, 11, 'Garrafón de 5 L',   5,  'L',  NULL, 1, 1),
-- Nematicida → garrafón 10 L
(12, 12, 'Garrafón de 10 L', 10,  'L',  NULL, 1, 1),
-- Glifosato → garrafón 20 L
(13, 13, 'Garrafón de 20 L', 20,  'L',  NULL, 1, 1),
-- 2,4-D → garrafón 20 L
(14, 14, 'Garrafón de 20 L', 20,  'L',  NULL, 1, 1),
-- Paraquat → garrafón 20 L
(15, 15, 'Garrafón de 20 L', 20,  'L',  NULL, 1, 1),
-- Manguera → varias opciones de rollo/caja
(16, 16, 'Rollo de 25 m',    25,  'caja', NULL, 0, 1),
(18, 16, 'Caja de 50 m',     50,  'caja', NULL, 1, 1),
(19, 16, 'Caja de 100 m',   100,  'caja', NULL, 0, 1),
-- Goteros → varias opciones de caja
(17, 17, 'Caja 25 piezas',   25,  'caja', NULL, 0, 1),
(20, 17, 'Caja 50 piezas',   50,  'caja', NULL, 0, 1),
(21, 17, 'Caja 100 piezas', 100,  'caja', NULL, 1, 1);

-- ─────────────────────────────────────────────
-- 4. INVENTARIO (lotes activos)
-- Regla: quantity = num_empaques × content_value
-- ─────────────────────────────────────────────
INSERT INTO `inventory_items`
  (`id`, `product_id`, `presentation_id`, `product_name`, `category`,
   `quantity`, `unit`, `lot_number`, `expiry_date`, `location`,
   `provider`, `receipt_date`, `status`)
VALUES
-- Fertilizante Orgánico | 4 costales 25 kg = 100 kg
(1,  1,  1, 'Fertilizante Orgánico Premium', 'Fertilizantes',
 100, 'kg', 'LOT-001-20260115', '2027-01-15', 'Pasillo A-1',
 'AgroNutrientes SA', '2026-01-15', 'active'),

-- Urea | 6 costales 50 kg = 300 kg  (2 lotes, fechas distintas)
(2,  2,  2, 'Urea Granulada 46-0-0', 'Fertilizantes',
 300, 'kg', 'LOT-002-20260201', '2027-02-01', 'Pasillo A-2',
 'BioAgro Solutions', '2026-02-01', 'active'),
(3,  2,  2, 'Urea Granulada 46-0-0', 'Fertilizantes',
 150, 'kg', 'LOT-002-20260410', '2027-04-10', 'Pasillo A-2',
 'BioAgro Solutions', '2026-04-10', 'active'),

-- NPK 20-20-20 | 10 costales 5 kg = 50 kg (por vencer pronto)
(4,  3,  3, 'NPK 20-20-20 Soluble', 'Fertilizantes',
 50,  'kg', 'LOT-003-20260305', '2026-07-05', 'Pasillo A-3',
 'AgroNutrientes SA', '2026-03-05', 'active'),

-- Sulfato de Amonio | 4 costales 50 kg = 200 kg
(5,  4,  4, 'Sulfato de Amonio', 'Fertilizantes',
 200, 'kg', 'LOT-004-20260118', '2027-06-18', 'Pasillo B-1',
 'BioAgro Solutions', '2026-01-18', 'active'),

-- DAP | 3 costales 25 kg = 75 kg
(6,  5,  5, 'Fosfato Diamónico (DAP)', 'Fertilizantes',
 75,  'kg', 'LOT-005-20260220', '2027-08-20', 'Pasillo B-2',
 'AgroNutrientes SA', '2026-02-20', 'active'),

-- Maíz Híbrido | 5 costales 20 kg = 100 kg
(7,  6,  6, 'Semilla de Maíz Híbrido', 'Semillas',
 100, 'kg', 'LOT-006-20260310', '2026-09-10', 'Pasillo B-3',
 'SemiPro México', '2026-03-10', 'active'),

-- Trigo | 4 costales 50 kg = 200 kg
(8,  7,  7, 'Semilla de Trigo Dorado', 'Semillas',
 200, 'kg', 'LOT-007-20260215', '2026-10-15', 'Pasillo B-3',
 'SemiPro México', '2026-02-15', 'active'),

-- Frijol | 2 costales 25 kg = 50 kg (CRÍTICO: vence en <15 días)
(9,  8,  8, 'Semilla de Frijol Negro', 'Semillas',
 50,  'kg', 'LOT-008-20260101', '2026-06-12', 'Pasillo C-1',
 'Semillas del Campo MX', '2026-01-01', 'active'),

-- Sorgo | 3 costales 25 kg = 75 kg
(10, 9,  9, 'Semilla de Sorgo Forrajero', 'Semillas',
 75,  'kg', 'LOT-009-20260320', '2026-11-20', 'Pasillo C-2',
 'Semillas del Campo MX', '2026-03-20', 'active'),

-- Cipermetrina | 4 garrafones 5 L = 20 L
(11, 10, 10, 'Insecticida Cipermetrina 25%', 'Pesticidas',
 20,  'L',  'LOT-010-20260405', '2027-04-05', 'Pasillo C-3',
 'ProteCampo', '2026-04-05', 'active'),

-- Fungicida | 2 garrafones 5 L = 10 L (ADVERTENCIA: vence en ~25 días)
(12, 11, 11, 'Fungicida Cúprico Líquido', 'Pesticidas',
 10,  'L',  'LOT-011-20260202', '2026-06-28', 'Pasillo C-3',
 'ProteCampo', '2026-02-02', 'active'),

-- Nematicida | 3 garrafones 10 L = 30 L
(13, 12, 12, 'Nematicida Orgánico', 'Pesticidas',
 30,  'L',  'LOT-012-20260415', '2027-10-15', 'Pasillo A-1',
 'ProteCampo', '2026-04-15', 'active'),

-- Glifosato | 3 garrafones 20 L = 60 L
(14, 13, 13, 'Herbicida Glifosato 36%', 'Herbicidas',
 60,  'L',  'LOT-013-20260122', '2027-01-22', 'Pasillo A-2',
 'HerbiMax', '2026-01-22', 'active'),

-- 2,4-D | 2 garrafones 20 L = 40 L (VENCIDO: para prueba de alertas)
(15, 14, 14, 'Herbicida 2,4-D Amina', 'Herbicidas',
 40,  'L',  'LOT-014-20250901', '2026-05-01', 'Pasillo A-3',
 'HerbiMax', '2025-09-01', 'active'),

-- Paraquat | 1 garrafón 20 L = 20 L
(16, 15, 15, 'Herbicida Paraquat', 'Herbicidas',
 20,  'L',  'LOT-015-20260301', '2027-03-01', 'Pasillo B-1',
 'HerbiMax', '2026-03-01', 'active'),

-- Manguera | 2 cajas 50 m = 100 m (presentación default: Caja 50m, id=18)
(17, 16, 18, 'Manguera de Riego 1"', 'Otros',
 100, 'caja', 'LOT-016-20260410', '2030-01-01', 'Pasillo B-2',
 'IrrigaTech', '2026-04-10', 'active'),

-- Goteros | 3 cajas 100 pzas = 300 pzas (presentación default: Caja 100 piezas, id=21)
(18, 17, 21, 'Goteros de Presión Regulada', 'Otros',
 300, 'caja', 'LOT-017-20260501', '2030-01-01', 'Pasillo B-2',
 'IrrigaTech', '2026-05-01', 'active');

-- ─────────────────────────────────────────────
-- 5. MOVIMIENTOS INICIALES (entradas)
-- ─────────────────────────────────────────────
INSERT INTO `inventory_movements`
  (`inventory_item_id`, `movement_type`, `quantity`, `user_id`, `destination`, `notes`)
VALUES
(1,  'entry', 100, NULL, NULL, 'Entrada inicial — Fertilizante Orgánico Premium'),
(2,  'entry', 300, NULL, NULL, 'Entrada inicial — Urea Granulada 46-0-0'),
(3,  'entry', 150, NULL, NULL, 'Entrada inicial — Urea Granulada 46-0-0 (lote 2)'),
(4,  'entry',  50, NULL, NULL, 'Entrada inicial — NPK 20-20-20 Soluble'),
(5,  'entry', 200, NULL, NULL, 'Entrada inicial — Sulfato de Amonio'),
(6,  'entry',  75, NULL, NULL, 'Entrada inicial — Fosfato Diamónico'),
(7,  'entry', 100, NULL, NULL, 'Entrada inicial — Semilla de Maíz Híbrido'),
(8,  'entry', 200, NULL, NULL, 'Entrada inicial — Semilla de Trigo Dorado'),
(9,  'entry',  50, NULL, NULL, 'Entrada inicial — Semilla de Frijol Negro'),
(10, 'entry',  75, NULL, NULL, 'Entrada inicial — Semilla de Sorgo Forrajero'),
(11, 'entry',  20, NULL, NULL, 'Entrada inicial — Insecticida Cipermetrina 25%'),
(12, 'entry',  10, NULL, NULL, 'Entrada inicial — Fungicida Cúprico Líquido'),
(13, 'entry',  30, NULL, NULL, 'Entrada inicial — Nematicida Orgánico'),
(14, 'entry',  60, NULL, NULL, 'Entrada inicial — Herbicida Glifosato 36%'),
(15, 'entry',  40, NULL, NULL, 'Entrada inicial — Herbicida 2,4-D Amina'),
(16, 'entry',  20, NULL, NULL, 'Entrada inicial — Herbicida Paraquat'),
(17, 'entry', 100, NULL, NULL, 'Entrada inicial — Manguera de Riego'),
(18, 'entry', 300, NULL, NULL, 'Entrada inicial — Goteros de Presión Regulada');

-- ─────────────────────────────────────────────
-- 6. RECALCULAR STOCK EN products
--    (suma de inventory_items activos por product_id)
-- ─────────────────────────────────────────────
SET SQL_SAFE_UPDATES = 0;

UPDATE `products` p
SET
  p.stock = (
    SELECT COALESCE(SUM(i.quantity), 0)
    FROM `inventory_items` i
    WHERE i.product_id = p.id AND i.status = 'active'
  ),
  p.status = CASE
    WHEN (SELECT COALESCE(SUM(i.quantity), 0)
          FROM `inventory_items` i
          WHERE i.product_id = p.id AND i.status = 'active') <= 0  THEN 'out'
    WHEN (SELECT COALESCE(SUM(i.quantity), 0)
          FROM `inventory_items` i
          WHERE i.product_id = p.id AND i.status = 'active') <= 20 THEN 'low'
    ELSE 'available'
  END;

SET SQL_SAFE_UPDATES = 1;

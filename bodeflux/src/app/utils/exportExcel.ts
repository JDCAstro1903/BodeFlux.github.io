import * as XLSX from 'xlsx';
import type { InventoryItemAPI, ProductAPI, InventoryMovementAPI } from '../services/api';

// ── helpers ────────────────────────────────────────────────────────────────
function excelDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('es-MX', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function saveWorkbook(wb: XLSX.WorkBook, filename: string) {
  XLSX.writeFile(wb, filename);
}

// ── Inventory export ────────────────────────────────────────────────────────
export function exportInventoryToExcel(
  items: InventoryItemAPI[],
  products: ProductAPI[],
  filename = 'Inventario_BodeFlux.xlsx',
) {
  const priceMap = new Map<string, number>(
    products.map((p) => [p.name.toLowerCase(), p.price ?? 0]),
  );

  // Headers row 1 (bold via cell style — SheetJS CE supports basic styles via utils)
  const headers = [
    'Producto', 'Categoría', 'Lote', 'Ubicación',
    'Cantidad', 'Unidad', 'Precio Unitario', 'Valor Total',
    'Vencimiento', 'Proveedor', 'Estado',
  ];

  const dataRows = items.map((item, i) => {
    const rowNum = i + 2; // row 1 is header
    const price = priceMap.get(item.product_name.toLowerCase()) ?? 0;
    return [
      item.product_name,
      item.category,
      item.lot_number,
      item.location,
      item.quantity,
      item.unit,
      price,
      // Formula: =Cantidad * Precio
      { f: `E${rowNum}*G${rowNum}` },
      item.expiry_date,
      item.provider ?? '—',
      item.status === 'active' ? 'Activo' : item.status === 'output' ? 'Salida' : 'Merma',
    ];
  });

  // Summary row at the bottom
  const lastDataRow = items.length + 1;
  const summaryRow = [
    'TOTAL', '', '', '',
    { f: `SUM(E2:E${lastDataRow})` },   // total units
    '',
    '',
    { f: `SUM(H2:H${lastDataRow})` },   // total $ value
    '', '', '',
  ];

  const wsData = [headers, ...dataRows, summaryRow];
  const ws = XLSX.utils.aoa_to_sheet(wsData);

  // Column widths
  ws['!cols'] = [
    { wch: 30 }, { wch: 16 }, { wch: 14 }, { wch: 12 },
    { wch: 10 }, { wch: 8  }, { wch: 16 }, { wch: 16 },
    { wch: 14 }, { wch: 22 }, { wch: 10 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Inventario');

  // ── Pivot by category ──────────────────────────────────────────────────
  const catMap = new Map<string, { qty: number; value: number }>();
  items.forEach((item) => {
    const price = priceMap.get(item.product_name.toLowerCase()) ?? 0;
    const entry = catMap.get(item.category) ?? { qty: 0, value: 0 };
    entry.qty += item.quantity;
    entry.value += item.quantity * price;
    catMap.set(item.category, entry);
  });

  const pivotHeaders = ['Categoría', 'Lotes', 'Unidades Totales', 'Valor Total ($)'];
  const pivotRows: (string | number)[][] = [];
  catMap.forEach((v, cat) => {
    const count = items.filter((i) => i.category === cat).length;
    pivotRows.push([cat, count, v.qty, v.value]);
  });
  const pivotWs = XLSX.utils.aoa_to_sheet([pivotHeaders, ...pivotRows]);
  pivotWs['!cols'] = [{ wch: 20 }, { wch: 8 }, { wch: 18 }, { wch: 18 }];
  XLSX.utils.book_append_sheet(wb, pivotWs, 'Resumen por Categoría');

  saveWorkbook(wb, filename);
}

// ── Movements export ────────────────────────────────────────────────────────
export function exportMovementsToExcel(
  movements: InventoryMovementAPI[],
  dateFrom: string | null,
  dateTo: string | null,
  filename = 'Movimientos_BodeFlux.xlsx',
) {
  const typeLabel: Record<string, string> = {
    entry: 'Entrada',
    output: 'Salida',
    waste: 'Merma',
  };

  const headers = [
    'Fecha', 'Tipo', 'Producto', 'Lote',
    'Cantidad', 'Unidad', 'Destino / Nota', 'Usuario',
  ];

  const rows = movements.map((m) => [
    excelDate(m.created_at),
    typeLabel[m.movement_type] ?? m.movement_type,
    m.product_name ?? '—',
    m.lot_number ?? '—',
    m.quantity,
    m.unit ?? '—',
    m.destination ?? m.notes ?? '—',
    m.user_name ?? '—',
  ]);

  // Summary
  const entries = movements.filter((m) => m.movement_type === 'entry');
  const outputs = movements.filter((m) => m.movement_type === 'output');
  const wastes  = movements.filter((m) => m.movement_type === 'waste');

  const sumQty = (arr: InventoryMovementAPI[]) =>
    arr.reduce((s, m) => s + m.quantity, 0);

  const summaryRows = [
    [],
    ['RESUMEN DEL PERÍODO'],
    dateFrom || dateTo
      ? [`Rango: ${dateFrom ?? '—'} → ${dateTo ?? '—'}`]
      : ['Rango: todos los registros'],
    [],
    ['Tipo', 'Eventos', 'Unidades Totales'],
    ['Entradas', entries.length, sumQty(entries)],
    ['Salidas',  outputs.length, sumQty(outputs)],
    ['Mermas',   wastes.length,  sumQty(wastes)],
    ['TOTAL',    movements.length, sumQty(movements)],
  ];

  const wsData = [headers, ...rows, ...summaryRows];
  const ws = XLSX.utils.aoa_to_sheet(wsData);
  ws['!cols'] = [
    { wch: 20 }, { wch: 10 }, { wch: 28 }, { wch: 14 },
    { wch: 10 }, { wch: 8  }, { wch: 30 }, { wch: 18 },
  ];

  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Movimientos');
  saveWorkbook(wb, filename);
}

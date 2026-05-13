import { TrendingUp, DollarSign, Clock, BarChart3, Download, FileText, PieChart as PieChartIcon, Activity } from 'lucide-react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, AreaChart, Area, Legend } from 'recharts';
import { useState, useEffect } from 'react';
import { dashboardApi, type KPIsAPI } from '../services/api';

const COLORS = ['#1B4332', '#0071E3', '#10B981', '#F59E0B', '#EF4444'];

export function ExecutiveDashboard() {
  const [stockData, setStockData] = useState<{ month: string; stock: number }[]>([]);
  const [categoryData, setCategoryData] = useState<{ category: string; value: number }[]>([]);
  const [pieData, setPieData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [revenueData, setRevenueData] = useState<{ month: string; revenue: number; expenses: number }[]>([]);
  const [movementData, setMovementData] = useState<{ day: string; entradas: number; salidas: number }[]>([]);
  const [topProducts, setTopProducts] = useState<{ name: string; sales: number; revenue: number }[]>([]);
  const [topProviders, setTopProviders] = useState<{ name: string; rating: number; orders: number; onTime: number }[]>([]);

  const [kpis, setKpis] = useState({
    inventoryValue: '—',
    inventoryDelta: '—',
    avoidedWaste: '—',
    avoidedWasteDelta: '—',
    avgResponseTime: '—',
    avgResponseDelta: '—',
    activeProducts: '—',
    movementsToday: '—',
    activeUsers: '—',
    rotationRate: '—',
    rotationDelta: '—',
    fulfillment: '—',
    fulfillmentDelta: '—',
    responseTime: '—',
    responseDelta: '—',
    stockAccuracy: '—',
    stockDelta: '—',
  });

  // Fetch all dashboard data from API
  useEffect(() => {
    // KPIs
    dashboardApi.kpis().then((data) => {
      setKpis({
        inventoryValue: data.inventory_value,
        inventoryDelta: data.inventory_delta,
        avoidedWaste: data.avoided_waste,
        avoidedWasteDelta: data.avoided_waste_delta,
        avgResponseTime: data.avg_response_time,
        avgResponseDelta: data.avg_response_delta,
        activeProducts: String(data.active_products),
        movementsToday: String(data.movements_today),
        activeUsers: String(data.active_users),
        rotationRate: data.rotation_rate,
        rotationDelta: data.rotation_delta,
        fulfillment: data.fulfillment,
        fulfillmentDelta: data.fulfillment_delta,
        responseTime: data.response_time,
        responseDelta: data.response_delta,
        stockAccuracy: data.stock_accuracy,
        stockDelta: data.stock_delta,
      });
    }).catch(console.error);

    // Charts
    dashboardApi.stockChart().then((data) => {
      setStockData(data.map((d) => ({ month: d.label, stock: d.value })));
    }).catch(console.error);

    dashboardApi.categoriesChart().then((data) => {
      setCategoryData(data.map((d) => ({ category: d.label, value: d.value })));
      setPieData(data.map((d, i) => ({ name: d.label, value: d.value, color: COLORS[i % COLORS.length] })));
    }).catch(console.error);

    dashboardApi.revenueChart().then((data) => {
      setRevenueData(data.map((d) => ({ month: d.label, revenue: d.value, expenses: d.value2 || 0 })));
    }).catch(console.error);

    dashboardApi.movementsChart().then((data) => {
      setMovementData(data.map((d) => ({ day: d.label, entradas: d.value, salidas: d.value2 || 0 })));
    }).catch(console.error);

    dashboardApi.topProducts().then((data) => {
      setTopProducts(data);
    }).catch(console.error);

    dashboardApi.topProviders().then((data) => {
      setTopProviders(data.map((p) => ({ name: p.name, rating: p.rating, orders: p.orders, onTime: p.on_time })));
    }).catch(console.error);
  }, []);

  const handleGenerateReport = (reportType: string) => {
    alert(`Generando reporte: ${reportType}\n\nEl reporte se descargará en formato PDF.`);
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between flex-wrap gap-3 md:gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-semibold text-[#1B4332] dark:text-[#34D399]">
            Dashboard Ejecutivo
          </h1>
          <p className="text-sm md:text-base text-[#6B7280] dark:text-[#CBD5E1] mt-1">
            Vista panorámica de métricas clave
          </p>
        </div>

        {/* Report Generation Buttons */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => handleGenerateReport('Reporte Mensual')}
            className="px-3 md:px-4 py-2 rounded-[12px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] dark:from-[#60A5FA] dark:to-[#3B82F6] text-white hover:shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm font-semibold"
          >
            <Download size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Mensual</span>
          </button>
          <button
            onClick={() => handleGenerateReport('Reporte Trimestral')}
            className="px-3 md:px-4 py-2 rounded-[12px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-[#34D399] dark:to-[#10B981] text-white hover:shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm font-semibold"
          >
            <FileText size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Trimestral</span>
          </button>
          <button
            onClick={() => handleGenerateReport('Reporte Anual')}
            className="px-3 md:px-4 py-2 rounded-[12px] bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#10B981] dark:to-[#059669] text-white hover:shadow-lg transition-all flex items-center gap-2 text-xs md:text-sm font-semibold"
          >
            <BarChart3 size={14} className="md:w-4 md:h-4" />
            <span className="hidden sm:inline">Anual</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-5">
        {/* Total Inventory Value */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] dark:from-[#34D399] dark:to-[#10B981] p-5 md:p-6 text-white relative overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(27, 67, 50, 0.25)' }}
        >
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4">
              <DollarSign size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xs md:text-sm text-white/80 font-medium mb-2">
              Valor Total de Inventario
            </div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {kpis.inventoryValue}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20">
                <TrendingUp size={12} className="md:w-3.5 md:h-3.5" />
                <span className="font-semibold">{kpis.inventoryDelta}</span>
              </div>
              <span className="text-white/70 text-xs">vs. mes anterior</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full" />
        </div>

        {/* Mermas Avoided */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#0071E3] to-[#005BB5] dark:from-[#60A5FA] dark:to-[#3B82F6] p-5 md:p-6 text-white relative overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(0, 113, 227, 0.25)' }}
        >
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4">
              <TrendingUp size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xs md:text-sm text-white/80 font-medium mb-2">
              Mermas Evitadas
            </div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {kpis.avoidedWaste}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20">
                <TrendingUp size={12} className="md:w-3.5 md:h-3.5" />
                <span className="font-semibold">{kpis.avoidedWasteDelta}</span>
              </div>
              <span className="text-white/70 text-xs">ahorro anual</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full" />
        </div>

        {/* Team Efficiency */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#10B981] dark:to-[#059669] p-5 md:p-6 text-white relative overflow-hidden"
          style={{ boxShadow: '0 12px 40px rgba(16, 185, 129, 0.25)' }}
        >
          <div className="relative z-10">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center mb-3 md:mb-4">
              <Clock size={20} className="md:w-6 md:h-6 text-white" />
            </div>
            <div className="text-xs md:text-sm text-white/80 font-medium mb-2">
              Eficiencia del Equipo
            </div>
            <div className="text-3xl md:text-4xl font-bold mb-2">
              {kpis.avgResponseTime}
            </div>
            <div className="flex items-center gap-2 text-xs md:text-sm text-white/90">
              <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/20">
                <TrendingUp size={12} className="md:w-3.5 md:h-3.5" />
                <span className="font-semibold">{kpis.avgResponseDelta}</span>
              </div>
              <span className="text-white/70 text-xs">tiempo promedio</span>
            </div>
          </div>
          <div className="absolute -right-6 -bottom-6 w-24 h-24 md:w-32 md:h-32 bg-white/5 rounded-full" />
        </div>
      </div>

      {/* Revenue vs Expenses Chart */}
      <div
        className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
      >
        <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
          <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#10B981] to-[#059669] dark:from-[#10B981] dark:to-[#059669] flex items-center justify-center">
            <Activity size={16} className="md:w-5 md:h-5 text-white" />
          </div>
          <div>
            <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
              Ingresos vs Gastos
            </h3>
            <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
              Análisis financiero mensual
            </p>
          </div>
        </div>

        <ResponsiveContainer width="100%" height={240}>
          <AreaChart data={revenueData}>
            <defs key="rev-defs">
              <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#EF4444" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid key="rev-grid" strokeDasharray="3 3" stroke="rgba(27, 67, 50, 0.1)" />
            <XAxis key="rev-x" dataKey="month" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <YAxis key="rev-y" stroke="#6B7280" style={{ fontSize: '12px' }} />
            <Tooltip
              key="rev-tooltip"
              contentStyle={{
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
              }}
            />
            <Legend key="rev-legend" />
            <Area
              key="area-revenue"
              type="monotone"
              dataKey="revenue"
              name="Ingresos"
              stroke="#10B981"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorRevenue)"
            />
            <Area
              key="area-expenses"
              type="monotone"
              dataKey="expenses"
              name="Gastos"
              stroke="#EF4444"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#colorExpenses)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5">
        {/* Stock Levels Chart */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center">
              <TrendingUp size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
                Niveles de Stock
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                Últimos 4 meses
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={stockData}>
              <CartesianGrid key="line-grid" strokeDasharray="3 3" stroke="rgba(27, 67, 50, 0.1)" />
              <XAxis
                key="line-x"
                dataKey="month"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                key="line-y"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <Tooltip
                key="line-tooltip"
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Line
                key="line-stock"
                type="monotone"
                dataKey="stock"
                stroke="#1B4332"
                strokeWidth={3}
                dot={{ fill: '#1B4332', r: 5 }}
                activeDot={{ r: 7 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Product Categories Chart */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#0071E3] to-[#005BB5] dark:from-[#60A5FA] dark:to-[#3B82F6] flex items-center justify-center">
              <BarChart3 size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
                Categorías de Productos
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                Distribución actual
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={categoryData} layout="vertical">
              <defs key="cat-defs">
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#1B4332" />
                  <stop offset="100%" stopColor="#0071E3" />
                </linearGradient>
              </defs>
              <CartesianGrid key="cat-grid" strokeDasharray="3 3" stroke="rgba(27, 67, 50, 0.1)" />
              <XAxis
                key="cat-x"
                type="number"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
              />
              <YAxis
                key="cat-y"
                type="category"
                dataKey="category"
                stroke="#6B7280"
                style={{ fontSize: '12px' }}
                width={100}
              />
              <Tooltip
                key="cat-tooltip"
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Bar
                key="bar-categories"
                dataKey="value"
                fill="url(#colorGradient)"
                radius={[0, 12, 12, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Movement Trends */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#F59E0B] to-[#D97706] flex items-center justify-center">
              <Activity size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
                Movimientos Semanales
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                Entradas vs Salidas
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={movementData}>
              <CartesianGrid key="mov-grid" strokeDasharray="3 3" stroke="rgba(27, 67, 50, 0.1)" />
              <XAxis key="mov-x" dataKey="day" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <YAxis key="mov-y" stroke="#6B7280" style={{ fontSize: '12px' }} />
              <Tooltip
                key="mov-tooltip"
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
              <Legend key="mov-legend" />
              <Bar key="bar-entradas" dataKey="entradas" name="Entradas" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar key="bar-salidas" dataKey="salidas" name="Salidas" fill="#0071E3" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Distribution Pie Chart */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <div className="flex items-center gap-2 md:gap-3 mb-4 md:mb-6">
            <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center">
              <PieChartIcon size={16} className="md:w-5 md:h-5 text-white" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399]">
                Distribución por Categoría
              </h3>
              <p className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                Porcentaje del inventario
              </p>
            </div>
          </div>

          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, value }) => `${name}: ${value}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'rgba(255, 255, 255, 0.95)',
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 16px rgba(0, 0, 0, 0.1)',
                }}
              />
            </PieChart>
          </ResponsiveContainer>

          {/* Legend */}
          <div className="grid grid-cols-2 gap-2 mt-3 md:mt-4">
            {pieData.map((item, index) => (
              <div key={index} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: item.color }}
                />
                <span className="text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                  {item.name} ({item.value}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-4">
        <div
          className="rounded-[16px] md:rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-3 md:p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
            {kpis.activeProducts}
          </div>
          <div className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
            Productos Activos
          </div>
        </div>

        <div
          className="rounded-[16px] md:rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-3 md:p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
            {kpis.movementsToday}
          </div>
          <div className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
            Movimientos Hoy
          </div>
        </div>

        <div
          className="rounded-[16px] md:rounded-[20px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-3 md:p-5"
          style={{ boxShadow: '0 4px 16px rgba(0, 0, 0, 0.06)' }}
        >
          <div className="text-xl md:text-2xl font-bold text-[#0071E3] dark:text-[#60A5FA] mb-1">
            {kpis.activeUsers}
          </div>
          <div className="text-xs font-medium text-[#6B7280] dark:text-[#CBD5E1]">
            Usuarios Activos
          </div>
        </div>
      </div>

      {/* Advanced Analytics Section */}
      <div
        className="rounded-[20px] md:rounded-[24px] bg-gradient-to-br from-[#1B4332]/10 to-[#0071E3]/5 dark:from-[#34D399]/10 dark:to-[#60A5FA]/5 backdrop-blur-xl p-4 md:p-6 border border-[#1B4332]/10 dark:border-[#34D399]/30"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
      >
        <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399] mb-3 md:mb-4">
          Análisis Avanzado
        </h3>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4">
          {/* Rotation Rate */}
          <div className="rounded-[12px] md:rounded-[16px] bg-white/60 dark:bg-[#334155]/60 p-3 md:p-4">
            <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mb-2">
              Tasa de Rotación
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
              {kpis.rotationRate}
            </div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#10B981]">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              {kpis.rotationDelta}
            </div>
          </div>

          {/* Order Fulfillment */}
          <div className="rounded-[12px] md:rounded-[16px] bg-white/60 dark:bg-[#334155]/60 p-3 md:p-4">
            <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mb-2">
              Cumplimiento de Pedidos
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
              {kpis.fulfillment}
            </div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#10B981]">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              {kpis.fulfillmentDelta}
            </div>
          </div>

          {/* Avg Response Time */}
          <div className="rounded-[12px] md:rounded-[16px] bg-white/60 dark:bg-[#334155]/60 p-3 md:p-4">
            <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mb-2">
              Tiempo Respuesta Prom.
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
              {kpis.responseTime}
            </div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#10B981]">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              {kpis.responseDelta}
            </div>
          </div>

          {/* Stock Accuracy */}
          <div className="rounded-[12px] md:rounded-[16px] bg-white/60 dark:bg-[#334155]/60 p-3 md:p-4">
            <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] mb-2">
              Precisión de Stock
            </div>
            <div className="text-xl md:text-2xl font-bold text-[#1B4332] dark:text-[#34D399] mb-1">
              {kpis.stockAccuracy}
            </div>
            <div className="flex items-center gap-1 text-[10px] md:text-xs text-[#10B981]">
              <TrendingUp size={10} className="md:w-3 md:h-3" />
              {kpis.stockDelta}
            </div>
          </div>
        </div>
      </div>

      {/* Top Products & Providers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 md:gap-5">
        {/* Top Products */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399] mb-3 md:mb-4">
            Top 5 Productos Más Vendidos
          </h3>

          <div className="space-y-2 md:space-y-3">
            {topProducts.length === 0 && (
              <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] py-4">
                Sin datos disponibles
              </div>
            )}
            {topProducts.map((product, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 md:p-3 rounded-[12px] bg-gradient-to-r from-[#1B4332]/5 to-transparent dark:from-[#10B981]/10 dark:to-transparent"
              >
                <div className="flex items-center gap-2 md:gap-3">
                  <div
                    className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-[#1B4332] to-[#0071E3] dark:from-[#34D399] dark:to-[#60A5FA] flex items-center justify-center text-[10px] font-bold text-white"
                  >
                    #{index + 1}
                  </div>
                  <div>
                    <div className="text-xs md:text-sm font-semibold text-[#1B4332] dark:text-[#34D399]">
                      {product.name}
                    </div>
                    <div className="text-[10px] md:text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                      {product.sales} unidades
                    </div>
                  </div>
                </div>
                <div className="text-sm md:text-base font-bold text-[#10B981]">
                  ${product.revenue.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Providers */}
        <div
          className="rounded-[20px] md:rounded-[24px] bg-white/75 dark:bg-[#1E293B]/75 backdrop-blur-xl p-4 md:p-6"
          style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)' }}
        >
          <h3 className="text-base md:text-lg font-semibold text-[#1B4332] dark:text-[#34D399] mb-3 md:mb-4">
            Proveedores Destacados
          </h3>

          <div className="space-y-2 md:space-y-3">
            {topProviders.length === 0 && (
              <div className="text-xs text-[#6B7280] dark:text-[#CBD5E1] py-4">
                Sin datos disponibles
              </div>
            )}
            {topProviders.map((provider, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 md:p-3 rounded-[12px] bg-gradient-to-r from-[#0071E3]/5 to-transparent dark:from-[#3B82F6]/10 dark:to-transparent"
              >
                <div>
                  <div className="text-xs md:text-sm font-semibold text-[#1B4332] dark:text-[#34D399] mb-1">
                    {provider.name}
                  </div>
                  <div className="flex items-center gap-2 md:gap-3 text-[10px] md:text-xs text-[#6B7280] dark:text-[#CBD5E1]">
                    <span>⭐ {provider.rating}</span>
                    <span>•</span>
                    <span>{provider.orders} pedidos</span>
                    <span className="hidden md:inline">•</span>
                    <span className={provider.onTime >= 95 ? 'text-[#10B981]' : 'text-[#F59E0B]'}>
                      {provider.onTime}% puntual
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

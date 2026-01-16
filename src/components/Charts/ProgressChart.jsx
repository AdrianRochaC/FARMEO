import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const ProgressChart = ({ data }) => {
    // Transformar datos para el BarChart
    const chartData = data.map(user => ({
        name: user.nombre,
        progreso: user.progresoPromedio || 0,
        cursos: user.totalCursos || 0
    })).sort((a, b) => b.progreso - a.progreso); // Ordenar por progreso descendente

    const getBarColor = (progreso) => {
        if (progreso >= 80) return '#10b981'; // Verde
        if (progreso >= 50) return '#3b82f6'; // Azul
        if (progreso >= 30) return '#f59e0b'; // Amarillo
        return '#ef4444'; // Rojo
    };

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-small)',
                    padding: '0.75rem',
                    boxShadow: 'var(--shadow-medium)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {data.name}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: getBarColor(data.progreso) }}>
                        Progreso: {data.progreso.toFixed(1)}%
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        {data.cursos} curso{data.cursos !== 1 ? 's' : ''}
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!data || data.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '400px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
            }}>
                📊 No hay datos de progreso disponibles
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={Math.max(300, chartData.length * 60)}>
            <BarChart
                data={chartData}
                layout="vertical"
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
            >
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis
                    type="number"
                    domain={[0, 100]}
                    tick={{ fill: 'var(--text-secondary)', fontSize: 12 }}
                    label={{ value: 'Progreso (%)', position: 'insideBottom', offset: -5, fill: 'var(--text-primary)' }}
                />
                <YAxis
                    type="category"
                    dataKey="name"
                    tick={{ fill: 'var(--text-primary)', fontSize: 11 }}
                    width={150}
                />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(59, 130, 246, 0.1)' }} />
                <Bar
                    dataKey="progreso"
                    radius={[0, 8, 8, 0]}
                    animationBegin={0}
                    animationDuration={800}
                    barSize={35}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={getBarColor(entry.progreso)} />
                    ))}
                </Bar>
            </BarChart>
        </ResponsiveContainer>
    );
};

export default ProgressChart;

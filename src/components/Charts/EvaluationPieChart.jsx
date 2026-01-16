import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = {
    aprobado: '#10b981',   // Verde
    reprobado: '#ef4444',  // Rojo
    pendiente: '#f59e0b'   // Amarillo
};

const EvaluationPieChart = ({ data }) => {
    // Transformar datos para el PieChart
    const chartData = [
        { name: 'Aprobados', value: data.aprobado || 0, color: COLORS.aprobado },
        { name: 'Reprobados', value: data.reprobado || 0, color: COLORS.reprobado },
        { name: 'Pendientes', value: data.pendiente || 0, color: COLORS.pendiente }
    ].filter(item => item.value > 0); // Solo mostrar categorías con datos

    const total = chartData.reduce((sum, item) => sum + item.value, 0);

    const CustomTooltip = ({ active, payload }) => {
        if (active && payload && payload.length) {
            const data = payload[0];
            const percentage = ((data.value / total) * 100).toFixed(1);
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-small)',
                    padding: '0.75rem',
                    boxShadow: 'var(--shadow-medium)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: data.payload.color }}>
                        {data.name}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-primary)' }}>
                        {data.value} evaluaciones ({percentage}%)
                    </p>
                </div>
            );
        }
        return null;
    };

    const renderCustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
        const RADIAN = Math.PI / 180;
        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
        const x = cx + radius * Math.cos(-midAngle * RADIAN);
        const y = cy + radius * Math.sin(-midAngle * RADIAN);

        return (
            <text
                x={x}
                y={y}
                fill="white"
                textAnchor={x > cx ? 'start' : 'end'}
                dominantBaseline="central"
                style={{ fontSize: '0.9rem', fontWeight: 'bold', textShadow: '0 1px 3px rgba(0,0,0,0.3)' }}
            >
                {`${(percent * 100).toFixed(0)}%`}
            </text>
        );
    };

    if (total === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '300px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
            }}>
                📊 No hay datos de evaluaciones disponibles
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={300}>
            <PieChart>
                <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={renderCustomLabel}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                    animationBegin={0}
                    animationDuration={800}
                >
                    {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="bottom"
                    height={36}
                    iconType="circle"
                    formatter={(value, entry) => (
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {value}: {entry.payload.value}
                        </span>
                    )}
                />
            </PieChart>
        </ResponsiveContainer>
    );
};

export default EvaluationPieChart;

import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const CourseCompletionChart = ({ data }) => {
    // Transformar datos por cargo
    const chartData = Object.entries(data).map(([cargo, stats]) => ({
        cargo: cargo,
        completados: stats.completados || 0,
        pendientes: stats.pendientes || 0,
        total: (stats.completados || 0) + (stats.pendientes || 0)
    }));

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            const total = payload[0].payload.total;
            return (
                <div style={{
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-primary)',
                    borderRadius: 'var(--radius-small)',
                    padding: '0.75rem',
                    boxShadow: 'var(--shadow-medium)'
                }}>
                    <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)' }}>
                        {label}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#10b981' }}>
                        ✅ Completados: {payload[0].value}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: '#f59e0b' }}>
                        ⏳ Pendientes: {payload[1].value}
                    </p>
                    <p style={{ margin: '0.25rem 0 0 0', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                        Total: {total} cursos
                    </p>
                </div>
            );
        }
        return null;
    };

    if (!chartData || chartData.length === 0) {
        return (
            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '350px',
                color: 'var(--text-secondary)',
                fontSize: '1rem'
            }}>
                📊 No hay datos de cursos por cargo disponibles
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={350}>
            <AreaChart
                data={chartData}
                margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
            >
                <defs>
                    <linearGradient id="colorCompletados" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                    <linearGradient id="colorPendientes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border-secondary)" />
                <XAxis
                    dataKey="cargo"
                    tick={{ fill: 'var(--text-primary)', fontSize: 12 }}
                    angle={-15}
                    textAnchor="end"
                    height={60}
                />
                <YAxis tick={{ fill: 'var(--text-secondary)', fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                    verticalAlign="top"
                    height={36}
                    iconType="circle"
                    formatter={(value) => (
                        <span style={{ color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            {value}
                        </span>
                    )}
                />
                <Area
                    type="monotone"
                    dataKey="completados"
                    name="Completados"
                    stroke="#10b981"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorCompletados)"
                    animationBegin={0}
                    animationDuration={800}
                />
                <Area
                    type="monotone"
                    dataKey="pendientes"
                    name="Pendientes"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fillOpacity={1}
                    fill="url(#colorPendientes)"
                    animationBegin={200}
                    animationDuration={800}
                />
            </AreaChart>
        </ResponsiveContainer>
    );
};

export default CourseCompletionChart;

import React from 'react';
import { FaHourglassHalf, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const VerificationStatus = ({ status, text }) => {
    const getStatusConfig = () => {
        switch (status?.toLowerCase()) {
            case 'pendiente':
                return {
                    icon: <FaHourglassHalf />,
                    color: '#f39c12',
                    bgColor: 'rgba(243, 156, 18, 0.1)',
                    label: text || 'Pendiente'
                };
            case 'aprobada':
            case 'completado':
            case 'verde':
                return {
                    icon: <FaCheckCircle />,
                    color: '#27ae60',
                    bgColor: 'rgba(39, 174, 96, 0.1)',
                    label: text || 'Aprobada'
                };
            case 'rechazada':
            case 'reprobado':
            case 'rojo':
                return {
                    icon: <FaTimesCircle />,
                    color: '#e74c3c',
                    bgColor: 'rgba(231, 76, 60, 0.1)',
                    label: text || 'Rechazada'
                };
            default:
                return {
                    icon: <FaHourglassHalf />,
                    color: '#95a5a6',
                    bgColor: 'rgba(149, 165, 166, 0.1)',
                    label: text || 'N/A'
                };
        }
    };

    const config = getStatusConfig();

    return (
        <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '0.85rem',
            fontWeight: '600',
            color: config.color,
            backgroundColor: config.bgColor,
            border: `1px solid ${config.color}33`
        }}>
            {config.icon}
            <span>{config.label}</span>
        </div>
    );
};

export default VerificationStatus;

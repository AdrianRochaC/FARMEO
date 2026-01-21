import React, { useState, useEffect } from 'react';
import { FaHistory, FaFileAlt, FaVideo, FaImage, FaTrash, FaEye } from 'react-icons/fa';
import Modal from './Modal';
import VerificationStatus from './VerificationStatus';
import DocPreviewModal from './DocPreviewModal';
import { BACKEND_URL } from '../utils/api';

const MyRequestsModal = ({ isOpen, onClose }) => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [previewFile, setPreviewFile] = useState({ open: false, url: '', name: '' });

    useEffect(() => {
        if (isOpen) {
            fetchMyRequests();
        }
    }, [isOpen]);

    const fetchMyRequests = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${BACKEND_URL}/api/my-solicitudes`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                setRequests(data.solicitudes || []);
            }
        } catch (error) {
            console.error('Error fetching requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const deleteRequest = async (id) => {
        if (!confirm('¿Estás seguro de que quieres eliminar esta solicitud?')) return;
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`${BACKEND_URL}/api/solicitudes/${id}`, {
                method: 'DELETE',
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await response.json();
            if (data.success) {
                fetchMyRequests();
            } else {
                alert(data.message);
            }
        } catch (error) {
            alert('Error al eliminar');
        }
    };

    const getIcon = (tipo) => {
        switch (tipo?.toLowerCase()) {
            case 'foto': return <FaImage style={{ color: '#3498db' }} />;
            case 'video': return <FaVideo style={{ color: '#e67e22' }} />;
            case 'documento': return <FaFileAlt style={{ color: '#9b59b6' }} />;
            default: return <FaFileAlt />;
        }
    };

    const handlePreview = (url, name) => {
        setPreviewFile({ open: true, url: url || '', name: name || 'Archivo' });
    };

    return (
        <>
            <Modal isOpen={isOpen} onClose={onClose}>
                <div className="modal-header" style={{ borderBottom: '1px solid var(--border-primary)', paddingBottom: '15px', marginBottom: '15px' }}>
                    <h2 style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: 0, color: 'var(--text-primary)' }}>
                        <FaHistory style={{ color: '#9b59b6' }} /> Mis Solicitudes
                    </h2>
                </div>
                <div className="modal-content" style={{ minWidth: '850px', maxHeight: '78vh', overflowY: 'auto', padding: '15px 5px' }}>
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-secondary)' }}>
                            <div className="loader-mini" style={{ marginBottom: '10px' }}></div>
                            Cargando solicitudes...
                        </div>
                    ) : requests.length === 0 ? (
                        <div style={{ textAlign: 'center', padding: '3rem', opacity: 0.6, color: 'var(--text-secondary)' }}>
                            No tienes solicitudes recientes.
                        </div>
                    ) : (
                        <div className="requests-table-container">
                            <table style={{ width: '100%', borderCollapse: 'separate', borderSpacing: '0 8px' }}>
                                <thead>
                                    <tr style={{ textAlign: 'left', color: 'var(--text-secondary)', fontSize: '0.9rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
                                        <th style={{ padding: '12px', fontWeight: '600' }}>Contenido</th>
                                        <th style={{ padding: '12px', fontWeight: '600' }}>Detalles</th>
                                        <th style={{ padding: '12px', fontWeight: '600', textAlign: 'center' }}>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {requests.map(req => (
                                        <tr key={req.id} style={{ background: 'rgba(255,255,255,0.03)', borderRadius: '12px', transition: 'transform 0.2s' }}>
                                            <td style={{ padding: '15px', borderTopLeftRadius: '12px', borderBottomLeftRadius: '12px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                                                    <div style={{
                                                        width: '40px',
                                                        height: '40px',
                                                        borderRadius: '10px',
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        justifyContent: 'center',
                                                        background: 'rgba(255,255,255,0.05)',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        {getIcon(req.tipo_contenido)}
                                                    </div>
                                                    <div>
                                                        <span style={{ display: 'block', fontWeight: '600', textTransform: 'capitalize', color: 'var(--text-primary)' }}>
                                                            {req.tipo_contenido}
                                                        </span>
                                                        <small style={{ color: 'var(--text-secondary)', fontSize: '0.75rem' }}>
                                                            ID: #{req.id}
                                                        </small>
                                                    </div>
                                                </div>
                                            </td>
                                            <td style={{ padding: '15px' }}>
                                                <div style={{
                                                    maxWidth: '280px',
                                                    overflow: 'hidden',
                                                    textOverflow: 'ellipsis',
                                                    whiteSpace: 'nowrap',
                                                    fontWeight: '500',
                                                    color: 'var(--text-primary)'
                                                }} title={req.archivo_nombre}>
                                                    {req.archivo_nombre}
                                                </div>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '4px' }}>
                                                    <small style={{ color: 'var(--text-secondary)', fontSize: '0.8rem' }}>
                                                        Fecha: {new Date(req.created_at).toLocaleDateString()}
                                                    </small>
                                                    {req.archivo_url && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                handlePreview(req.archivo_url, req.archivo_nombre);
                                                            }}
                                                            style={{
                                                                background: 'none',
                                                                border: 'none',
                                                                color: 'var(--primary-color)',
                                                                fontSize: '0.8rem',
                                                                display: 'flex',
                                                                alignItems: 'center',
                                                                gap: '4px',
                                                                cursor: 'pointer',
                                                                padding: 0
                                                            }}
                                                        >
                                                            Ver <FaEye size={12} />
                                                        </button>
                                                    )}
                                                </div>
                                                {req.estado === 'rechazada' && req.comentario_aprobacion && (
                                                    <div style={{
                                                        marginTop: '8px',
                                                        padding: '8px 12px',
                                                        background: 'rgba(231, 76, 60, 0.1)',
                                                        borderRadius: '8px',
                                                        fontSize: '0.8rem',
                                                        color: '#e74c3c',
                                                        borderLeft: '3px solid #e74c3c'
                                                    }}>
                                                        <strong>Motivo:</strong> {req.comentario_aprobacion}
                                                    </div>
                                                )}
                                            </td>
                                            <td style={{ padding: '15px', textAlign: 'center', borderTopRightRadius: '12px', borderBottomRightRadius: '12px' }}>
                                                <VerificationStatus status={req.estado} />
                                                {req.estado === 'pendiente' && (
                                                    <button
                                                        onClick={() => deleteRequest(req.id)}
                                                        style={{
                                                            marginLeft: '10px',
                                                            background: 'none',
                                                            border: 'none',
                                                            color: 'var(--danger-color)',
                                                            cursor: 'pointer',
                                                            verticalAlign: 'middle',
                                                            opacity: 0.7
                                                        }}
                                                        title="Cancelar solicitud"
                                                    >
                                                        <FaTrash size={14} />
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </Modal>

            <DocPreviewModal
                isOpen={previewFile.open}
                onClose={() => setPreviewFile({ ...previewFile, open: false })}
                fileUrl={previewFile.url}
                fileName={previewFile.name}
            />
        </>
    );
};

export default MyRequestsModal;

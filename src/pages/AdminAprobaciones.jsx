import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaFileAlt, FaVideo, FaImage, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import Modal from '../components/Modal';
import './AdminAprobaciones.css';
import { BACKEND_URL } from '../utils/api';

const API_URL = BACKEND_URL;

const AdminAprobaciones = () => {
  const [solicitudes, setSolicitudes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSolicitud, setSelectedSolicitud] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [filtro, setFiltro] = useState('todos'); // 'todos', 'pendientes', 'aprobadas', 'rechazadas'
  const [tipoFiltro, setTipoFiltro] = useState('todos'); // 'todos', 'bitacora', 'curso', 'documento'

  useEffect(() => {
    fetchSolicitudes();
  }, [filtro, tipoFiltro]);

  const fetchSolicitudes = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();
      if (filtro !== 'todos') params.append('estado', filtro);
      if (tipoFiltro !== 'todos') params.append('tipo', tipoFiltro);

      const response = await fetch(`${API_URL}/api/aprobaciones?${params.toString()}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setSolicitudes(data.solicitudes || []);
      } else {
        const errorData = await response.json().catch(() => ({}));
        console.error('Error cargando solicitudes:', errorData);
        alert(`Error al cargar solicitudes: ${errorData.message || response.statusText}`);
      }
    } catch (error) {
      alert('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const aprobarSolicitud = async (id, comentario = '') => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/aprobaciones/${id}/aprobar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comentario })
      });

      if (response.ok) {
        alert('✅ Solicitud aprobada');
        fetchSolicitudes();
        if (modalOpen) setModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message || 'No se pudo aprobar'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    }
  };

  const rechazarSolicitud = async (id, comentario = '') => {
    if (!comentario.trim()) {
      const coment = prompt('Ingresa un comentario explicando el rechazo:');
      if (!coment || !coment.trim()) {
        alert('Debes ingresar un comentario para rechazar');
        return;
      }
      comentario = coment;
    }

    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`${API_URL}/api/aprobaciones/${id}/rechazar`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ comentario })
      });

      if (response.ok) {
        alert('❌ Solicitud rechazada');
        fetchSolicitudes();
        if (modalOpen) setModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`❌ Error: ${errorData.message || 'No se pudo rechazar'}`);
      }
    } catch (error) {
      alert('❌ Error de conexión');
    }
  };

  const openDetailModal = (solicitud) => {
    setSelectedSolicitud(solicitud);
    setModalOpen(true);
  };

  const getTipoIcon = (tipo) => {
    switch (tipo) {
      case 'foto':
        return <FaImage />;
      case 'video':
        return <FaVideo />;
      case 'documento':
        return <FaFileAlt />;
      default:
        return <FaFileAlt />;
    }
  };

  const getEstadoBadge = (estado) => {
    switch (estado) {
      case 'pendiente':
        return <span className="badge badge-pendiente"><FaClock /> Pendiente</span>;
      case 'aprobada':
        return <span className="badge badge-aprobada"><FaCheckCircle /> Aprobada</span>;
      case 'rechazada':
        return <span className="badge badge-rechazada"><FaTimesCircle /> Rechazada</span>;
      default:
        return <span className="badge">{estado}</span>;
    }
  };

  const getTipoContenido = (solicitud) => {
    if (solicitud.tipo_contenido) return solicitud.tipo_contenido;
    if (solicitud.contexto === 'bitacora') return 'foto';
    if (solicitud.contexto === 'curso') return 'documento';
    if (solicitud.contexto === 'documento') return 'documento';
    return 'documento';
  };

  if (loading) {
    return (
      <div className="admin-aprobaciones-container">
        <div className="loading">Cargando solicitudes...</div>
      </div>
    );
  }

  return (
    <div className="admin-aprobaciones-container">
      <div className="admin-aprobaciones-header">
        <h1>🔐 Panel de Aprobaciones</h1>
        <p>Gestiona las solicitudes de carga de evidencias, cursos y documentos</p>
      </div>

      <div className="filtros-container">
        <div className="filtro-group">
          <label>Estado:</label>
          <select value={filtro} onChange={(e) => setFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="pendiente">Pendientes</option>
            <option value="aprobada">Aprobadas</option>
            <option value="rechazada">Rechazadas</option>
          </select>
        </div>
        <div className="filtro-group">
          <label>Tipo:</label>
          <select value={tipoFiltro} onChange={(e) => setTipoFiltro(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="bitacora">Bitácora</option>
            <option value="curso">Cursos</option>
            <option value="documento">Documentos</option>
          </select>
        </div>
      </div>

      <div className="solicitudes-grid">
        {solicitudes.length === 0 ? (
          <div className="no-solicitudes">
            <p>No hay solicitudes {filtro !== 'todos' ? `en estado "${filtro}"` : ''}</p>
          </div>
        ) : (
          solicitudes.map((solicitud) => (
            <div key={solicitud.id} className="solicitud-card">
              <div className="solicitud-header">
                <div className="solicitud-tipo">
                  {getTipoIcon(getTipoContenido(solicitud))}
                  <span className="tipo-text">{solicitud.contexto || 'General'}</span>
                </div>
                {getEstadoBadge(solicitud.estado)}
              </div>

              <div className="solicitud-body">
                <div className="solicitud-info">
                  <p className="solicitud-usuario">
                    <strong>Usuario:</strong> {solicitud.usuario_nombre || 'N/A'}
                  </p>
                  <p className="solicitud-fecha">
                    <strong>Fecha:</strong> {new Date(solicitud.created_at).toLocaleString('es-CO')}
                  </p>
                  {solicitud.descripcion && (
                    <p className="solicitud-descripcion">
                      <strong>Descripción:</strong> {solicitud.descripcion}
                    </p>
                  )}
                </div>

                {solicitud.archivo_url && (
                  <div className="solicitud-preview">
                    {getTipoContenido(solicitud) === 'foto' || getTipoContenido(solicitud) === 'video' ? (
                      <img 
                        src={solicitud.archivo_url} 
                        alt="Preview" 
                        className="preview-image"
                        onClick={() => openDetailModal(solicitud)}
                      />
                    ) : (
                      <div className="preview-documento" onClick={() => openDetailModal(solicitud)}>
                        <FaFileAlt size={40} />
                        <span>{solicitud.archivo_nombre || 'Documento'}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="solicitud-footer">
                {solicitud.estado === 'pendiente' && (
                  <div className="solicitud-actions">
                    <button
                      className="btn-aprobar"
                      onClick={() => aprobarSolicitud(solicitud.id)}
                    >
                      <FaCheck /> Aprobar
                    </button>
                    <button
                      className="btn-rechazar"
                      onClick={() => rechazarSolicitud(solicitud.id)}
                    >
                      <FaTimes /> Rechazar
                    </button>
                    <button
                      className="btn-ver"
                      onClick={() => openDetailModal(solicitud)}
                    >
                      <FaEye /> Ver Detalles
                    </button>
                  </div>
                )}
                {solicitud.estado !== 'pendiente' && (
                  <div className="solicitud-info-aprobacion">
                    <p>
                      <strong>{solicitud.estado === 'aprobada' ? 'Aprobada' : 'Rechazada'} por:</strong>{' '}
                      {solicitud.aprobador_nombre || 'N/A'}
                    </p>
                    {solicitud.comentario_aprobacion && (
                      <p className="comentario-aprobacion">
                        <strong>Comentario:</strong> {solicitud.comentario_aprobacion}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal de Detalles */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)}>
        {selectedSolicitud && (
          <div className="solicitud-detail-modal">
            <div className="modal-header">
              <h2>Detalles de la Solicitud</h2>
            </div>
            <div className="modal-content">
              <div className="detail-section">
                <h3>Información General</h3>
                <p><strong>Usuario:</strong> {selectedSolicitud.usuario_nombre}</p>
                <p><strong>Contexto:</strong> {selectedSolicitud.contexto || 'General'}</p>
                <p><strong>Tipo:</strong> {getTipoContenido(selectedSolicitud)}</p>
                <p><strong>Estado:</strong> {getEstadoBadge(selectedSolicitud.estado)}</p>
                <p><strong>Fecha de solicitud:</strong> {new Date(selectedSolicitud.created_at).toLocaleString('es-CO')}</p>
              </div>

              {selectedSolicitud.descripcion && (
                <div className="detail-section">
                  <h3>Descripción</h3>
                  <p>{selectedSolicitud.descripcion}</p>
                </div>
              )}

              {selectedSolicitud.archivo_url && (
                <div className="detail-section">
                  <h3>Archivo</h3>
                  {getTipoContenido(selectedSolicitud) === 'foto' ? (
                    <img src={selectedSolicitud.archivo_url} alt="Evidencia" className="detail-image" />
                  ) : getTipoContenido(selectedSolicitud) === 'video' ? (
                    <video src={selectedSolicitud.archivo_url} controls className="detail-video" />
                  ) : (
                    <div className="detail-documento">
                      <FaFileAlt size={60} />
                      <a href={selectedSolicitud.archivo_url} target="_blank" rel="noopener noreferrer">
                        {selectedSolicitud.archivo_nombre || 'Ver documento'}
                      </a>
                    </div>
                  )}
                </div>
              )}

              {selectedSolicitud.estado === 'pendiente' && (
                <div className="detail-actions">
                  <button
                    className="btn-aprobar"
                    onClick={() => aprobarSolicitud(selectedSolicitud.id)}
                  >
                    <FaCheck /> Aprobar
                  </button>
                  <button
                    className="btn-rechazar"
                    onClick={() => rechazarSolicitud(selectedSolicitud.id)}
                  >
                    <FaTimes /> Rechazar
                  </button>
                </div>
              )}

              {selectedSolicitud.estado !== 'pendiente' && (
                <div className="detail-section">
                  <h3>Información de Aprobación</h3>
                  <p><strong>Aprobado por:</strong> {selectedSolicitud.aprobador_nombre || 'N/A'}</p>
                  <p><strong>Fecha:</strong> {selectedSolicitud.fecha_aprobacion ? new Date(selectedSolicitud.fecha_aprobacion).toLocaleString('es-CO') : 'N/A'}</p>
                  {selectedSolicitud.comentario_aprobacion && (
                    <p><strong>Comentario:</strong> {selectedSolicitud.comentario_aprobacion}</p>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default AdminAprobaciones;

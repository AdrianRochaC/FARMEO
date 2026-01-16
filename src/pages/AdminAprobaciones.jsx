import React, { useState, useEffect } from 'react';
import { FaCheck, FaTimes, FaEye, FaFileAlt, FaVideo, FaImage, FaClock, FaCheckCircle, FaTimesCircle, FaGlobe, FaUserShield, FaUser, FaInfoCircle } from 'react-icons/fa';
import Modal from '../components/Modal';
import './AdminAprobaciones.css';
import { BACKEND_URL } from '../utils/api';

const API_URL = BACKEND_URL;

const ParsedDescription = ({ description }) => {
  if (!description) return null;

  try {
    // Intentar separar el texto plano de los datos JSON
    // Formato esperado: "Documento: ... - Global: ... | DATOS: {...}"
    const parts = description.split('| DATOS:');
    const mainText = parts[0] || '';
    const jsonStr = parts[1] || '{}';

    // Parsear metadatos del texto plano
    const metaItems = mainText.split(' - ').map(item => item.trim()).filter(Boolean);

    // Parsear JSON
    let jsonData = {};
    try {
      jsonData = JSON.parse(jsonStr);
    } catch (e) {
      console.warn('Error parsing JSON details', e);
    }

    // Extraer valores específicos para mostrar mejor
    const documento = metaItems.find(i => i.startsWith('Documento:'))?.replace('Documento:', '').trim();
    const isGlobal = metaItems.find(i => i.includes('Global: true'));
    const roles = metaItems.find(i => i.startsWith('Roles:'))?.replace('Roles:', '').trim();
    let cleanRoles = roles && roles !== '[]' ? roles : null;

    // Limpiar roles si vienen con formato ["Rol"] o [Rol]
    if (cleanRoles) {
      if (cleanRoles.startsWith('["') && cleanRoles.endsWith('"]')) {
        cleanRoles = cleanRoles.slice(2, -2);
      } else if (cleanRoles.startsWith('[') && cleanRoles.endsWith(']')) {
        cleanRoles = cleanRoles.slice(1, -1);
      }
      cleanRoles = cleanRoles.replace(/"/g, '');
    }

    // Formatear tamaño de archivo si existe
    const formatSize = (bytes) => {
      if (!bytes) return '';
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(1024));
      return `${parseFloat((bytes / Math.pow(1024, i)).toFixed(2))} ${sizes[i]}`;
    };

    return (
      <div className="parsed-description">
        {/* Chips de Categorías */}
        <div className="description-tags">
          {isGlobal && (
            <span className="tag tag-global">
              <FaGlobe /> Global
            </span>
          )}
          {cleanRoles && (
            <span className="tag tag-roles">
              <FaUserShield /> {cleanRoles}
            </span>
          )}
        </div>

        {/* Información Principal Resaltada */}
        {documento && (
          <div className="description-main-item">
            <strong>Documento/Referencia:</strong> {documento}
          </div>
        )}

        {/* Detalles Técnicos en Grid */}
        {jsonData && Object.keys(jsonData).length > 0 && (
          <div className="description-details-grid">
            {jsonData.size && (
              <div className="detail-item">
                <span className="detail-label">Tamaño</span>
                <span className="detail-value">{formatSize(jsonData.size)}</span>
              </div>
            )}
            {jsonData.mimetype && (
              <div className="detail-item">
                <span className="detail-label">Tipo</span>
                <span className="detail-value">{jsonData.mimetype}</span>
              </div>
            )}
            {jsonData.roles && jsonData.roles.length > 0 && jsonData.roles !== "[]" && ( // Evitar duplicar si ya lo mostramos arriba o si está vacío
              <div className="detail-item full-width">
                <span className="detail-label">Roles Asignados</span>
                <span className="detail-value-list">
                  {(() => {
                    let rolesToDisplay = jsonData.roles;
                    // Si es string que parece array, limpiarlo
                    if (typeof rolesToDisplay === 'string') {
                      if (rolesToDisplay.startsWith('["')) rolesToDisplay = rolesToDisplay.slice(2, -2);
                      else if (rolesToDisplay.startsWith('[')) rolesToDisplay = rolesToDisplay.slice(1, -1);
                      rolesToDisplay = rolesToDisplay.replace(/"/g, '');
                    } else if (Array.isArray(rolesToDisplay)) {
                      rolesToDisplay = rolesToDisplay.join(', ');
                    }
                    return rolesToDisplay;
                  })()}
                </span>
              </div>
            )}
            {jsonData.name && jsonData.name !== documento && ( // Mostrar nombre real si difiere del documento
              <div className="detail-item full-width">
                <span className="detail-label">Nombre Archivo</span>
                <span className="detail-value">{jsonData.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    );
  } catch (err) {
    // Fallback si falla el parseo
    return <p className="solicitud-descripcion">{description}</p>;
  }
};

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

  const handleDownload = async (url, fileName) => {
    try {
      if (url && url.startsWith('http')) {
        // Intentar descarga como blob primero (mejor para forzar descarga)
        const response = await fetch(url);
        if (!response.ok) throw new Error('Error al descargar');

        const blob = await response.blob();
        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = fileName || 'documento';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else {
        window.open(url, '_blank');
      }
    } catch (e) {
      console.error('Download failed, using fallback', e);
      window.open(url, '_blank');
    }
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
        <h1>Panel de Aprobaciones</h1>
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
                    <div className="solicitud-descripcion-container">
                      <ParsedDescription description={solicitud.descripcion} />
                    </div>
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
                    {solicitud.estado !== 'pendiente' && (
                      <button
                        className="btn-ver full-width-btn"
                        onClick={() => openDetailModal(solicitud)}
                        style={{ width: '100%', marginTop: '0.5rem' }}
                      >
                        <FaEye /> Ver Detalles
                      </button>
                    )}
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
                  <h3>Descripción y Metadatos</h3>
                  <ParsedDescription description={selectedSolicitud.descripcion} />
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
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', alignItems: 'center' }}>
                        <span style={{ fontWeight: 600 }}>{selectedSolicitud.archivo_nombre || 'Documento'}</span>
                        <button
                          onClick={() => handleDownload(selectedSolicitud.archivo_url, selectedSolicitud.archivo_nombre)}
                          className="btn-ver"
                          style={{ padding: '8px 16px', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FaFileAlt /> Descargar Archivo
                        </button>
                      </div>
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

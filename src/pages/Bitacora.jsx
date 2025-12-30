import React, { useEffect, useState } from "react";
import { BACKEND_URL } from "../utils/api";
import "./Bitacora.css";
import { FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCalendarWeek, FaCalendarDay } from "react-icons/fa";

const Bitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month", "week", "day"
  const [selectedTarea, setSelectedTarea] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState(null); // { url: string, type: 'img' | 'pdf' }

  const token = localStorage.getItem("authToken");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bitacora`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setTareas(data.tareas || []);
      } else {
        alert("❌ Error al obtener las tareas");
      }
    } catch (error) {
      alert("❌ No se pudo cargar la bitácora.");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsuarios = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) {
        setUsuarios(data.users || []);
      }
    } catch (error) {
      console.error('Error cargando usuarios');
    }
  };

  const subirEvidencia = async (tareaId, file) => {
    if (!file) return;
    const formData = new FormData();
    formData.append("evidence", file);

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/bitacora/${tareaId}/evidence`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });
      const data = await response.json();
      if (data.success) {
        alert(`✅ ${data.estado === 'amarillo' ? 'Inicio de Tarea registrado' : 'Cierre de Tarea registrado'}`);
        // Actualizar la tarea seleccionada en el modal para ver los cambios
        if (selectedTarea && selectedTarea.id === tareaId) {
          setSelectedTarea({
            ...selectedTarea,
            estado: data.estado,
            evidencia_inicial_url: data.estado === 'amarillo' ? data.url : selectedTarea.evidencia_inicial_url,
            evidencia_final_url: data.estado === 'verde' ? data.url : selectedTarea.evidencia_final_url,
            evidencia_inicial_fecha: data.estado === 'amarillo' ? data.fecha : selectedTarea.evidencia_inicial_fecha,
            evidencia_final_fecha: data.estado === 'verde' ? data.fecha : selectedTarea.evidencia_final_fecha
          });
        }
        fetchTareas();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Error al subir la evidencia");
    } finally {
      setLoading(false);
    }
  };

  const eliminarEvidencia = async (tareaId, type) => {
    if (!confirm(`¿Estás seguro de eliminar el archivo de ${type === 'inicio' ? 'inicio' : 'cierre'}? El estado de la tarea retrocederá.`)) return;

    try {
      setLoading(true);
      const response = await fetch(`${BACKEND_URL}/api/bitacora/${tareaId}/evidence/${type}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await response.json();
      if (data.success) {
        alert("✅ Evidencia eliminada correctamente");
        if (selectedTarea && selectedTarea.id === tareaId) {
          setSelectedTarea({
            ...selectedTarea,
            estado: data.nuevoEstado,
            [type === 'inicio' ? 'evidencia_inicial_url' : 'evidencia_final_url']: null,
            [type === 'inicio' ? 'evidencia_inicial_fecha' : 'evidencia_final_fecha']: null
          });
        }
        fetchTareas();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Error al eliminar la evidencia");
    } finally {
      setLoading(false);
    }
  };

  const openTracking = (tarea) => {
    setSelectedTarea(tarea);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedTarea(null);
  };

  const cambiarEstado = async (tareaId, nuevoEstado) => {
    const tareaOriginal = tareas.find(t => t.id === tareaId);
    if (!tareaOriginal) return;

    try {
      const response = await fetch(`${BACKEND_URL}/api/bitacora/${tareaId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...tareaOriginal, estado: nuevoEstado }),
      });
      const data = await response.json();
      if (data.success) {
        fetchTareas();
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Error de red al actualizar estado");
    }
  };

  useEffect(() => {
    fetchTareas();
    fetchUsuarios();
  }, []);

  // Lógica de navegación
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") {
      newDate.setMonth(newDate.getMonth() + direction);
    } else if (viewMode === "week") {
      newDate.setDate(newDate.getDate() + direction * 7);
    } else {
      newDate.setDate(newDate.getDate() + direction);
    }
    setCurrentDate(newDate);
  };

  const monthNames = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  // Filtrar tareas asignadas al usuario actual
  const tareasAsignadas = tareas.filter((t) => {
    try {
      const asignados = JSON.parse(t.asignados || "[]");
      return asignados.includes(user.id);
    } catch (e) {
      return false;
    }
  });

  const isSameDay = (d1, d2) => {
    return d1.getUTCDate() === d2.getUTCDate() &&
      d1.getUTCMonth() === d2.getUTCMonth() &&
      d1.getUTCFullYear() === d2.getUTCFullYear();
  };

  const formatFechaEvidencia = (fechaStr) => {
    if (!fechaStr) return "N/A";
    const f = new Date(fechaStr);
    return f.toLocaleString('es-ES', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }) + " hs";
  };

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) {
      cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);
    }

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const tareasDia = tareasAsignadas.filter(t => isSameDay(new Date(t.deadline), date));
      const isToday = isSameDay(new Date(), date);

      cells.push(
        <div
          key={d}
          className={`calendar-day ${isToday ? 'today' : ''}`}
          onClick={() => { setViewMode("day"); setCurrentDate(date); }}
        >
          <span className="day-number">{d}</span>
          <div className="day-events">
            {tareasDia.map(tarea => (
              <div key={tarea.id} className={`calendar-event status-${tarea.estado}`}>
                <div className="event-dot"></div>
                <span className="event-title">{tarea.titulo}</span>
              </div>
            ))}
          </div>
        </div>
      );
    }
    return (
      <div className="calendar-grid month">
        {dayNames.map(d => <div key={d} className="calendar-day-name">{d}</div>)}
        {cells}
      </div>
    );
  };

  const renderWeekView = () => {
    // Calcular inicio de semana (Domingo)
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay());

    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const date = new Date(startOfWeek);
      date.setDate(startOfWeek.getDate() + i);
      weekDays.push(date);
    }

    return (
      <div className="calendar-week-view">
        {weekDays.map(date => {
          const tareasDia = tareasAsignadas.filter(t => isSameDay(new Date(t.deadline), date));
          const isToday = isSameDay(new Date(), date);
          return (
            <div
              key={date.toString()}
              className={`week-day-col ${isToday ? 'today' : ''}`}
              onClick={() => { setViewMode("day"); setCurrentDate(date); }}
            >
              <div className="week-day-header">
                <span className="day-name">{dayNames[date.getDay()]}</span>
                <span className="day-num">{date.getDate()}</span>
              </div>
              <div className="week-day-events">
                {tareasDia.map(tarea => (
                  <div key={tarea.id} className={`calendar-event-card status-${tarea.estado}`}>
                    <h5>{tarea.titulo}</h5>
                    <p>{tarea.descripcion}</p>
                    {user.rol === 'Admin' ? (
                      <select
                        value={tarea.estado}
                        onChange={(e) => { e.stopPropagation(); cambiarEstado(tarea.id, e.target.value); }}
                      >
                        <option value="rojo">🔴 Pendiente</option>
                        <option value="amarillo">🟡 En Progreso</option>
                        <option value="verde">🟢 Completado</option>
                      </select>
                    ) : (
                      <div className="status-badge-mini">
                        {tarea.estado === 'rojo' && '🔴 Pendiente'}
                        {tarea.estado === 'amarillo' && '🟡 En Progreso'}
                        {tarea.estado === 'verde' && 'Green 🟢 Completado'}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const renderDayView = () => {
    const tareasDia = tareasAsignadas.filter(t => isSameDay(new Date(t.deadline), currentDate));
    return (
      <div className="calendar-day-view">
        <div className="day-view-header">
          <h3>{dayNames[currentDate.getDay()]}, {currentDate.getDate()} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
        </div>
        <div className="day-tasks-list">
          {tareasDia.length === 0 ? (
            <p className="no-tasks-msg">No hay tareas para este día.</p>
          ) : (
            tareasDia.map(tarea => (
              <div key={tarea.id} className={`day-task-detail status-${tarea.estado}`}>
                <div className="task-main-info">
                  <h4>{tarea.titulo}</h4>
                  <p>{tarea.descripcion}</p>
                </div>
                <div className="task-status-control">
                  {user.rol === 'Admin' ? (
                    <select
                      value={tarea.estado}
                      onChange={(e) => cambiarEstado(tarea.id, e.target.value)}
                      className="status-select-large"
                    >
                      <option value="rojo">🔴 Pendiente</option>
                      <option value="amarillo">🟡 En Progreso</option>
                      <option value="verde">🟢 Completado</option>
                    </select>
                  ) : (
                    <div className="status-display">
                      <span className={`status-badge ${tarea.estado}`}>
                        {tarea.estado === 'rojo' && '🔴 Pendiente'}
                        {tarea.estado === 'amarillo' && '🟡 En Proceso'}
                        {tarea.estado === 'verde' && '🟢 Completado'}
                      </span>
                    </div>
                  )}
                </div>
                {!user.rol || user.rol !== 'Admin' ? (
                  <div className="tracking-control">
                    <button className="btn-open-tracking" onClick={() => openTracking(tarea)}>
                      🔍 Ver Seguimiento
                    </button>
                  </div>
                ) : null}
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  const renderTrackingModal = () => {
    if (!selectedTarea) return null;

    const currentStatus = selectedTarea.estado;
    const isCompleted = currentStatus === 'verde';
    const isInProgress = currentStatus === 'amarillo';

    return (
      <div className="modal-overlay" onClick={closeModal}>
        <div className="tracking-modal" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h2>Seguimiento de Tarea</h2>
            <button className="close-modal" onClick={closeModal}>&times;</button>
          </div>
          <div className="modal-body">
            <div className="task-header-modal">
              <h3>{selectedTarea.titulo}</h3>
              <p className="task-description-modal">{selectedTarea.descripcion}</p>
            </div>

            <div className="timeline">
              <div className="timeline-item completed">
                <div className="timeline-dot"><div className="dot-inner"></div></div>
                <div className="timeline-content">
                  <h4>Asignada</h4>
                  <p>Tarea lista para iniciar.</p>
                </div>
              </div>

              <div className={`timeline-item ${isInProgress || isCompleted ? 'completed' : 'active'}`}>
                <div className="timeline-dot"><div className="dot-inner"></div></div>
                <div className="timeline-content">
                  <h4>En Proceso</h4>
                  <p>
                    {selectedTarea.evidencia_inicial_url
                      ? `Tarea iniciada el ${formatFechaEvidencia(selectedTarea.evidencia_inicial_fecha)}`
                      : (isCompleted || isInProgress ? 'Tarea en marcha (Sin registro de inicio)' : 'Pendiente de inicio.')}
                  </p>
                  {selectedTarea.evidencia_inicial_url && (
                    <div className="evidence-display">
                      <div className="ev-link-container">
                        <button
                          className="ev-link-premium"
                          onClick={() => {
                            const fileType = getFileType(selectedTarea.evidencia_inicial_url);
                            handleDownload(selectedTarea.evidencia_inicial_url, `inicio_${fileType}`, selectedTarea.evidencia_inicial_mimetype);
                          }}
                        >
                          📥 Descargar Evidencia de Inicio
                        </button>
                        {(user.rol === 'Admin' || (user.rol !== 'Admin' && !isCompleted)) && (
                          <button className="btn-delete-ev" onClick={() => eliminarEvidencia(selectedTarea.id, 'inicio')} title="Eliminar y retroceder">
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className={`timeline-item ${isCompleted ? 'completed' : (isInProgress ? 'active' : '')}`}>
                <div className="timeline-dot"><div className="dot-inner"></div></div>
                <div className="timeline-content">
                  <h4>Completada</h4>
                  <p>
                    {isCompleted
                      ? (selectedTarea.evidencia_final_fecha ? `Tarea cerrada el ${formatFechaEvidencia(selectedTarea.evidencia_final_fecha)}` : 'Tarea finalizada.')
                      : 'Esperando cierre de tarea.'}
                  </p>
                  {selectedTarea.evidencia_final_url && (
                    <div className="evidence-display">
                      <div className="ev-link-container">
                        <button
                          className="ev-link-premium"
                          onClick={() => {
                            const fileType = getFileType(selectedTarea.evidencia_final_url);
                            handleDownload(selectedTarea.evidencia_final_url, `cierre_${fileType}`, selectedTarea.evidencia_final_mimetype);
                          }}
                        >
                          📥 Descargar Evidencia de Cierre
                        </button>
                        {user.rol === 'Admin' && (
                          <button className="btn-delete-ev" onClick={() => eliminarEvidencia(selectedTarea.id, 'cierre')} title="Eliminar y volver a proceso">
                            🗑️
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {!isCompleted && (
              <div className="upload-card">
                <h4>{isInProgress ? 'Finalizar Tarea (Cierre)' : 'Iniciar Tarea (Inicio)'}</h4>
                <p>Carga un archivo para {isInProgress ? 'cerrar la tarea' : 'iniciar la tarea'}.</p>
                <div className="upload-control" style={{ marginTop: '15px' }}>
                  <label className="btn-open-tracking" style={{ cursor: 'pointer' }}>
                    {isInProgress ? '📤 Seleccionar Archivo de Cierre' : '📤 Seleccionar Archivo de Inicio'}
                    <input
                      type="file"
                      hidden
                      onChange={(e) => subirEvidencia(selectedTarea.id, e.target.files[0])}
                    />
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };
  const [isViewerLoading, setIsViewerLoading] = useState(false);

  const getFileType = (url) => {
    if (!url) return 'other';
    // Limpiar URL de parámetros de query para detectar extensión
    const cleanUrl = url.split('?')[0].split('#')[0];
    const extension = cleanUrl.split('.').pop().toLowerCase();

    const images = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
    const pdfs = ['pdf'];
    const docs = ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'txt', 'csv'];

    if (images.includes(extension)) return 'img';
    if (pdfs.includes(extension)) return 'pdf';
    if (docs.includes(extension)) return 'doc';
    return 'other';
  };

  const handleDownload = async (url, originalType = 'archivo', mimetype = null) => {
    try {
      if (url && url.startsWith('http')) {
        // Descarga directa (archivos raw funcionan igual que en Documentos)
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Error al descargar el archivo');
        }

        const blob = await response.blob();

        // Detectar extensión
        let extension = '';

        // 1. Usar mimetype de la base de datos si existe (Prioridad Máxima)
        if (mimetype) {
          if (mimetype.includes('pdf')) extension = '.pdf';
          else if (mimetype.includes('word') || mimetype.includes('office')) extension = '.docx';
          else if (mimetype.includes('sheet') || mimetype.includes('excel')) extension = '.xlsx';
          else if (mimetype.includes('jpeg') || mimetype.includes('jpg')) extension = '.jpg';
          else if (mimetype.includes('png')) extension = '.png';
          else if (mimetype.includes('text')) extension = '.txt';
          else if (mimetype.includes('zip')) extension = '.zip';
          else if (mimetype.includes('rar')) extension = '.rar';
        }

        // 2. Si no, intentar detectar desde URL
        if (!extension) {
          try {
            const urlObj = new URL(url);
            const pathname = urlObj.pathname;
            if (pathname.includes('.')) {
              const ext = pathname.split('.').pop().toLowerCase();
              if (ext.length >= 3 && ext.length <= 4) {
                extension = '.' + ext;
              }
            }
          } catch (e) { }
        }

        // 3. Fallback: Intentar deducir por Content-Type header
        if (!extension) {
          const contentType = response.headers.get('content-type');
          if (contentType) {
            if (contentType.includes('pdf')) extension = '.pdf';
            else if (contentType.includes('word')) extension = '.docx';
            else if (contentType.includes('sheet') || contentType.includes('excel')) extension = '.xlsx';
            else if (contentType.includes('jpeg') || contentType.includes('jpg')) extension = '.jpg';
            else if (contentType.includes('png')) extension = '.png';
            else if (contentType.includes('text')) extension = '.txt';
            else if (contentType.includes('zip')) extension = '.zip';
            else if (contentType.includes('rar')) extension = '.rar';
          }
        }

        const blobUrl = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = blobUrl;

        // Generar nombre de archivo
        const fileName = `evidencia_${originalType}_${Date.now()}${extension}`;
        link.download = fileName;

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(blobUrl);
      } else if (url) {
        window.open(url, '_blank');
      }
    } catch (error) {
      console.error('Error en descarga:', error);
      alert('Error al descargar el archivo. Por favor, intenta de nuevo.');
    }
  };

  const renderFileViewer = () => {
    if (!previewFile) return null;
    const { url, type } = previewFile;

    return (
      <div className="file-viewer-overlay" onClick={() => setPreviewFile(null)}>
        <div className="file-viewer-header">
          <button
            className="btn-ev-download"
            onClick={(e) => {
              e.stopPropagation();
              handleDownload(url, type);
            }}
          >
            📥 Descargar
          </button>
          <button className="btn-ev-close" onClick={() => setPreviewFile(null)}>&times;</button>
        </div>
        <div className="file-viewer-content" onClick={(e) => e.stopPropagation()}>
          {isViewerLoading && <div className="viewer-loader">Cargando documento...</div>}

          {type === 'img' && (
            <img src={url} alt="Evidencia" onLoad={() => setIsViewerLoading(false)} />
          )}

          {type === 'pdf' && (
            <object
              data={url}
              type="application/pdf"
              width="100%"
              height="100%"
              onLoad={() => setIsViewerLoading(false)}
            >
              <div className="unsupported-viewer">
                <p>El navegador no puede previsualizar este PDF directamente.</p>
                <button onClick={() => handleDownload(url, 'pdf')} className="ev-link-premium">
                  Descargar PDF para ver 📥
                </button>
              </div>
            </object>
          )}

          {type === 'doc' && (
            <iframe
              src={`https://docs.google.com/gview?url=${encodeURIComponent(url)}&embedded=true`}
              title="Visor Documento"
              width="100%"
              height="100%"
              style={{ border: 'none' }}
              onLoad={() => setIsViewerLoading(false)}
            />
          )}

          {type === 'other' && (
            <div className="unsupported-viewer">
              <span style={{ fontSize: '4rem', marginBottom: '20px' }}>📁</span>
              <p>Tipo de archivo no compatible con vista previa.</p>
              <button
                onClick={() => handleDownload(url, 'archivo')}
                className="ev-link-premium"
                style={{ marginTop: '20px', cursor: 'pointer', border: 'none' }}
              >
                Descargar Original 📥
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };


  return (
    <div className="bitacora-body">
      <div className="bitacora-calendar-container">
        <div className="calendar-header">
          <div className="header-top">
            <h1><FaCalendarAlt style={{ color: 'white', marginRight: '10px' }} /> Bitácora</h1>
            <div className="view-selector">
              <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}>
                <FaCalendarAlt /> Mes
              </button>
              <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}>
                <FaCalendarWeek /> Semana
              </button>
              <button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}>
                <FaCalendarDay /> Día
              </button>
            </div>
          </div>

          <div className="calendar-nav">
            <button onClick={() => navigate(-1)} className="nav-btn"><FaChevronLeft /></button>
            <h2 className="current-view-title">
              {viewMode === "month" && `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
              {viewMode === "week" && `Semana del ${new Date(new Date(currentDate).setDate(currentDate.getDate() - currentDate.getDay())).getDate()} de ${monthNames[new Date(new Date(currentDate).setDate(currentDate.getDate() - currentDate.getDay())).getMonth()]}`}
              {viewMode === "day" && `${currentDate.getDate()} ${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`}
            </h2>
            <button onClick={() => navigate(1)} className="nav-btn"><FaChevronRight /></button>
          </div>
        </div>

        {loading ? (
          <p className="loading-text">Cargando...</p>
        ) : (
          <div className="calendar-content">
            {viewMode === "month" && renderMonthView()}
            {viewMode === "week" && renderWeekView()}
            {viewMode === "day" && renderDayView()}
          </div>
        )}

        <div className="calendar-legend-footer">
          <span className="legend-item"><span className="dot rojo"></span> Pendiente</span>
          <span className="legend-item"><span className="dot amarillo"></span> En Progreso</span>
          <span className="legend-item"><span className="dot verde"></span> Completado</span>
        </div>
      </div>
      {isModalOpen && renderTrackingModal()}
      {previewFile && renderFileViewer()}
    </div>
  );
};

export default Bitacora;

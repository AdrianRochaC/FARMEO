import React, { useState, useEffect, useRef } from "react";
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCalendarWeek, FaCalendarDay, FaTasks, FaFileAlt, FaUsers, FaTrafficLight, FaBold, FaItalic, FaListUl, FaListOl } from "react-icons/fa";
import "./AdminBitacora.css";
import { BACKEND_URL } from '../utils/api';

const AdminBitacora = () => {
  const [tareas, setTareas] = useState([]);
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingUsuarios, setLoadingUsuarios] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingTarea, setEditingTarea] = useState(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState("month"); // "month", "week", "day"
  const editorRef = useRef(null);

  const [formData, setFormData] = useState({
    titulo: "",
    descripcion: "",
    estado: "rojo",
    asignados: [],
    deadline: "",
  });

  const token = localStorage.getItem("authToken");

  useEffect(() => {
    fetchTareas();
    fetchUsuarios();
  }, []);

  const fetchUsuarios = async () => {
    setLoadingUsuarios(true);
    try {
      const response = await fetch(`${BACKEND_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        const usuariosActivos = (data.users || []).filter(usuario => {
          if (usuario.activo !== 1) return false;
          const rolLower = (usuario.rol || '').toLowerCase().trim();
          const esAdminPorRol = rolLower.includes('admin') || rolLower.includes('administrador');
          const nombreLower = (usuario.nombre || '').toLowerCase().trim();
          const esAdminPorNombre = nombreLower.includes('admin') || nombreLower.includes('administrador') || nombreLower === 'admin del sistema';
          return !esAdminPorRol && !esAdminPorNombre;
        });
        setUsuarios(usuariosActivos);
      }
    } catch (error) {
      console.error('Error cargando usuarios');
    } finally {
      setLoadingUsuarios(false);
    }
  };

  const fetchTareas = async () => {
    try {
      const response = await fetch(`${BACKEND_URL}/api/bitacora`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) setTareas(data.tareas || []);
    } catch (error) {
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setSubmitting(true);
    const url = editingTarea ? `${BACKEND_URL}/api/bitacora/${editingTarea.id}` : `${BACKEND_URL}/api/bitacora`;
    const method = editingTarea ? "PUT" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (data.success) {
        fetchTareas();
        setShowModal(false);
        setEditingTarea(null);
        setFormData({ titulo: "", descripcion: "", estado: "rojo", asignados: [], deadline: "" });
      } else {
        alert("❌ " + data.message);
      }
    } catch (error) {
      alert("❌ Error de conexión");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      const response = await fetch(`${BACKEND_URL}/api/bitacora/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) fetchTareas();
      else alert("❌ " + data.message);
    } catch (error) {
    }
  };

  const handleEdit = (tarea) => {
    setEditingTarea(tarea);
    setFormData({
      titulo: tarea.titulo || "",
      descripcion: tarea.descripcion || "",
      estado: tarea.estado || "rojo",
      asignados: (() => {
        try {
          if (Array.isArray(tarea.asignados)) return tarea.asignados;
          if (typeof tarea.asignados === 'string') return JSON.parse(tarea.asignados || "[]");
          return [];
        } catch (error) { return []; }
      })(),
      deadline: tarea.deadline ? tarea.deadline.split("T")[0] : "",
    });
    setShowModal(true);
    // Usar un pequeño timeout para asegurar que el ref esté disponible si el modal se acaba de abrir
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = tarea.descripcion || "";
      }
    }, 10);
  };

  // Navegación
  const navigate = (direction) => {
    const newDate = new Date(currentDate);
    if (viewMode === "month") newDate.setMonth(newDate.getMonth() + direction);
    else if (viewMode === "week") newDate.setDate(newDate.getDate() + direction * 7);
    else newDate.setDate(newDate.getDate() + direction);
    setCurrentDate(newDate);
  };

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

  const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const renderMonthView = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const cells = [];
    for (let i = 0; i < firstDay; i++) cells.push(<div key={`empty-${i}`} className="calendar-day empty"></div>);

    for (let d = 1; d <= daysInMonth; d++) {
      const date = new Date(year, month, d);
      const tareasDia = tareas.filter(t => isSameDay(new Date(t.deadline), date));
      const isToday = isSameDay(new Date(), date);

      cells.push(
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => {
          setFormData({
            titulo: "",
            descripcion: "",
            estado: "rojo",
            asignados: [],
            deadline: date.toISOString().split("T")[0]
          });
          setEditingTarea(null);
          setShowModal(true);
          fetchUsuarios();
          setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 10);
        }}>
          <span className="day-number">{d}</span>
          <div className="day-events">
            {tareasDia.map(tarea => (
              <div key={tarea.id} className={`calendar-event status-${tarea.estado}`} onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }}>
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
          const tareasDia = tareas.filter(t => isSameDay(new Date(t.deadline), date));
          const isToday = isSameDay(new Date(), date);
          return (
            <div key={date.toString()} className={`week-day-col ${isToday ? 'today' : ''}`} onClick={() => {
              setFormData({
                titulo: "",
                descripcion: "",
                estado: "rojo",
                asignados: [],
                deadline: date.toISOString().split("T")[0]
              });
              setEditingTarea(null);
              setShowModal(true);
              fetchUsuarios();
              setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 10);
            }}>
              <div className="week-day-header">
                <span className="day-name">{dayNames[date.getDay()]}</span>
                <span className="day-num">{date.getDate()}</span>
              </div>
              <div className="week-day-events">
                {tareasDia.map(tarea => (
                  <div key={tarea.id} className={`calendar-event-card status-${tarea.estado}`} onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }}>
                    <h5>{tarea.titulo}</h5>
                    <div className="event-actions-mini">
                      <FaEdit onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }} />
                      <FaTrash onClick={(e) => { e.stopPropagation(); handleDelete(tarea.id); }} />
                    </div>
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
    const tareasDia = tareas.filter(t => isSameDay(new Date(t.deadline), currentDate));
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
              <div key={tarea.id} className={`day-task-detail status-${tarea.estado}`} onClick={() => handleEdit(tarea)}>
                <div className="task-main-info">
                  <h4>{tarea.titulo}</h4>
                  <div className="task-html-desc" dangerouslySetInnerHTML={{ __html: tarea.descripcion }}></div>

                  {/* Evidence Display for Admin */}
                  {(tarea.evidencia_inicial_url || tarea.evidencia_final_url) && (
                    <div className="admin-evidence-box" style={{ marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '8px' }}>
                      <p style={{ fontSize: '0.85rem', marginBottom: '5px', opacity: 0.8 }}>📋 Evidencias:</p>
                      <div style={{ display: 'flex', gap: '15px' }}>
                        {tarea.evidencia_inicial_url && (
                          <div className="ev-item">
                            <a href={tarea.evidencia_inicial_url} target="_blank" rel="noreferrer" style={{ color: '#ffd700', textDecoration: 'none', fontSize: '0.85rem' }}>📂 Inicio</a>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '5px' }}>({formatFechaEvidencia(tarea.evidencia_inicial_fecha)})</span>
                          </div>
                        )}
                        {tarea.evidencia_final_url && (
                          <div className="ev-item">
                            <a href={tarea.evidencia_final_url} target="_blank" rel="noreferrer" style={{ color: '#4caf50', textDecoration: 'none', fontSize: '0.85rem' }}>📂 Cierre</a>
                            <span style={{ fontSize: '0.75rem', opacity: 0.6, marginLeft: '5px' }}>({formatFechaEvidencia(tarea.evidencia_final_fecha)})</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="task-actions-large">
                  <button className="btn-edit" onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }}><FaEdit /> Editar</button>
                  <button className="btn-delete" onClick={(e) => { e.stopPropagation(); handleDelete(tarea.id); }}><FaTrash /> Eliminar</button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="admin-body bitacora-calendar-page">
      <div className="bitacora-calendar-container">
        <div className="calendar-header-admin">
          <div className="header-top">
            <h1><FaTasks className="header-icon" /> Bitácora Global</h1>
            <div className="header-actions">
              <div className="view-selector">
                <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}><FaCalendarAlt /> Mes</button>
                <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}><FaCalendarWeek /> Semana</button>
                <button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}><FaCalendarDay /> Día</button>
              </div>
              <button className="btn-primary create-btn" onClick={() => {
                setFormData({ titulo: "", descripcion: "", estado: "rojo", asignados: [], deadline: new Date().toISOString().split("T")[0] });
                setEditingTarea(null);
                setShowModal(true);
                fetchUsuarios();
                setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 10);
              }}><FaPlus /> Nueva Tarea</button>
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
      </div>

      {showModal && (
        <div className="modal-overlay outlook-modal">
          <div className="modal-content outlook-content">
            {/* Barra de herramientas superior estilo Outlook */}
            <div className="outlook-toolbar">
              <button className="btn-outlook-save" onClick={handleSubmit} disabled={submitting}>
                <FaCalendarAlt /> {editingTarea ? "Guardar" : "Enviar"}
              </button>
              <button className="btn-outlook-cancel" onClick={() => setShowModal(false)}>
                ❌ Cancelar
              </button>
              <div className="outlook-toolbar-divider"></div>
              <div className="outlook-status-selector">
                <label>Estado:</label>
                <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                  <option value="rojo">🔴 Pendiente</option>
                  <option value="amarillo">🟡 En Progreso</option>
                  <option value="verde">✅ Completado</option>
                </select>
              </div>
            </div>

            <div className="outlook-body">
              <div className="outlook-main-form">
                {/* Título Grande */}
                <div className="form-group large-group">
                  <input
                    type="text"
                    className="outlook-title-input"
                    value={formData.titulo}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                    placeholder="Agregar un título"
                    required
                  />
                </div>

                {/* Selección de Usuarios estilo "Invite a los asistentes" */}
                <div className="form-group outlook-row">
                  <div className="row-icon"><FaUsers /></div>
                  <div className="row-content">
                    <label>Asistentes:</label>
                    <div className="outlook-user-selector">
                      {loadingUsuarios ? (
                        <div className="spinner-mini"></div>
                      ) : (
                        <div className="outlook-users-list">
                          {usuarios.map((u) => {
                            const isSelected = formData.asignados.includes(u.id);
                            return (
                              <div
                                key={u.id}
                                className={`outlook-user-chip ${isSelected ? 'selected' : ''}`}
                                onClick={() => {
                                  const asignados = isSelected
                                    ? formData.asignados.filter(id => id !== u.id)
                                    : [...formData.asignados, u.id];
                                  setFormData({ ...formData, asignados });
                                }}
                              >
                                {u.nombre}
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Fecha y Hora */}
                <div className="form-group outlook-row">
                  <div className="row-icon"><FaCalendarAlt /></div>
                  <div className="row-content horizontal">
                    <input
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      className="outlook-date-input"
                      required
                    />
                    <div className="all-day-toggle">
                      <input type="checkbox" checked={true} readOnly /> Todo el día
                    </div>
                  </div>
                </div>

                {/* Descripción / Cuerpo del correo con Editor Enriquecido */}
                <div className="form-group outlook-description">
                  <div className="description-toolbar">
                    <button type="button" title="Negrita" onClick={() => document.execCommand('bold', false, null)}><FaBold /></button>
                    <button type="button" title="Cursiva" onClick={() => document.execCommand('italic', false, null)}><FaItalic /></button>
                    <div className="toolbar-sep"></div>
                    <button type="button" title="Lista con viñetas" onClick={() => document.execCommand('insertUnorderedList', false, null)}><FaListUl /></button>
                    <button type="button" title="Lista numerada" onClick={() => document.execCommand('insertOrderedList', false, null)}><FaListOl /></button>
                  </div>
                  <div
                    ref={editorRef}
                    className="outlook-editor"
                    contentEditable={true}
                    onInput={(e) => setFormData({ ...formData, descripcion: e.currentTarget.innerHTML })}
                    onBlur={(e) => setFormData({ ...formData, descripcion: e.currentTarget.innerHTML })}
                    placeholder="Agregue una descripción de la tarea..."
                  ></div>
                </div>
              </div>

              {/* Lado derecho estilo Calendario de Outlook (Opcional, se puede omitir o poner algo estético) */}
              <div className="outlook-side-preview">
                <div className="mini-calendar-header">
                  <span>{new Date(formData.deadline || new Date()).toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                </div>
                <div className="mini-schedule">
                  {[...Array(5)].map((_, i) => (
                    <div key={i} className="schedule-slot">
                      <span className="slot-time">{8 + i}:00</span>
                      <div className="slot-content"></div>
                    </div>
                  ))}
                  {formData.titulo && (
                    <div className={`preview-event-block status-${formData.estado}`}>
                      <strong>{formData.titulo}</strong>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBitacora;
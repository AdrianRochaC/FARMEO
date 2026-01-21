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
  const [showOptionsModal, setShowOptionsModal] = useState(false);
  const [showDayPanel, setShowDayPanel] = useState(false);
  const [selectedDay, setSelectedDay] = useState(null);
  const [selectedTaskForOptions, setSelectedTaskForOptions] = useState(null);
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
    setShowOptionsModal(false);
    setShowDayPanel(false);
    setShowModal(true);
    fetchUsuarios();
    // Usar un pequeño timeout para asegurar que el ref esté disponible si el modal se acaba de abrir
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.innerHTML = tarea.descripcion || "";
      }
    }, 10);
  };

  const handleTaskClick = (tarea) => {
    setSelectedTaskForOptions(tarea);
    setShowOptionsModal(true);
  };

  const openCreateModal = (date = new Date()) => {
    const dateStr = date.toISOString().split("T")[0];
    setFormData({
      titulo: "",
      descripcion: "",
      estado: "rojo",
      asignados: [],
      deadline: dateStr
    });
    setEditingTarea(null);
    setShowModal(true);
    setShowDayPanel(false);
    fetchUsuarios();
    setTimeout(() => { if (editorRef.current) editorRef.current.innerHTML = ""; }, 10);
  };

  const handleDaySelect = (date) => {
    setSelectedDay(date);
    setShowDayPanel(true);
  };

  const getInitials = (nombre) => {
    if (!nombre) return "??";
    return nombre.split(" ").map(n => n[0]).join("").substring(0, 2).toUpperCase();
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
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => handleDaySelect(date)}>
          <span className="day-number">{d}</span>
          <div className="day-events">
            {tareasDia.slice(0, 3).map(tarea => (
              <div key={tarea.id} className={`calendar-event status-${tarea.estado}`} onClick={(e) => { e.stopPropagation(); handleTaskClick(tarea); }}>
                <div className="event-dot"></div>
                <span className="event-title">{tarea.titulo}</span>
              </div>
            ))}
            {tareasDia.length > 3 && <div className="more-events">+{tareasDia.length - 3} más</div>}
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
            <div key={date.toString()} className={`week-day-col ${isToday ? 'today' : ''}`} onClick={() => handleDaySelect(date)}>
              <div className="week-day-header">
                <span className="day-name">{dayNames[date.getDay()]}</span>
                <span className="day-num">{date.getDate()}</span>
              </div>
              <div className="week-day-events">
                {tareasDia.map(tarea => (
                  <div key={tarea.id} className={`calendar-event-card status-${tarea.estado}`} onClick={(e) => { e.stopPropagation(); handleTaskClick(tarea); }}>
                    <h5>{tarea.titulo}</h5>
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
          <div className="day-header-left">
            <h3>{dayNames[currentDate.getDay()]}, {currentDate.getDate()} de {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}</h3>
            <p className="day-stats">{tareasDia.length} {tareasDia.length === 1 ? 'tarea asignada' : 'tareas asignadas'}</p>
          </div>
          <button className="btn-primary create-day-btn" onClick={() => openCreateModal(currentDate)}>
            <FaPlus /> Nueva Tarea
          </button>
        </div>
        <div className="day-tasks-list">
          {tareasDia.length === 0 ? (
            <div className="empty-day-state">
              <FaTasks className="empty-icon" />
              <p>No hay tareas programadas para este día.</p>
              <button className="btn-secondary" onClick={() => openCreateModal(currentDate)}>Comenzar a planificar</button>
            </div>
          ) : (
            tareasDia.map(tarea => (
              <div key={tarea.id} className={`day-task-detail status-${tarea.estado}`} onClick={() => handleTaskClick(tarea)}>
                <div className="task-main-info">
                  <div className="task-title-row">
                    <span className={`status-badge status-${tarea.estado}`}></span>
                    <h4>{tarea.titulo}</h4>
                  </div>
                  <div className="task-html-desc" dangerouslySetInnerHTML={{ __html: tarea.descripcion }}></div>

                  {/* Evidence Display for Admin */}
                  {(tarea.evidencia_inicial_url || tarea.evidencia_final_url) && (
                    <div className="admin-evidence-box">
                      <p className="evidence-label">📋 Evidencias recibidas:</p>
                      <div className="evidence-grid">
                        {tarea.evidencia_inicial_url && (
                          <div className="ev-item">
                            <a href={tarea.evidencia_inicial_url} target="_blank" rel="noreferrer" className="ev-link start">
                              <FaFileAlt /> Inicio
                            </a>
                            <span className="ev-date">{formatFechaEvidencia(tarea.evidencia_inicial_fecha)}</span>
                          </div>
                        )}
                        {tarea.evidencia_final_url && (
                          <div className="ev-item">
                            <a href={tarea.evidencia_final_url} target="_blank" rel="noreferrer" className="ev-link end">
                              <FaFileAlt /> Cierre
                            </a>
                            <span className="ev-date">{formatFechaEvidencia(tarea.evidencia_final_fecha)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
                <div className="task-actions-large">
                  <button className="btn-icon-round edit" onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }} title="Editar"><FaEdit /></button>
                  <button className="btn-icon-round delete" onClick={(e) => { e.stopPropagation(); handleDelete(tarea.id); }} title="Eliminar"><FaTrash /></button>
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
                    <div className="user-selection-panel">
                      {loadingUsuarios ? (
                        <div className="loading-users">
                          <div className="spinner-mini"></div>
                          <span>Cargando usuarios...</span>
                        </div>
                      ) : (
                        <div className="users-grid-selector">
                          {usuarios.map((u) => {
                            const isSelected = formData.asignados.includes(u.id);
                            return (
                              <div
                                key={u.id}
                                className={`user-chip-item ${isSelected ? 'active' : ''}`}
                                onClick={() => {
                                  const asignados = isSelected
                                    ? formData.asignados.filter(id => id !== u.id)
                                    : [...formData.asignados, u.id];
                                  setFormData({ ...formData, asignados });
                                }}
                              >
                                <div className="user-avatar-mini">{getInitials(u.nombre)}</div>
                                <div className="user-info-mini">
                                  <span className="user-name-mini">{u.nombre}</span>
                                  <span className="user-role-mini-label">{u.rol || "Colaborador"}</span>
                                </div>
                                {isSelected && <div className="user-check-icon">✓</div>}
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

      {showDayPanel && selectedDay && (
        <div className="modal-overlay day-panel-overlay" onClick={() => setShowDayPanel(false)}>
          <div className="day-panel-content" onClick={e => e.stopPropagation()}>
            <div className="day-panel-header">
              <div className="header-info">
                <h3>Tareas del {selectedDay.getDate()} de {monthNames[selectedDay.getMonth()]}</h3>
                <p>{tareas.filter(t => isSameDay(new Date(t.deadline), selectedDay)).length} tareas programadas</p>
              </div>
              <button className="btn-close-panel" onClick={() => setShowDayPanel(false)}>×</button>
            </div>

            <div className="day-panel-body">
              <button className="btn-primary add-task-panel-btn" onClick={() => openCreateModal(selectedDay)}>
                <FaPlus /> Crear Nueva Tarea para hoy
              </button>

              <div className="panel-tasks-list">
                {tareas.filter(t => isSameDay(new Date(t.deadline), selectedDay)).length === 0 ? (
                  <div className="panel-empty-state">
                    <FaTasks />
                    <p>No tienes tareas para este día.</p>
                  </div>
                ) : (
                  tareas.filter(t => isSameDay(new Date(t.deadline), selectedDay)).map(tarea => (
                    <div key={tarea.id} className={`panel-task-item status-${tarea.estado}`} onClick={() => handleTaskClick(tarea)}>
                      <div className="panel-task-main">
                        <div className="panel-task-header">
                          <span className={`panel-status-dot status-${tarea.estado}`}></span>
                          <h4>{tarea.titulo}</h4>
                        </div>
                        <div className="panel-task-desc" dangerouslySetInnerHTML={{ __html: tarea.descripcion }}></div>

                        {(tarea.evidencia_inicial_url || tarea.evidencia_final_url) && (
                          <div className="panel-evidence-badges">
                            {tarea.evidencia_inicial_url && <span className="p-badge start">📂 Inicio OK</span>}
                            {tarea.evidencia_final_url && <span className="p-badge end">📂 Cierre OK</span>}
                          </div>
                        )}
                      </div>
                      <div className="panel-task-actions">
                        <button className="p-action-btn edit" onClick={(e) => { e.stopPropagation(); handleEdit(tarea); }}><FaEdit /></button>
                        <button className="p-action-btn delete" onClick={(e) => { e.stopPropagation(); handleDelete(tarea.id); }}><FaTrash /></button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showOptionsModal && selectedTaskForOptions && (
        <div className="modal-overlay op-modal-overlay" onClick={() => setShowOptionsModal(false)}>
          <div className="options-modal" onClick={e => e.stopPropagation()}>
            <div className="options-modal-header">
              <div className={`status-pill status-${selectedTaskForOptions.estado}`}></div>
              <h3>{selectedTaskForOptions.titulo}</h3>
              <button className="close-op" onClick={() => setShowOptionsModal(false)}>×</button>
            </div>
            <div className="options-modal-body">
              <button className="op-btn edit" onClick={() => handleEdit(selectedTaskForOptions)}>
                <FaEdit />
                <span>Editar Tarea</span>
              </button>
              <button className="op-btn delete" onClick={() => {
                handleDelete(selectedTaskForOptions.id);
                setShowOptionsModal(false);
              }}>
                <FaTrash />
                <span>Eliminar Tarea</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBitacora;
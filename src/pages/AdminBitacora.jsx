import React, { useState, useEffect } from "react";
import { FaPlus, FaEdit, FaTrash, FaChevronLeft, FaChevronRight, FaCalendarAlt, FaCalendarWeek, FaCalendarDay, FaTasks, FaFileAlt, FaUsers, FaTrafficLight } from "react-icons/fa";
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
        <div key={d} className={`calendar-day ${isToday ? 'today' : ''}`} onClick={() => { setViewMode("day"); setCurrentDate(date); }}>
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
            <div key={date.toString()} className={`week-day-col ${isToday ? 'today' : ''}`} onClick={() => { setViewMode("day"); setCurrentDate(date); }}>
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
                  <p>{tarea.descripcion}</p>
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
            <h1><FaTasks style={{ color: 'white', marginRight: '10px' }} /> Bitácora Global</h1>
            <div className="header-actions">
              <div className="view-selector">
                <button className={viewMode === "month" ? "active" : ""} onClick={() => setViewMode("month")}><FaCalendarAlt /> Mes</button>
                <button className={viewMode === "week" ? "active" : ""} onClick={() => setViewMode("week")}><FaCalendarWeek /> Semana</button>
                <button className={viewMode === "day" ? "active" : ""} onClick={() => setViewMode("day")}><FaCalendarDay /> Día</button>
              </div>
              <button className="btn-primary create-btn" onClick={() => { setShowModal(true); fetchUsuarios(); }}><FaPlus /> Nueva Tarea</button>
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
        <div className="modal-overlay">
          <div className="modal-content">
            <h2>{editingTarea ? "✏️ Editar Tarea" : "➕ Nueva Tarea"}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label><FaEdit style={{ color: 'white', marginRight: '8px' }} /> Título:</label>
                <input
                  type="text"
                  value={formData.titulo}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  placeholder="Ej: Revisión de inventario semanal"
                  required
                />
              </div>
              <div className="form-group">
                <label><FaFileAlt style={{ color: 'white', marginRight: '8px' }} /> Descripción:</label>
                <textarea
                  value={formData.descripcion}
                  onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                  placeholder="Describe detalladamente los pasos a seguir para completar la tarea..."
                  required
                />
              </div>
              <div className="form-group">
                <label><FaTrafficLight style={{ color: 'white', marginRight: '8px' }} /> Estado:</label>
                <select value={formData.estado} onChange={(e) => setFormData({ ...formData, estado: e.target.value })}>
                  <option value="rojo">🔴 Pendiente</option>
                  <option value="amarillo">🟡 En Progreso</option>
                  <option value="verde">✅ Completado</option>
                </select>
              </div>
              <div className="form-group">
                <label><FaCalendarAlt style={{ color: 'white', marginRight: '8px' }} /> Fecha Límite:</label>
                <input type="date" value={formData.deadline} onChange={(e) => setFormData({ ...formData, deadline: e.target.value })} required />
              </div>
              <div className="form-group">
                <label><FaUsers style={{ color: 'white', marginRight: '8px' }} /> Asignar usuarios:</label>
                <div className="user-selection-panel">
                  {loadingUsuarios ? (
                    <div className="loading-users">
                      <div className="spinner-mini"></div>
                      <span>Cargando usuarios...</span>
                    </div>
                  ) : usuarios.length === 0 ? (
                    <div className="no-users">
                      <p>No hay usuarios disponibles</p>
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
                            <div className="user-avatar-mini">
                              {u.nombre.charAt(0).toUpperCase()}
                            </div>
                            <div className="user-info-mini">
                              <span className="user-name-mini">{u.nombre}</span>
                              <span className="user-role-mini-label">{u.rol}</span>
                            </div>
                            {isSelected && <div className="user-check-icon">✓</div>}
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
              <div className="form-actions">
                <button type="submit" className="btn-primary" disabled={submitting}>{editingTarea ? "💾 Guardar" : "✨ Crear"}</button>
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>❌ Cancelar</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBitacora;
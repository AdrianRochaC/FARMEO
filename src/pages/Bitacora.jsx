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
                    <select
                      value={tarea.estado}
                      onChange={(e) => { e.stopPropagation(); cambiarEstado(tarea.id, e.target.value); }}
                    >
                      <option value="rojo">🔴 Pendiente</option>
                      <option value="amarillo">🟡 En Progreso</option>
                      <option value="verde">🟢 Completado</option>
                    </select>
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
                  <label>Estado:</label>
                  <select
                    value={tarea.estado}
                    onChange={(e) => cambiarEstado(tarea.id, e.target.value)}
                    className="status-select-large"
                  >
                    <option value="rojo">🔴 Pendiente</option>
                    <option value="amarillo">🟡 En Progreso</option>
                    <option value="verde">🟢 Completado</option>
                  </select>
                </div>
              </div>
            ))
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
    </div>
  );
};

export default Bitacora;

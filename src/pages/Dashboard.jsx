
import React, { useEffect, useState, useMemo } from "react";
import axios from "axios";
import { BACKEND_URL } from "../utils/api";
import "./Dashboard.css";
import EvaluationPieChart from "../components/Charts/EvaluationPieChart";
import ProgressChart from "../components/Charts/ProgressChart";
import CourseCompletionChart from "../components/Charts/CourseCompletionChart";

const Dashboard = () => {
  const [progress, setProgress] = useState([]);
  const [users, setUsers] = useState([]);
  const [generalStats, setGeneralStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cargoFiltro, setCargoFiltro] = useState('todos');
  const [showCharts, setShowCharts] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      setLoading(false);
      return;
    }
    // Obtener usuarios, progreso y estadísticas generales en paralelo
    Promise.all([
      axios.get(`${BACKEND_URL}/api/users`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BACKEND_URL}/api/progress/all`, { headers: { Authorization: `Bearer ${token}` } }),
      axios.get(`${BACKEND_URL}/api/stats/general`, { headers: { Authorization: `Bearer ${token}` } })
    ])
      .then(([usersRes, progressRes, statsRes]) => {
        if (usersRes.data.success && progressRes.data.success) {
          setUsers(usersRes.data.users);
          setProgress(progressRes.data.progress);
        } else {
          alert("❌ Error al cargar usuarios o progreso");
        }

        if (statsRes.data.success) {
          setGeneralStats(statsRes.data.stats);
        }
      })
      .catch((err) => {
        alert("❌ No se pudo cargar algunos datos del dashboard");
      })
      .finally(() => setLoading(false));
  }, []);

  // Agrupar progreso por usuario (nombre)
  const progressByUser = progress.reduce((acc, item) => {
    if (!acc[item.nombre]) acc[item.nombre] = [];
    acc[item.nombre].push(item);
    return acc;
  }, {});

  // Filtrar usuarios: solo los que no son admin ni Admin y están activos
  let nonAdminUsers = users.filter(u => u.rol !== 'admin' && u.rol !== 'Admin' && u.activo === 1);
  // Filtro por cargo
  if (cargoFiltro !== 'todos') {
    nonAdminUsers = nonAdminUsers.filter(u => u.rol === cargoFiltro);
  }

  // Preparar datos para gráficas
  const chartData = useMemo(() => {
    // Datos para PieChart de evaluaciones
    const evaluationData = {
      aprobado: 0,
      reprobado: 0,
      pendiente: 0
    };

    // Datos para BarChart de progreso por usuario
    const progressData = nonAdminUsers.map(user => {
      const cursos = progressByUser[user.nombre] || [];
      let totalProgreso = 0;
      let cursosConProgreso = 0;

      cursos.forEach(curso => {
        const videoProgress = curso.video_completed ? 100 : 0;
        const hasEval = curso.evaluation_total && curso.evaluation_total > 0;
        const evalProgress = hasEval && curso.evaluation_score !== null
          ? (curso.evaluation_score / curso.evaluation_total) * 100
          : 0;

        const cursoProgreso = hasEval ? (videoProgress + evalProgress) / 2 : videoProgress;
        totalProgreso += cursoProgreso;
        cursosConProgreso++;

        // Contar estados de evaluaciones
        const status = curso.evaluation_status?.toLowerCase();
        if (hasEval) {
          if (status === 'aprobado') evaluationData.aprobado++;
          else if (status === 'reprobado') evaluationData.reprobado++;
          else evaluationData.pendiente++;
        }
      });

      return {
        nombre: user.nombre,
        progresoPromedio: cursosConProgreso > 0 ? totalProgreso / cursosConProgreso : 0,
        totalCursos: cursos.length
      };
    });

    // Datos para AreaChart de completación por cargo
    const completionByCargo = {};
    nonAdminUsers.forEach(user => {
      const cargo = user.rol || 'Sin cargo';
      if (!completionByCargo[cargo]) {
        completionByCargo[cargo] = { completados: 0, pendientes: 0 };
      }

      const cursos = progressByUser[user.nombre] || [];
      cursos.forEach(curso => {
        const isCompleted = curso.video_completed &&
          (!curso.evaluation_total || curso.evaluation_status?.toLowerCase() === 'aprobado');

        if (isCompleted) {
          completionByCargo[cargo].completados++;
        } else {
          completionByCargo[cargo].pendientes++;
        }
      });
    });

    return {
      evaluationData,
      progressData: progressData.filter(p => p.totalCursos > 0),
      completionByCargo
    };
  }, [nonAdminUsers, progressByUser]);

  // Función para descargar reporte en PDF
  const downloadPDF = async () => {
    try {
      // Importar dinámicamente las librerías
      const jsPDF = (await import('jspdf')).default;
      const html2canvas = (await import('html2canvas')).default;

      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      let yPosition = 20;

      // Encabezado con colores FARMEO (oscuro profesional)
      pdf.setFillColor(35, 36, 58); // Color oscuro de FARMEO
      pdf.rect(0, 0, pageWidth, 35, 'F');

      // Título del reporte
      pdf.setFontSize(24);
      pdf.setTextColor(255, 255, 255);
      pdf.text('Dashboard de Progreso', pageWidth / 2, 18, { align: 'center' });

      pdf.setFontSize(11);
      pdf.setTextColor(200, 200, 200);
      pdf.text(`Generado: ${new Date().toLocaleString('es-CO')}`, pageWidth / 2, 28, { align: 'center' });

      yPosition = 45;

      // Estadísticas generales con cajas coloridas
      if (generalStats) {
        pdf.setFontSize(16);
        pdf.setTextColor(0, 0, 0);
        pdf.text('Estadísticas Generales', 20, yPosition);
        yPosition += 12;

        const boxWidth = (pageWidth - 50) / 3;
        const boxHeight = 25;
        const startX = 20;

        // Caja 1: Usuarios Activos (Azul)
        pdf.setFillColor(59, 130, 246);
        pdf.roundedRect(startX, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        pdf.setFontSize(20);
        pdf.setTextColor(255, 255, 255);
        pdf.text(`${generalStats.usuarios_activos || 0}`, startX + boxWidth / 2, yPosition + 12, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text('Usuarios Activos', startX + boxWidth / 2, yPosition + 20, { align: 'center' });

        // Caja 2: Cursos Totales (Verde)
        pdf.setFillColor(16, 185, 129);
        pdf.roundedRect(startX + boxWidth + 5, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        pdf.setFontSize(20);
        pdf.text(`${generalStats.total_cursos || 0}`, startX + boxWidth + 5 + boxWidth / 2, yPosition + 12, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text('Cursos Totales', startX + boxWidth + 5 + boxWidth / 2, yPosition + 20, { align: 'center' });

        // Caja 3: Progreso Promedio (Naranja)
        pdf.setFillColor(245, 158, 11);
        pdf.roundedRect(startX + (boxWidth + 5) * 2, yPosition, boxWidth, boxHeight, 3, 3, 'F');
        pdf.setFontSize(20);
        pdf.text(`${generalStats.progreso_promedio_general ? Math.round(generalStats.progreso_promedio_general) : 0}%`, startX + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 12, { align: 'center' });
        pdf.setFontSize(9);
        pdf.text('Progreso Promedio', startX + (boxWidth + 5) * 2 + boxWidth / 2, yPosition + 20, { align: 'center' });

        yPosition += boxHeight + 15;
      }

      // Capturar gráficas si están visibles
      if (showCharts) {
        const chartsSection = document.querySelector('.dashboard-charts-section');
        if (chartsSection) {
          // Agregar título manual antes de las gráficas
          pdf.setFontSize(16);
          pdf.setTextColor(0, 0, 0);
          pdf.text('Análisis Visual', 20, yPosition);
          yPosition += 10;

          // Crear un contenedor temporal con fondo blanco
          const tempContainer = document.createElement('div');
          tempContainer.style.position = 'fixed';
          tempContainer.style.left = '-9999px';
          tempContainer.style.top = '0';
          tempContainer.style.background = '#ffffff';
          tempContainer.style.padding = '20px';
          tempContainer.style.width = chartsSection.offsetWidth + 'px';

          // Clonar las gráficas
          const clone = chartsSection.cloneNode(true);

          // Ocultar el título h2 del clon
          const h2Title = clone.querySelector('h2');
          if (h2Title) {
            h2Title.style.display = 'none';
          }

          // Forzar estilos claros en el clon
          clone.style.background = '#ffffff';
          clone.style.color = '#000000';

          // Cambiar colores de texto en el clon
          const allText = clone.querySelectorAll('*');
          allText.forEach(el => {
            const computedStyle = window.getComputedStyle(el);
            if (computedStyle.color.includes('rgb')) {
              el.style.color = '#000000';
            }
          });

          tempContainer.appendChild(clone);
          document.body.appendChild(tempContainer);

          const canvas = await html2canvas(tempContainer, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
            windowWidth: tempContainer.scrollWidth,
            windowHeight: tempContainer.scrollHeight
          });

          // Remover contenedor temporal
          document.body.removeChild(tempContainer);

          const imgData = canvas.toDataURL('image/png');
          const imgWidth = pageWidth - 40;
          const imgHeight = (canvas.height * imgWidth) / canvas.width;

          // Si la imagen es muy alta, agregar nueva página
          if (yPosition + imgHeight > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.addImage(imgData, 'PNG', 20, yPosition, imgWidth, imgHeight);
          yPosition += imgHeight + 10;
        }
      }

      // Tabla de datos
      pdf.addPage();
      yPosition = 20;

      pdf.setFontSize(14);
      pdf.setTextColor(0, 0, 0);
      pdf.text('Detalle de Progreso por Usuario', 20, yPosition);
      yPosition += 10;

      // Encabezados de tabla
      pdf.setFontSize(8);
      pdf.setFillColor(35, 36, 58); // Color FARMEO oscuro
      pdf.rect(20, yPosition, pageWidth - 40, 7, 'F');
      pdf.setTextColor(255, 255, 255);
      pdf.text('Usuario', 22, yPosition + 5);
      pdf.text('Cargo', 70, yPosition + 5);
      pdf.text('Curso', 110, yPosition + 5);
      pdf.text('Video', 155, yPosition + 5);
      pdf.text('Eval', 175, yPosition + 5);
      yPosition += 7;

      // Datos
      pdf.setTextColor(0, 0, 0);
      nonAdminUsers.forEach(user => {
        const cursos = progressByUser[user.nombre] || [];
        const cargo = user.rol || 'Sin cargo';

        if (cursos.length === 0) {
          // Verificar si necesitamos nueva página
          if (yPosition > pageHeight - 20) {
            pdf.addPage();
            yPosition = 20;
          }

          pdf.setFillColor(245, 245, 245);
          pdf.rect(20, yPosition, pageWidth - 40, 6, 'F');
          pdf.text(user.nombre.substring(0, 25), 22, yPosition + 4);
          pdf.text(cargo.substring(0, 20), 70, yPosition + 4);
          pdf.text('Sin cursos', 110, yPosition + 4);
          yPosition += 6;
        } else {
          cursos.forEach((curso, idx) => {
            if (yPosition > pageHeight - 20) {
              pdf.addPage();
              yPosition = 20;
            }

            if (idx % 2 === 0) {
              pdf.setFillColor(245, 245, 245);
              pdf.rect(20, yPosition, pageWidth - 40, 6, 'F');
            }

            pdf.text(user.nombre.substring(0, 25), 22, yPosition + 4);
            pdf.text(cargo.substring(0, 20), 70, yPosition + 4);
            pdf.text((curso.curso || `Curso ${curso.course_id}`).substring(0, 25), 110, yPosition + 4);
            pdf.text(curso.video_completed ? 'Sí' : 'No', 155, yPosition + 4);

            const evalText = curso.evaluation_score !== null
              ? `${curso.evaluation_score}/${curso.evaluation_total}`
              : 'N/A';
            pdf.text(evalText, 175, yPosition + 4);

            yPosition += 6;
          });
        }
      });

      // Guardar PDF
      pdf.save(`Dashboard_Progreso_${new Date().toISOString().split('T')[0]}.pdf`);
      alert('✅ Reporte PDF generado exitosamente');
    } catch (error) {
      console.error('Error generando PDF:', error);
      alert('❌ Error al generar el PDF. Asegúrate de que las gráficas estén visibles.');
    }
  };

  return (
    <div className="dashboard-container-bg">
      <div className="dashboard-header">
        <h1>Panel de Progreso General</h1>
        <div className="dashboard-description">
          Visualiza el avance de todos los usuarios en los cursos de la plataforma. <br />
          <span className="dashboard-subtitle">Solo visible para administradores.</span>
        </div>

        {/* Estadísticas generales */}
        {generalStats ? (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            marginBottom: '2rem',
            padding: '1.5rem',
            background: 'var(--bg-secondary)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                {generalStats.usuarios_activos || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Usuarios Activos</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--success-color)' }}>
                {generalStats.total_cursos || 0}
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Cursos Totales</div>
            </div>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', fontWeight: 'bold', color: 'var(--info-color)' }}>
                {generalStats.progreso_promedio_general ? Math.round(generalStats.progreso_promedio_general) : 0}%
              </div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>Progreso Promedio</div>
            </div>
          </div>
        ) : (
          <div style={{
            padding: '2rem',
            textAlign: 'center',
            backgroundColor: 'var(--card-background)',
            borderRadius: '12px',
            border: '1px solid var(--border-color)',
            marginBottom: '2rem'
          }}>
            <div style={{ fontSize: '1.2rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
              📊 Cargando estadísticas...
            </div>
            <div style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
              Las métricas se actualizarán cuando haya datos disponibles
            </div>
          </div>
        )}

        {/* Filtro de cargos */}
        <div style={{ marginTop: '1.5rem', marginBottom: '1.5rem', textAlign: 'center', display: 'flex', gap: '1rem', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap' }}>
          <div>
            <label style={{ fontWeight: 500, marginRight: 8 }}>Filtrar por cargo:</label>
            <select value={cargoFiltro} onChange={e => setCargoFiltro(e.target.value)} style={{ padding: '0.4rem 1rem', borderRadius: 8, border: '1.5px solid #bcd2f7', fontSize: '1rem' }}>
              <option value="todos">Todos</option>
              {[...new Set(users.filter(u => u.rol !== 'admin' && u.rol !== 'Admin' && u.activo === 1).map(u => u.rol))].map(rol => {
                let rLabel = rol;
                if (rLabel.startsWith('["') && rLabel.endsWith('"]')) rLabel = rLabel.slice(2, -2);
                if (rLabel.startsWith('[') && rLabel.endsWith(']')) rLabel = rLabel.slice(1, -1);
                return <option key={rol} value={rol}>{rLabel.charAt(0).toUpperCase() + rLabel.slice(1).replace(/"/g, '')}</option>;
              })}
            </select>
          </div>
          <button
            onClick={() => setShowCharts(!showCharts)}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gradient-info)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(59, 130, 246, 0.2)'
            }}
          >
            {showCharts ? '📊 Ocultar Gráficas' : '📈 Mostrar Gráficas'}
          </button>
          <button
            onClick={downloadPDF}
            style={{
              padding: '0.5rem 1.5rem',
              borderRadius: '8px',
              border: 'none',
              background: 'var(--gradient-success)',
              color: 'white',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'all 0.3s ease',
              boxShadow: '0 2px 8px rgba(16, 185, 129, 0.2)'
            }}
          >
            📄 Descargar PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashboard-loading">Cargando progreso...</div>
      ) : (
        <>
          {/* Sección de Gráficas */}
          {showCharts && (
            <div className="dashboard-charts-section">
              <h2 style={{ textAlign: 'center', color: 'var(--text-primary)', marginBottom: '2rem', fontSize: '1.8rem' }}>
                📊 Análisis Visual
              </h2>

              <div className="charts-grid">
                {/* Gráfica de Progreso por Usuario */}
                <div className="chart-card">
                  <h3>Progreso por Usuario</h3>
                  <p className="chart-description">Comparación del avance de cada usuario en sus cursos asignados</p>
                  <ProgressChart data={chartData.progressData} />
                </div>

                {/* Gráfica de Estados de Evaluaciones */}
                <div className="chart-card">
                  <h3>Estado de Evaluaciones</h3>
                  <p className="chart-description">Distribución de resultados en las evaluaciones realizadas</p>
                  <EvaluationPieChart data={chartData.evaluationData} />
                </div>

                {/* Gráfica de Completación por Cargo */}
                <div className="chart-card chart-card-wide">
                  <h3>Completación de Cursos por Cargo</h3>
                  <p className="chart-description">Cursos completados vs pendientes organizados por departamento</p>
                  <CourseCompletionChart data={chartData.completionByCargo} />
                </div>
              </div>
            </div>
          )}

          {/* Sección de Detalle por Usuario (existente) */}
          {nonAdminUsers.length === 0 ? (
            <div className="dashboard-error">No hay usuarios para mostrar.</div>
          ) : (
            <div className="dashboard-users-grid">
              {nonAdminUsers.map((user, idx) => {
                const cursos = progressByUser[user.nombre] || [];
                return (
                  <div key={user.id} className="dashboard-user-group">
                    <div className="dashboard-user-header" style={{ justifyContent: 'space-between', display: 'flex', alignItems: 'center' }}>
                      <span className="dashboard-user-icon">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="#3f51b5" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="12" cy="8" r="4" />
                          <path d="M4 20c0-3.3 2.7-6 6-6h4c3.3 0 6 2.7 6 6" />
                        </svg>
                      </span>
                      <h2 style={{ margin: 0, fontWeight: 700, fontSize: '1.18rem', color: '#2a3b4d', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{user.nombre}</h2>
                      <span className="dashboard-user-role" style={{ marginLeft: 8, fontSize: '0.98rem', fontWeight: 600, background: '#eaf1fa', color: '#3f51b5', borderRadius: 7, padding: '2px 10px', border: '1px solid #d2e3f7', display: 'inline-flex', alignItems: 'center', letterSpacing: '0.01em' }}>
                        {(() => {
                          let r = user.rol || 'Sin rol';
                          if (r.startsWith('["') && r.endsWith('"]')) r = r.slice(2, -2);
                          if (r.startsWith('[') && r.endsWith(']')) r = r.slice(1, -1);
                          return r.charAt(0).toUpperCase() + r.slice(1).replace(/"/g, '');
                        })()}
                      </span>
                    </div>
                    <div className="dashboard-user-count">
                      {cursos.length > 0 ? `${cursos.length} curso${cursos.length > 1 ? 's' : ''}` : 'Sin progreso aún'}
                    </div>
                    <div className="dashboard-grid">
                      {cursos.length > 0 ? cursos.map((item, cidx) => {
                        const videoProgress = item.video_completed ? 100 : 0;
                        const hasEval = item.evaluation_total && item.evaluation_total > 0;
                        const scorePercent = hasEval && item.evaluation_score !== null ? ((item.evaluation_score / item.evaluation_total) * 100).toFixed(1) : null;
                        const status = item.evaluation_status?.toLowerCase();
                        let estadoClase = 'estado-amarillo';
                        let estadoTexto = '🟡 Pendiente';
                        if (!hasEval && item.video_completed) {
                          estadoClase = 'estado-verde';
                          estadoTexto = '🟢 Completado';
                        } else if (hasEval && status === 'aprobado') {
                          estadoClase = 'estado-verde';
                          estadoTexto = '🟢 Aprobado';
                        } else if (hasEval && status === 'reprobado') {
                          estadoClase = 'estado-rojo';
                          estadoTexto = '🔴 Reprobado';
                        }
                        return (
                          <div key={cidx} className="dashboard-curso-card">
                            <div className="dashboard-progreso-header">
                              <h3>{item.curso || `Curso ID ${item.course_id}`}</h3>
                              <span className={`dashboard-estado-evaluacion dashboard-estado-${estadoClase.split('-')[1]}`}>{estadoTexto}</span>
                            </div>
                            <div className="dashboard-progreso-section">
                              <label>🎬 Video completado</label>
                              <div className="dashboard-barra-progreso">
                                <div className="dashboard-barra-interna" style={{ width: `${videoProgress}%` }}></div>
                              </div>
                              <span className="dashboard-porcentaje-label">{videoProgress}%</span>
                            </div>
                            <div className="dashboard-progreso-section">
                              <label>📊 Evaluación</label>
                              {hasEval ? (
                                <>
                                  <div className="dashboard-barra-progreso dashboard-bg-eval">
                                    <div className="dashboard-barra-interna dashboard-barra-eval" style={{ width: `${scorePercent}%` }}></div>
                                  </div>
                                  <span className="dashboard-porcentaje-label">{scorePercent}%</span>
                                </>
                              ) : (
                                <span style={{ color: '#888', fontStyle: 'italic', marginLeft: 8 }}>No tiene</span>
                              )}
                            </div>
                            <div className="dashboard-progreso-meta">
                              <span>🧠 Intentos usados: {item.attempts_used ?? '-'}</span>
                              <span>🕒 Última actualización: {item.updated_at ? new Date(item.updated_at).toLocaleString('es-CO', { hour12: false }) : '-'}</span>
                            </div>
                          </div>
                        );
                      }) : <div className="dashboard-error">Este usuario aún no tiene progreso registrado.</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Dashboard;

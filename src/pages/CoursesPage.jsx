import React, { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import "./CoursesPage.css";
import { BACKEND_URL } from '../utils/api';
import { Search, BookOpen, Clock, RotateCcw, Play } from "lucide-react";

const CoursesPage = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(6);

  const navigate = useNavigate();

  useEffect(() => {
    // Redirigir a Home si el usuario acaba de iniciar sesión
    if (window.location.pathname === "/coursespage") {
      window.location.href = "/home";
      return;
    }

    loadCourses();
  }, []);

  // Función para cargar cursos (refactorizada)
  const loadCourses = async () => {
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      const token = localStorage.getItem("authToken");

      if (!user || !user.rol || !token) {
        alert("⚠️ Debes iniciar sesión.");
        navigate("/login", { replace: true });
        return;
      }

      setLoading(true);
      const rol = user.rol;
      const response = await fetch(`${BACKEND_URL}/api/courses?rol=${encodeURIComponent(rol)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.status === 401) {
        alert("⚠️ Sesión expirada. Inicia sesión nuevamente.");
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        navigate("/login", { replace: true });
        return;
      }

      const data = await response.json();
      if (data.success) {
        setCourses(data.courses);
      } else {
        alert("Error al cargar cursos");
      }
    } catch (err) {
      console.error("Error loading courses:", err);
    } finally {
      setLoading(false);
    }
  };

  // Lógica de filtrado y paginación
  const filteredCourses = useMemo(() => {
    return courses.filter(course =>
      course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      course.description.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [courses, searchTerm]);

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);
  const currentCourses = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredCourses.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredCourses, currentPage, itemsPerPage]);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Función para asegurar que la URL esté en formato embed
  const ensureEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) return url;
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <div className="courses-body">
      <div className="courses-page">
        <header className="courses-header">
          <h1>Cursos Disponibles</h1>
          <p className="subtitle">Explora nuestro catálogo de capacitación seleccionado para tu cargo.</p>
        </header>

        <div className="courses-controls">
          <div className="search-wrapper">
            <Search className="search-icon" size={20} />
            <input
              type="text"
              placeholder="Buscar por título o descripción..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setCurrentPage(1);
              }}
            />
          </div>

          <div className="view-settings">
            <label>Mostrar:</label>
            <select value={itemsPerPage} onChange={(e) => {
              setItemsPerPage(parseInt(e.target.value));
              setCurrentPage(1);
            }}>
              <option value={3}>3 por página</option>
              <option value={6}>6 por página</option>
              <option value={9}>9 por página</option>
              <option value={12}>12 por página</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div className="courses-loading">
            <div className="spinner"></div>
            <p>Cargando cursos...</p>
          </div>
        ) : (
          <>
            <div className="courses-container">
              {currentCourses.length === 0 ? (
                <div className="no-courses-found">
                  <BookOpen size={48} opacity={0.5} />
                  <p>No se encontraron cursos que coincidan con tu búsqueda.</p>
                  {searchTerm && (
                    <button onClick={() => setSearchTerm("")} className="btn-clear">Limpiar búsqueda</button>
                  )}
                </div>
              ) : (
                currentCourses.map((course) => (
                  <div key={course.id} className="course-card compact-card">
                    <div className="course-card-image">
                      {(() => {
                        const videoUrl = course.videoUrl || course.video_url;
                        if (!videoUrl || videoUrl.trim() === "") {
                          return (
                            <div className="no-video-thumb">
                              <BookOpen size={40} />
                              <span>Sin video</span>
                            </div>
                          );
                        }

                        if (videoUrl.includes('youtube.com/') || videoUrl.includes('youtu.be/')) {
                          const videoId = videoUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([^?&]+)/)?.[1];
                          return videoId ? (
                            <img src={`https://img.youtube.com/vi/${videoId}/mqdefault.jpg`} alt={course.title} />
                          ) : (
                            <div className="video-placeholder"><Play size={30} /></div>
                          );
                        }

                        return <div className="video-placeholder"><Play size={30} /></div>;
                      })()}
                      <div className="play-overlay"><Play size={40} fill="white" /></div>
                    </div>

                    <div className="course-card-content">
                      <h3>{course.title}</h3>
                      <p className="description-short">{course.description}</p>

                      <div className="course-metadata">
                        <span title="Tiempo límite"><Clock size={16} /> {course.timeLimit || course.time_limit} min</span>
                        <span title="Intentos permitidos"><RotateCcw size={16} /> {course.attempts} intentos</span>
                      </div>

                      <button className="btn-view-course" onClick={() => navigate(`/detail/${course.id}`)}>
                        Ver curso
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {totalPages > 1 && (
              <div className="courses-pagination">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="page-nav"
                >
                  Anterior
                </button>

                <div className="page-numbers">
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => paginate(i + 1)}
                      className={currentPage === i + 1 ? "active" : ""}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="page-nav"
                >
                  Siguiente
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default CoursesPage;


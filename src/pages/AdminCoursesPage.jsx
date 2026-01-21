import React, { useState, useEffect } from "react";
import "./AdminCoursesPage.css";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, Users2, BarChart3, User, Info } from "lucide-react";
import { BACKEND_URL } from '../utils/api';
// Debug removido - versión simple

// Constantes para la API
const API_URL_INTERNAL = BACKEND_URL;

const AdminCoursesPage = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [cargoId, setCargoId] = useState(1);
  const [cargos, setCargos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [showEvaluation, setShowEvaluation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [attempts, setAttempts] = useState(1);
  const [timeLimit, setTimeLimit] = useState(30);
  const [editingCourse, setEditingCourse] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [showCourses, setShowCourses] = useState(false); // NUEVO
  const [videoFile, setVideoFile] = useState(null); // Nuevo estado para archivo
  const [currentPage, setCurrentPage] = useState(1); // NUEVO: para paginación
  const [itemsPerPage, setItemsPerPage] = useState(6); // NUEVO: elementos por página (6 para grid 3x2 o 2x3)
  const [searchTerm, setSearchTerm] = useState(""); // NUEVO: para filtrar cursos
  const [useFile, setUseFile] = useState(false); // Nuevo estado para alternar entre link y archivo
  const [loading, setLoading] = useState(false); // Estado para IA
  const [submitting, setSubmitting] = useState(false); // Estado para submit del formulario
  const [aiStatus, setAiStatus] = useState({}); // Estado para IA
  const [uploadSuccess, setUploadSuccess] = useState(''); // Mensaje de éxito
  const [uploadError, setUploadError] = useState(''); // Mensaje de error

  const API_URL_INTERNAL_INTERNAL = `${BACKEND_URL}/api`;
  const token = localStorage.getItem("authToken");
  const navigate = useNavigate();

  // Función para debug del sistema de videos
  // Debug removido - versión simple

  useEffect(() => {
    fetchCourses();
    fetchCargos();
  }, []);

  const fetchCargos = async () => {
    try {
      const response = await fetch(`${API_URL_INTERNAL}/api/cargos/para-cursos`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Filtrar cargos que sean "admin" o "Admin del sistema"
          const cargosFiltrados = data.cargos.filter(cargo => {
            const nombreLower = cargo.nombre.toLowerCase().trim();
            // Filtrar cualquier variante de admin
            return !nombreLower.includes('admin') &&
              !nombreLower.includes('administrador');
          });
          setCargos(cargosFiltrados);
          // Establecer el primer cargo como seleccionado por defecto
          if (cargosFiltrados.length > 0) {
            setCargoId(cargosFiltrados[0].id);
          }
        }
      }
    } catch (error) {
    }
  };

  const fetchCourses = () => {
    fetch(`${API_URL_INTERNAL}/api/courses`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })
      .then((res) => {
        if (res.status === 401) {
          alert("Sesión expirada. Inicia sesión nuevamente.");
          localStorage.removeItem("authToken");
          localStorage.removeItem("user");
          navigate("/login", { replace: true });
        }
        return res.json();
      })
      .then((data) => {
        if (data.success) setCourses(data.courses);
      })
      .catch(() => { });
  };

  const convertToEmbedUrl = (url) => {
    const match = url.match(/(?:youtu\.be\/|youtube\.com\/watch\?v=)([^&]+)/);
    return match ? `https://www.youtube.com/embed/${match[1]}` : null;
  };

  const convertToWatchUrl = (embedUrl) => {
    if (!embedUrl) return null;
    const match = embedUrl.match(/youtube\.com\/embed\/([^?&]+)/);
    return match ? `https://www.youtube.com/watch?v=${match[1]}` : embedUrl;
  };

  const ensureEmbedUrl = (url) => {
    if (!url) return null;
    if (url.includes("youtube.com/embed/")) {
      return url;
    }
    return convertToEmbedUrl(url);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const fileSizeMB = file.size / (1024 * 1024);
    const maxSizeMB = 100; // Límite del plan gratuito de Cloudinary

    // Validar tamaño del archivo
    if (fileSizeMB > maxSizeMB) {
      alert(`⚠️ El archivo de video es demasiado grande (${fileSizeMB.toFixed(2)} MB).\n\nEl tamaño máximo permitido es ${maxSizeMB} MB para el plan gratuito de Cloudinary.\n\nPor favor, reduce el tamaño del video o actualiza tu plan de Cloudinary.`);
      e.target.value = ''; // Limpiar el input
      setVideoFile(null);
      return;
    }

    // Validar que sea MP4
    if (file.type !== 'video/mp4' && !file.name.toLowerCase().endsWith('.mp4')) {
      alert('⚠️ Solo se permiten archivos de video MP4 para subir a Cloudinary.');
      e.target.value = '';
      setVideoFile(null);
      return;
    }

    setVideoFile(file);
    setUploadError(''); // Limpiar errores anteriores
  };

  // Nuevo handler para alternar entre enlace y archivo
  const handleUseFileChange = (value) => {
    setUseFile(value);
    if (value) {
      setVideoUrl(""); // Limpiar enlace si se va a usar archivo
    } else {
      setVideoFile(null); // Limpiar archivo si se va a usar enlace
    }
  };

  // Ref para verificar si el componente está montado
  const isMounted = React.useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return; // Prevenir múltiples clics

    // Para edición, no validar video si ya existe uno
    const hasExistingVideo = editingCourse && (videoUrl || videoFile);
    const hasNewVideo = !editingCourse && (videoUrl || videoFile);

    if (!title || !description || (!hasExistingVideo && !hasNewVideo)) {
      alert("Completa todos los campos y elige un link o archivo de video.");
      return;
    }

    setSubmitting(true);

    let formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("cargoId", cargoId);
    formData.append("attempts", attempts);
    formData.append("timeLimit", timeLimit);
    formData.append("evaluation", JSON.stringify(questions));


    // Manejar video - siempre enviar algo
    if (useFile && videoFile) {
      formData.append("videoFile", videoFile);
    } else if (videoUrl) {
      // Si es link de YouTube, convertir a embed
      if (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/')) {
        const embed = convertToEmbedUrl(videoUrl);
        if (!embed) {
          alert("Enlace YouTube inválido.");
          if (isMounted.current) setSubmitting(false);
          return;
        }
        formData.append("videoUrl", embed);
      } else {
        // Para otros tipos de video (archivos locales, etc.), usar la URL tal como está
        formData.append("videoUrl", videoUrl);
      }
    } else if (editingCourse) {
      // Si estamos editando y no se proporciona video nuevo, mantener el existente
      const existingCourse = courses.find(c => c.id === editingCourse);
      if (existingCourse) {
        const existingVideoUrl = existingCourse.videoUrl || existingCourse.video_url;
        if (existingVideoUrl) {
          formData.append("videoUrl", existingVideoUrl);
        }
      }
    } else {
      // Si no hay video, enviar string vacío
      formData.append("videoUrl", "");
    }

    try {
      const url = editingCourse ? `${API_URL_INTERNAL}/api/courses/${editingCourse}` : `${API_URL_INTERNAL}/api/courses`;
      const method = editingCourse ? "PUT" : "POST";

      let requestBody;
      let headers = {
        Authorization: `Bearer ${token}`,
      };

      if (editingCourse) {
        // Para editar, enviar JSON
        // Para edición, manejar la URL del video correctamente
        let finalVideoUrl = videoUrl;
        if (videoUrl && (videoUrl.includes('youtube.com/watch') || videoUrl.includes('youtu.be/'))) {
          // Convertir YouTube watch a embed
          const embed = convertToEmbedUrl(videoUrl);
          finalVideoUrl = embed || videoUrl;
        } else if (!videoUrl && editingCourse) {
          // Si no se proporciona video nuevo, mantener el existente
          const existingCourse = courses.find(c => c.id === editingCourse);
          finalVideoUrl = existingCourse?.videoUrl || existingCourse?.video_url || "";
        }

        requestBody = JSON.stringify({
          title,
          description,
          videoUrl: finalVideoUrl,
          cargoId: parseInt(cargoId),
          attempts: parseInt(attempts),
          timeLimit: parseInt(timeLimit),
          evaluation: questions
        });
        headers['Content-Type'] = 'application/json';
      } else {
        // Para crear, usar FormData
        requestBody = formData;
      }

      const res = await fetch(url, {
        method,
        headers,
        body: requestBody,
      });

      const data = await res.json();

      if (!isMounted.current) return;

      if (data.success) {
        if (!data.pendiente_aprobacion) fetchCourses();
        resetForm();

        // Mostrar mensaje igual que documentos
        let message = editingCourse ? "Curso actualizado exitosamente" : (data.pendiente_aprobacion ? "Curso enviado para aprobación. El SuperAdmin lo revisará." : "Curso creado exitosamente");
        if (data.cloudinaryUrl) {
          message += " - Video subido exitosamente a Cloudinary";
        }
        setUploadSuccess(message);
        setTimeout(() => {
          if (isMounted.current) {
            setShowModal(false);
            setUploadSuccess('');
          }
        }, 2500);
      } else {
        const errorMsg = data.message || data.error || 'Error al crear el curso';
        setUploadError(errorMsg);
        setTimeout(() => {
          if (isMounted.current) setUploadError('');
        }, 5000);
      }
    } catch (err) {
      console.error('Error creating course:', err);
      if (isMounted.current) {
        setUploadError('Error al crear el curso: ' + (err.message || 'Error desconocido'));
        setTimeout(() => {
          if (isMounted.current) setUploadError('');
        }, 5000);
      }
    } finally {
      if (isMounted.current) {
        setSubmitting(false);
      }
    }
  };

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setVideoUrl("");
    setVideoFile(null);
    setUseFile(false);
    setCargoId(1); // Cambiar a setCargoId y usar el ID del primer cargo por defecto
    setQuestions([]);
    setAttempts(1);
    setTimeLimit(30);
    setShowEvaluation(false);
    setEditingCourse(null);
    setUploadSuccess('');
    setUploadError('');
  };

  const handleAddQuestion = () => {
    setQuestions([...questions, { question: "", options: ["", "", "", ""], correctIndex: 0 }]);
  };

  const updateQuestionText = (i, val) => {
    const cp = [...questions];
    cp[i].question = val;
    setQuestions(cp);
  };

  const updateOption = (qi, oi, val) => {
    const cp = [...questions];
    cp[qi].options[oi] = val;
    setQuestions(cp);
  };

  const updateCorrectIndex = (qi, val) => {
    const cp = [...questions];
    cp[qi].correctIndex = parseInt(val);
    setQuestions(cp);
  };

  // Función para generar preguntas con IA antes de crear el curso
  const generateQuestionsForNewCourse = async () => {
    try {
      if (!title || !description) {
        alert('⚠️ Primero completa el título y descripción del curso');
        return;
      }

      setLoading(true);

      const token = localStorage.getItem("authToken");
      const user = JSON.parse(localStorage.getItem("user"));

      if (!user || user.rol !== 'Admin') {
        alert('⚠️ Solo los administradores pueden generar preguntas con IA');
        return;
      }

      // Preparar datos del curso para la IA
      let courseData = {
        title: title,
        description: description,
        contentType: 'text'
      };

      // Si hay video de YouTube, analizarlo
      if (videoUrl && !useFile) {
        try {

          const response = await fetch(`${API_URL_INTERNAL}/api/ai/analyze-youtube`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
              videoUrl: videoUrl,
              title: title,
              description: description,
              numQuestions: 5
            })
          });


          if (response.ok) {
            const data = await response.json();

            if (data.debug) {
            }

            // Convertir las preguntas al formato del formulario
            const formattedQuestions = data.questions.map(q => ({
              question: q.question,
              options: q.options,
              correctIndex: q.correctIndex
            }));


            setQuestions(formattedQuestions);
            setShowEvaluation(true);
            alert(`🎉 Se generaron ${data.questions.length} preguntas automáticamente basándose en el video de YouTube`);
            return;
          } else {
            const errorData = await response.json();
            throw new Error(`Error del servidor: ${errorData.message}`);
          }
        } catch (error) {
          alert(`⚠️ Error analizando video de YouTube: ${error.message}. Revisa la consola para más detalles.`);
        }
      }

      // Si es archivo de video, usar análisis específico
      if (useFile && videoFile) {
        try {
          // Determinar si es un archivo de video
          const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.mkv'];
          const fileExtension = videoFile.name.toLowerCase().substring(videoFile.name.lastIndexOf('.'));

          if (videoExtensions.includes(fileExtension)) {
            // Crear FormData para subir el archivo
            const formData = new FormData();
            formData.append('videoFile', videoFile);
            formData.append('title', title);
            formData.append('description', description);
            formData.append('numQuestions', '5');


            const response = await fetch(`${API_URL_INTERNAL}/api/ai/analyze-video-file`, {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${token}`
              },
              body: formData
            });


            if (response.ok) {
              const data = await response.json();

              const formattedQuestions = data.questions.map(q => ({
                question: q.question,
                options: q.options,
                correctIndex: q.correctIndex
              }));

              setQuestions(formattedQuestions);
              setShowEvaluation(true);
              alert(`🎉 Se generaron ${data.questions.length} preguntas automáticamente basándose en el contenido real del video`);
              return;
            } else {
              const errorData = await response.json();
              throw new Error(`Error analizando video: ${errorData.message || 'Error desconocido'}`);
            }
          }
        } catch (error) {
          alert(`⚠️ Error analizando el video: ${error.message}. Usando análisis básico...`);
          // Continuar con el análisis básico
        }
      }

      // Si es archivo de documento o solo texto, usar el endpoint general
      const response = await fetch(`${API_URL_INTERNAL}/api/ai/generate-questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          title: title,
          description: description,
          content: useFile && videoFile ? `Archivo: ${videoFile.name}` : '',
          contentType: useFile ? 'file' : 'text',
          numQuestions: 5
        })
      });

      if (response.ok) {
        const data = await response.json();

        // Convertir las preguntas al formato del formulario
        const formattedQuestions = data.questions.map(q => ({
          question: q.question,
          options: q.options,
          correctIndex: q.correctIndex
        }));

        setQuestions(formattedQuestions);
        setShowEvaluation(true);
        alert(`🎉 Se generaron ${data.questions.length} preguntas automáticamente basándose en el título y descripción`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error generando preguntas');
      }

    } catch (error) {
      alert(`❌ Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteCourse = async (id) => {
    const confirmDelete = window.confirm("¿Estás seguro de que deseas eliminar este curso?");
    if (!confirmDelete) return;

    if (!token) {
      alert("⚠️ Token no encontrado. Inicia sesión nuevamente.");
      navigate("/login", { replace: true });
      return;
    }

    try {
      const response = await fetch(`${API_URL_INTERNAL}/api/courses/${id}`, {
        method: "DELETE",
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
        alert("✅ Curso eliminado exitosamente.");
        fetchCourses();
      } else {
        alert(`❌ Error: ${data.message || "No se pudo eliminar el curso."}`);
      }
    } catch (error) {
      alert("❌ Error al eliminar el curso. Intenta nuevamente.");
    }
  };

  const handleEditCourse = async (course) => {
    setTitle(course.title);
    setDescription(course.description);

    const videoUrl = course.videoUrl || course.video_url;
    // Solo convertir a watch si es un embed de YouTube, mantener otros tipos de video como están
    if (videoUrl && videoUrl.includes('youtube.com/embed/')) {
      const watchUrl = convertToWatchUrl(videoUrl);
      setVideoUrl(watchUrl);
    } else {
      setVideoUrl(videoUrl || '');
    }

    // Buscar el cargo por nombre para obtener su ID
    const cargo = cargos.find(c => c.nombre === course.role);

    if (cargo) {
      setCargoId(cargo.id);
    } else if (cargos.length > 0) {
      // Si no encuentra el cargo, usar el primero disponible
      setCargoId(cargos[0].id);
    } else {
      alert('Error: No hay cargos disponibles');
      return;
    }
    setAttempts(course.attempts || 1);
    setTimeLimit(course.timeLimit || course.time_limit || 30);
    setEditingCourse(course.id);
    setShowEvaluation(true);

    if (course.evaluation && course.evaluation.length > 0) {
      setQuestions(course.evaluation);
    } else {
      try {
        const res = await fetch(`${API_URL_INTERNAL}/api/courses/${course.id}/questions`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json();
        if (data.success) {
          setQuestions(data.questions);
        } else {
          setQuestions([]);
        }
      } catch (err) {
        setQuestions([]);
      }
    }

    setUploadSuccess('');
    setUploadError('');
    setShowModal(true);
  };

  // --- DASHBOARD VISUAL ---
  const dashboardCards = [
    {
      title: "Gestión de Cursos",
      icon: <BookOpenCheck size={36} color="#2962ff" />,
      description: "Crea, edita y elimina cursos y evaluaciones.",
      route: "/admin-courses",
      enabled: true,
    },
    {
      title: "Bitácora",
      icon: <ClipboardList size={36} color="#43e97b" />,
      description: "Gestiona tareas y seguimiento de actividades.",
      route: "/AdminBitacora",
      enabled: true,
    },
    {
      title: "Cuentas",
      icon: <Users2 size={36} color="#ff9800" />,
      description: "Administra usuarios y permisos.",
      route: "/cuentas",
      enabled: true,
    },
    {
      title: "Dashboard",
      icon: <BarChart3 size={36} color="#00bcd4" />,
      description: "Visualiza el progreso general de la plataforma.",
      route: "/dashboard",
      enabled: true,
    },
    {
      title: "Perfil",
      icon: <User size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil de administrador.",
      route: "/perfil",
      enabled: true,
    },
  ];

  // --- Lógica de Paginación ---
  const filteredCourses = courses.filter(course =>
    course.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    course.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (course.role && course.role.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentCourses = filteredCourses.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  return (
    <div className="farmeo-admin-wrapper">
      <div className="farmeo-admin-content">
        <h1>Panel Administrador {editingCourse ? "(Editando)" : ""}</h1>
        <div className="admin-subtitle">
          Gestión de cursos (crear, editar o eliminar cursos de capacitación y evaluación)
        </div>

        <div className="admin-info-tip" title="Si el título, la descripción o el video no son coherentes o son contenido no relacionado, la IA generará preguntas de medicina/farmacia (porque la app es para una farmacia).">
          <Info size={18} />
          <div className="admin-info-popover">
            Si el título, la descripción o el video no son coherentes entre sí, o son canciones u otros contenidos no relacionados, la IA generará preguntas de medicina o de farmacia, ya que esta es una aplicación web para una farmacia.
          </div>
        </div>

        {/* Botones de debug para administradores */}
        {/* Debug removido - versión simple */}

        <form onSubmit={handleSubmit} className="admin-form">
          <div className="form-group">
            <label>Título</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ingresa el título del curso"
              required
            />
          </div>

          <div className="form-group">
            <label>Cargo/Departamento</label>
            <select value={cargoId} onChange={(e) => setCargoId(parseInt(e.target.value))} required>
              {cargos.map((cargo) => (
                <option key={cargo.id} value={cargo.id}>
                  {cargo.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Descripción</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe el contenido del curso"
              required
            />
          </div>

          {/* Selector para elegir entre link o archivo */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "2rem",
              background: "rgba(255,255,255,0.03)",
              borderRadius: "10px",
              padding: "1rem 1.5rem",
              margin: "1.2rem 0 1.5rem 0",
              border: "1px solid #333",
              boxShadow: "0 2px 8px rgba(0,0,0,0.05)"
            }}
          >
            <label style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#43e97b", cursor: "pointer" }}>
              <input
                type="radio"
                checked={!useFile}
                onChange={() => handleUseFileChange(false)}
                style={{ marginRight: "0.6rem", accentColor: "#43e97b", width: 18, height: 18 }}
              />
              Usar enlace de YouTube
            </label>
            <label style={{ display: "flex", alignItems: "center", fontWeight: 600, color: "#43e97b", cursor: "pointer" }}>
              <input
                type="radio"
                checked={useFile}
                onChange={() => handleUseFileChange(true)}
                style={{ marginRight: "0.6rem", accentColor: "#43e97b", width: 18, height: 18 }}
              />
              Subir archivo de video
            </label>
          </div>

          {/* Ambos inputs, solo uno visible */}
          <div style={{ display: useFile ? "none" : "block" }}>
            <label style={{ color: "#43e97b", fontWeight: 600, marginBottom: 6 }}>Enlace del Video (YouTube):</label>
            <input
              type="text"
              value={videoUrl}
              onChange={(e) => setVideoUrl(e.target.value)}
              placeholder="Pega el enlace de YouTube del curso"
              style={{
                background: "#23243a",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "0.5rem",
                marginBottom: "1rem"
              }}
            />
          </div>
          <div style={{ display: useFile ? "block" : "none" }}>
            <label style={{ color: "#43e97b", fontWeight: 600, marginBottom: 6 }}>Archivo de Video:</label>
            <input
              type="file"
              accept="video/*"
              onChange={handleFileChange}
              style={{
                background: "#23243a",
                color: "#fff",
                border: "1px solid #333",
                borderRadius: "8px",
                padding: "0.5rem",
                marginBottom: "1rem"
              }}
            />
            {videoFile && (
              <div style={{ marginTop: '0.5rem' }}>
                <p style={{ color: '#2962ff', marginTop: 0, marginBottom: '0.25rem' }}>
                  Archivo seleccionado: {videoFile.name}
                </p>
                <p style={{ color: '#888', fontSize: '0.85rem', marginTop: 0 }}>
                  Tamaño: {(videoFile.size / (1024 * 1024)).toFixed(2)} MB
                  (Máximo: 100 MB para plan gratuito de Cloudinary)
                </p>
              </div>
            )}
          </div>



          <button
            type="button"
            onClick={() => setShowEvaluation(!showEvaluation)}
            className="create-eval-button"
          >
            {showEvaluation ? "Ocultar Evaluación" : "Crear Evaluación"}
          </button>

          {/* 🤖 Botón para generar preguntas con IA antes de crear el curso */}
          <div style={{
            background: 'rgba(46, 204, 113, 0.1)',
            border: '1px solid #43e97b',
            borderRadius: '8px',
            padding: '1rem',
            margin: '1rem 0',
            textAlign: 'center'
          }}>
            <p style={{
              color: '#43e97b',
              margin: '0 0 0.5rem 0',
              fontWeight: '600',
              fontSize: '0.9rem'
            }}>
              🤖 Generación Automática de Preguntas con IA
            </p>
            <p style={{
              color: '#fff',
              margin: '0',
              fontSize: '0.8rem',
              opacity: 0.8
            }}>
              Completa el título y descripción, luego haz clic en el botón para generar preguntas automáticamente.
              <br />
              <strong>🎬 Videos de YouTube:</strong> Descarga, transcribe y analiza el contenido real
              <br />
              <strong>📁 Archivos MP4:</strong> Extrae audio, transcribe y analiza el contenido real
              <br />
              <em>⚠️ El procesamiento puede tomar varios minutos dependiendo de la duración del video</em>
            </p>
          </div>

          <button
            type="button"
            onClick={generateQuestionsForNewCourse}
            disabled={loading || !title || !description}
            className="ai-generate-btn"
            style={{
              background: 'var(--gradient-success)',
              color: 'white',
              marginTop: '1rem',
              marginBottom: '1rem'
            }}
          >
            {loading ? '🤖 Procesando video y generando preguntas...' : '🤖 Generar preguntas con IA'}
          </button>

          {showEvaluation && (
            <div className="evaluation-section">
              <h3>
                Evaluación
                {questions.length > 0 && (
                  <span style={{
                    color: '#43e97b',
                    fontSize: '0.9rem',
                    marginLeft: '1rem',
                    fontWeight: 'normal'
                  }}>
                    📝 {questions.length} preguntas generadas
                  </span>
                )}
              </h3>

              <label>Intentos permitidos:</label>
              <input
                type="number"
                value={attempts}
                onChange={(e) => setAttempts(parseInt(e.target.value))}
                min={1}
                required
              />

              <label>Tiempo límite (minutos):</label>
              <input
                type="number"
                value={timeLimit}
                onChange={(e) => setTimeLimit(parseInt(e.target.value))}
                min={1}
                required
              />

              {questions.map((q, i) => (
                <div key={i} className="question-block">
                  <label>Pregunta {i + 1}:</label>
                  <input
                    type="text"
                    value={q.question}
                    onChange={(e) => updateQuestionText(i, e.target.value)}
                    required
                  />
                  {q.options.map((opt, j) => (
                    <input
                      key={j}
                      type="text"
                      placeholder={`Opción ${j + 1}`}
                      value={opt}
                      onChange={(e) => updateOption(i, j, e.target.value)}
                      required
                    />
                  ))}
                  <label>Respuesta correcta:</label>
                  <select
                    value={q.correctIndex}
                    onChange={(e) => updateCorrectIndex(i, e.target.value)}
                  >
                    {[0, 1, 2, 3].map((idx) => (
                      <option key={idx} value={idx}>
                        Opción {idx + 1}
                      </option>
                    ))}
                  </select>
                </div>
              ))}

              <button type="button" onClick={handleAddQuestion}>
                + Agregar Pregunta
              </button>
            </div>
          )}

          <button type="submit" disabled={submitting}>
            {submitting ? (
              <>
                <span style={{ display: 'inline-block', marginRight: '8px' }}>
                  <div style={{
                    width: '16px',
                    height: '16px',
                    border: '2px solid rgba(255,255,255,0.3)',
                    borderTop: '2px solid white',
                    borderRadius: '50%',
                    animation: 'spin 0.8s linear infinite',
                    display: 'inline-block',
                    verticalAlign: 'middle'
                  }}></div>
                </span>
                {editingCourse ? "Guardando..." : "Creando..."}
              </>
            ) : (
              editingCourse ? "Guardar Cambios" : "Agregar Curso"
            )}
          </button>

          {editingCourse && (
            <button type="button" onClick={resetForm}>
              Cancelar
            </button>
          )}
        </form>

        <button
          type="button"
          onClick={() => setShowCourses(!showCourses)}
          className="toggle-courses-button"
        >
          {showCourses ? "Ocultar cursos creados" : "Mostrar cursos creados"}
        </button>

        {
          showCourses && (
            <div className="admin-course-list">
              <h2>Cursos Creados</h2>

              {/* Buscador y Selector de Cantidad */}
              <div className="course-list-controls" style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                gap: '1.5rem',
                flexWrap: 'wrap',
                marginBottom: '2.5rem',
                maxWidth: '900px',
                margin: '0 auto 2.5rem'
              }}>
                <div className="course-search-bar" style={{ flex: 1, minWidth: '300px' }}>
                  <input
                    type="text"
                    placeholder="🔍 Buscar curso por título, descripción o cargo..."
                    value={searchTerm}
                    onChange={(e) => {
                      setSearchTerm(e.target.value);
                      setCurrentPage(1); // Resetear a página 1 al buscar
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 20px',
                      borderRadius: '30px',
                      border: '1px solid var(--border-primary)',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      boxShadow: 'var(--shadow-small)'
                    }}
                  />
                </div>

                <div className="items-per-page-selector" style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
                  <label style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', fontWeight: '500' }}>Mostrar:</label>
                  <select
                    value={itemsPerPage}
                    onChange={(e) => {
                      setItemsPerPage(parseInt(e.target.value));
                      setCurrentPage(1);
                    }}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '12px',
                      background: 'var(--bg-card)',
                      color: 'var(--text-primary)',
                      border: '1px solid var(--border-primary)',
                      cursor: 'pointer',
                      outline: 'none'
                    }}
                  >
                    <option value={3}>3 cursos</option>
                    <option value={6}>6 cursos</option>
                    <option value={9}>9 cursos</option>
                    <option value={12}>12 cursos</option>
                  </select>
                </div>
              </div>

              {currentCourses.length > 0 ? (
                <>
                  <div className="admin-courses-grid">
                    {currentCourses.map((course) => (
                      <div key={course.id} className="admin-course-card compact">
                        <div className="card-header">
                          <h3>{course.title}</h3>
                          <span className="role-tag">{course.role}</span>
                        </div>

                        <div className="card-body">
                          <p className="course-desc-short">{course.description}</p>

                          <div className="course-meta-small">
                            <span>⏳ {course.timeLimit || course.time_limit} min</span>
                            <span>🔁 {course.attempts} intentos</span>
                          </div>

                          <div className="video-container-mini">
                            {(course.videoUrl || course.video_url) && (course.videoUrl || course.video_url).trim() !== '' ? (
                              (course.videoUrl || course.video_url).includes('youtube.com/embed/') ? (
                                <iframe
                                  src={course.videoUrl || course.video_url}
                                  title={course.title}
                                  width="100%"
                                  height="180"
                                  frameBorder="0"
                                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                  allowFullScreen
                                />
                              ) : (
                                <video
                                  src={(course.videoUrl || course.video_url) && (course.videoUrl || course.video_url).startsWith('http')
                                    ? (course.videoUrl || course.video_url)
                                    : `${BACKEND_URL}${course.videoUrl || course.video_url}`}
                                  controls
                                  width="100%"
                                  height="180"
                                  style={{ background: '#000' }}
                                >
                                  Tu navegador no soporta video.
                                </video>
                              )
                            ) : (
                              <div className="no-video-mini">
                                <span>⚠️ Sin video</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="course-actions-mini">
                          <button onClick={() => handleEditCourse(course)} title="Editar">✏️</button>
                          <button onClick={() => handleDeleteCourse(course.id)} title="Eliminar">🗑️</button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Paginación */}
                  {totalPages > 1 && (
                    <div className="pagination-controls">
                      <button
                        onClick={() => paginate(currentPage - 1)}
                        disabled={currentPage === 1}
                      >
                        Anterior
                      </button>

                      {[...Array(totalPages)].map((_, i) => (
                        <button
                          key={i + 1}
                          onClick={() => paginate(i + 1)}
                          className={currentPage === i + 1 ? 'active' : ''}
                        >
                          {i + 1}
                        </button>
                      ))}

                      <button
                        onClick={() => paginate(currentPage + 1)}
                        disabled={currentPage === totalPages}
                      >
                        Siguiente
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>
                  No se encontraron cursos que coincidan con la búsqueda.
                </div>
              )}
            </div>
          )
        }

        {/* Mensajes globales de éxito/error - igual que documentos */}
        {
          uploadSuccess && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: '#16a34a',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(22, 163, 74, 0.3)',
              zIndex: 1000,
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              ✅ {uploadSuccess}
            </div>
          )
        }
        {
          uploadError && (
            <div style={{
              position: 'fixed',
              top: '20px',
              right: '20px',
              background: '#dc2626',
              color: 'white',
              padding: '12px 20px',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
              zIndex: 1000,
              fontSize: '0.9rem',
              fontWeight: '500'
            }}>
              ❌ {uploadError}
            </div>
          )
        }
      </div>
    </div>
  );
};

export default AdminCoursesPage;

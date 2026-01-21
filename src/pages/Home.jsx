import React from "react";
import { useNavigate } from "react-router-dom";
import { BookOpenCheck, ClipboardList, Users2, BarChart3 } from "lucide-react";
import { FaGraduationCap, FaClipboardList, FaUser, FaBell, FaFileAlt, FaHistory } from "react-icons/fa";
import MyRequestsModal from "../components/MyRequestsModal";
import "./Home.css";

const Home = () => {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  if (!user || !user.rol) {
    navigate("/login");
    return null;
  }

  const isAdmin = user.rol === "Admin" || user.rol === "Administrador";
  const isSuperAdmin = user.rol === "SuperAdmin" || user.rol_detallado === "SuperAdmin";
  const [isRequestsModalOpen, setIsRequestsModalOpen] = React.useState(false);

  const myRequestsCard = {
    title: "Mis Solicitudes",
    icon: <FaHistory size={36} color="#9b59b6" />,
    description: "Seguimiento de tus archivos y cursos enviados.",
    action: () => setIsRequestsModalOpen(true),
  };

  // Tarjetas para SuperAdmin
  const superAdminCards = [
    {
      title: "Panel de Aprobaciones",
      icon: <FaBell size={36} color="#ef4444" />,
      description: "Aprueba o rechaza evidencias, cursos y documentos.",
      route: "/admin-aprobaciones",
    },
    {
      title: "Gestión de Cursos",
      icon: <BookOpenCheck size={36} color="#2962ff" />,
      description: "Crea, edita y elimina cursos y evaluaciones.",
      route: "/admin-courses",
    },
    {
      title: "Bitácora",
      icon: <FaClipboardList size={36} color="#43e97b" />,
      description: "Gestiona tareas y seguimiento de actividades.",
      route: "/AdminBitacora",
    },
    {
      title: "Cuentas",
      icon: <Users2 size={36} color="#ff9800" />,
      description: "Administra usuarios y permisos.",
      route: "/cuentas",
    },
    {
      title: "Dashboard",
      icon: <BarChart3 size={36} color="#00bcd4" />,
      description: "Visualiza el progreso general de la plataforma.",
      route: "/dashboard",
    },
    {
      title: "Perfil",
      icon: <FaUser size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil de administrador.",
      route: "/perfil",
    },
    {
      title: "Documentos",
      icon: <FaFileAlt size={36} color="#2962ff" />,
      description: "Accede a los documentos de la empresa.",
      route: "/admin-documentos",
    }
  ];

  // Tarjetas para admin
  const adminCards = [
    {
      title: "Gestión de Cursos",
      icon: <BookOpenCheck size={36} color="#2962ff" />,
      description: "Crea, edita y elimina cursos y evaluaciones.",
      route: "/admin-courses",
    },
    {
      title: "Bitácora",
      icon: <FaClipboardList size={36} color="#43e97b" />,
      description: "Gestiona tareas y seguimiento de actividades.",
      route: "/AdminBitacora",
    },
    {
      title: "Cuentas",
      icon: <Users2 size={36} color="#ff9800" />,
      description: "Administra usuarios y permisos.",
      route: "/cuentas",
    },
    {
      title: "Dashboard",
      icon: <BarChart3 size={36} color="#00bcd4" />,
      description: "Visualiza el progreso general de la plataforma.",
      route: "/dashboard",
    },
    {
      title: "Perfil",
      icon: <FaUser size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil de administrador.",
      route: "/perfil",
    },
    {
      title: "Documentos",
      icon: <FaFileAlt size={36} color="#2962ff" />,
      description: "Accede a los documentos de la empresa.",
      route: "/admin-documentos",
    },
    myRequestsCard
  ];

  // Tarjetas para usuario normal
  const userCards = [
    {
      title: "Mis Cursos",
      icon: <FaGraduationCap size={36} color="#2962ff" />,
      description: "Accede a los cursos disponibles para ti.",
      route: "/courses",
    },
    {
      title: "Bitácora",
      icon: <FaClipboardList size={36} color="#43e97b" />,
      description: "Consulta tus tareas y actividades asignadas.",
      route: "/bitacora",
    },
    {
      title: "Perfil",
      icon: <FaUser size={36} color="#607d8b" />,
      description: "Ver y editar tu perfil personal.",
      route: "/perfil",
    },
    {
      title: "Documentos",
      icon: <FaFileAlt size={36} color="#2962ff" />,
      description: "Accede a los documentos de la empresa.",
      route: "/documentos",
    },
    myRequestsCard
  ];

  const cards = isSuperAdmin ? superAdminCards : (isAdmin ? adminCards : userCards);

  return (
    <div className="home-dashboard-bg">
      <div className="home-dashboard-title">
        <h1>Bienvenido, {user.nombre}</h1>
        <p>Selecciona una opción para continuar</p>
      </div>
      <div className="home-dashboard-cards">
        {cards.map((card, idx) => (
          <div
            key={idx}
            className="home-dashboard-card"
            onClick={() => card.action ? card.action() : navigate(card.route)}
            style={{ cursor: 'pointer' }}
          >
            <div className="home-dashboard-icon">{card.icon}</div>
            <div className="home-dashboard-title-card">{card.title}</div>
            <div className="home-dashboard-desc">{card.description}</div>
          </div>
        ))}
      </div>
      <MyRequestsModal isOpen={isRequestsModalOpen} onClose={() => setIsRequestsModalOpen(false)} />
    </div>
  );
};

export default Home;
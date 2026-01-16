-- =============================================
-- Script de configuración para Multitenancy y SuperAdmin
-- Proyecto FARMEO - Nueva Arquitectura
-- =============================================

-- Configuración inicial
SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

-- Configuración de caracteres
/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

-- =============================================
-- MODIFICACIÓN DE TABLA USUARIOS
-- =============================================

-- Agregar campos para multitenancy
ALTER TABLE `usuarios` 
ADD COLUMN IF NOT EXISTS `organizacion_id` int(11) DEFAULT NULL AFTER `cargo_id`,
ADD COLUMN IF NOT EXISTS `admin_asignado_id` int(11) DEFAULT NULL AFTER `organizacion_id`,
ADD COLUMN IF NOT EXISTS `rol_detallado` enum('SuperAdmin','Admin','Empleado') DEFAULT 'Empleado' AFTER `rol`;

-- Agregar índices para mejor rendimiento
ALTER TABLE `usuarios`
ADD INDEX IF NOT EXISTS `idx_organizacion` (`organizacion_id`),
ADD INDEX IF NOT EXISTS `idx_admin_asignado` (`admin_asignado_id`),
ADD INDEX IF NOT EXISTS `idx_rol_detallado` (`rol_detallado`);

-- =============================================
-- TABLA: organizaciones
-- =============================================

CREATE TABLE IF NOT EXISTS `organizaciones` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(255) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `admin_principal_id` int(11) DEFAULT NULL COMMENT 'Admin que gestiona esta organización',
  `activa` tinyint(1) DEFAULT 1,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `nombre` (`nombre`),
  KEY `admin_principal_id` (`admin_principal_id`),
  CONSTRAINT `organizaciones_ibfk_1` FOREIGN KEY (`admin_principal_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: solicitudes_de_carga
-- =============================================

CREATE TABLE IF NOT EXISTS `solicitudes_de_carga` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `usuario_id` int(11) NOT NULL COMMENT 'Empleado que realiza la solicitud',
  `tipo_contenido` enum('foto','video','documento') NOT NULL,
  `archivo_url` text NOT NULL COMMENT 'URL del archivo subido',
  `archivo_nombre` varchar(255) DEFAULT NULL,
  `descripcion` text DEFAULT NULL COMMENT 'Descripción opcional del contenido',
  `estado` enum('pendiente','aprobada','rechazada') DEFAULT 'pendiente',
  `aprobado_por_id` int(11) DEFAULT NULL COMMENT 'SuperAdmin o Admin que aprobó/rechazó',
  `fecha_aprobacion` timestamp NULL DEFAULT NULL,
  `comentario_aprobacion` text DEFAULT NULL COMMENT 'Comentario del aprobador',
  `visible` tinyint(1) DEFAULT 0 COMMENT 'Solo visible si está aprobada',
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `usuario_id` (`usuario_id`),
  KEY `aprobado_por_id` (`aprobado_por_id`),
  KEY `estado` (`estado`),
  KEY `tipo_contenido` (`tipo_contenido`),
  CONSTRAINT `solicitudes_de_carga_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `solicitudes_de_carga_ibfk_2` FOREIGN KEY (`aprobado_por_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- TABLA: mensajes_chat
-- =============================================

CREATE TABLE IF NOT EXISTS `mensajes_chat` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `solicitud_id` int(11) DEFAULT NULL COMMENT 'ID de solicitud relacionada (opcional)',
  `de_usuario_id` int(11) NOT NULL COMMENT 'Usuario que envía el mensaje',
  `para_usuario_id` int(11) NOT NULL COMMENT 'Usuario que recibe el mensaje',
  `mensaje` text NOT NULL,
  `tipo` enum('aprobacion','notificacion','mensaje','sistema') DEFAULT 'mensaje',
  `leido` tinyint(1) DEFAULT 0,
  `created_at` timestamp NOT NULL DEFAULT current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `solicitud_id` (`solicitud_id`),
  KEY `de_usuario_id` (`de_usuario_id`),
  KEY `para_usuario_id` (`para_usuario_id`),
  KEY `leido` (`leido`),
  KEY `created_at` (`created_at`),
  CONSTRAINT `mensajes_chat_ibfk_1` FOREIGN KEY (`solicitud_id`) REFERENCES `solicitudes_de_carga` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_chat_ibfk_2` FOREIGN KEY (`de_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `mensajes_chat_ibfk_3` FOREIGN KEY (`para_usuario_id`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- ACTUALIZAR FOREIGN KEYS EN USUARIOS
-- =============================================

-- Agregar foreign keys para organizaciones y admin asignado
ALTER TABLE `usuarios`
ADD CONSTRAINT `usuarios_ibfk_organizacion` FOREIGN KEY (`organizacion_id`) REFERENCES `organizaciones` (`id`) ON DELETE SET NULL,
ADD CONSTRAINT `usuarios_ibfk_admin_asignado` FOREIGN KEY (`admin_asignado_id`) REFERENCES `usuarios` (`id`) ON DELETE SET NULL;

-- =============================================
-- DATOS INICIALES (OPCIONAL)
-- =============================================

-- Crear organización por defecto si no existe
INSERT IGNORE INTO `organizaciones` (`id`, `nombre`, `descripcion`, `activa`) VALUES
(1, 'Organización Principal', 'Organización por defecto del sistema', 1);

-- Actualizar usuario admin existente a SuperAdmin si existe
UPDATE `usuarios` 
SET `rol_detallado` = 'SuperAdmin', `rol` = 'SuperAdmin'
WHERE `rol` = 'Admin' AND `id` = 1
LIMIT 1;

COMMIT;

-- =============================================
-- NOTAS DE USO
-- =============================================
-- 1. Los usuarios con rol_detallado='SuperAdmin' tienen control total
-- 2. Los usuarios con rol_detallado='Admin' gestionan su organización
-- 3. Los usuarios con rol_detallado='Empleado' se vinculan a un Admin
-- 4. Las solicitudes_de_carga requieren aprobación antes de ser visibles
-- 5. El chat interno permite comunicación entre usuarios del sistema

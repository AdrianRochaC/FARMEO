:5173/#/admin-courses:1 Error handling response: TypeError: Cannot read properties of undefined (reading 'ext_css')
    at chrome-extension://aoognjkkhapcjkfnakpddcciddcfbjcd/content-scripts/isolated.js:2:18Entender este error
:5173/#/admin-courses:1 Unchecked runtime.lastError: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was receivedEntender este error
16:5173/#/admin-courses:1 Uncaught (in promise) Error: A listener indicated an asynchronous response by returning true, but the message channel closed before a response was received-- =============================================
-- Script para añadir soporte de múltiples cargos a cursos
-- Ejecuta este script en tu base de datos
-- =============================================
-- 1. Crear tabla intermedia para relacionar cursos con múltiples cargos
CREATE TABLE IF NOT EXISTS `course_targets` (
    `id` int(11) NOT NULL AUTO_INCREMENT,
    `course_id` int(11) NOT NULL,
    `cargo_id` int(11) NOT NULL,
    PRIMARY KEY (`id`),
    KEY `course_id` (`course_id`),
    KEY `cargo_id` (`cargo_id`),
    CONSTRAINT `course_targets_ibfk_1` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE,
    CONSTRAINT `course_targets_ibfk_2` FOREIGN KEY (`cargo_id`) REFERENCES `cargos` (`id`) ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
-- 2. Migrar datos existentes de courses a course_targets
-- (Solo si ya tienes cursos creados)
INSERT INTO `course_targets` (`course_id`, `cargo_id`)
SELECT c.id,
    cg.id
FROM `courses` c
    INNER JOIN `cargos` cg ON c.role = cg.nombre
WHERE c.role IS NOT NULL
    AND c.role != '';
-- 3. Modificar la columna 'role' para que acepte NULL (opcional, pero recomendado)
ALTER TABLE `courses`
MODIFY `role` varchar(50) DEFAULT NULL;
-- =============================================
-- VERIFICACIÓN
-- =============================================
-- Ejecuta esto para verificar que todo funcionó:
SELECT c.id,
    c.title,
    GROUP_CONCAT(cg.nombre SEPARATOR ', ') as cargos_asignados
FROM courses c
    LEFT JOIN course_targets ct ON c.id = ct.course_id
    LEFT JOIN cargos cg ON ct.cargo_id = cg.id
GROUP BY c.id;
SELECT '✅ Script ejecutado exitosamente. Tabla course_targets creada.' as status;
-- Fix: Permitir que la columna 'role' acepte NULL
-- Esto es necesario para el sistema de múltiples cargos
ALTER TABLE `courses`
MODIFY `role` varchar(50) DEFAULT NULL;
-- Verificar que funcionó
DESCRIBE courses;
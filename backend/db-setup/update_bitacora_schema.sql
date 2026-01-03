-- SQL Migration: Add evidence columns to bitacora_global
ALTER TABLE bitacora_global
ADD COLUMN evidencia_inicial_url TEXT DEFAULT NULL,
    ADD COLUMN evidencia_final_url TEXT DEFAULT NULL;
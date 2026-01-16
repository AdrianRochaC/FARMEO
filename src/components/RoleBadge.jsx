import React, { memo } from 'react';
import './RoleBadge.css';

const RoleBadge = memo(() => {
  // Obtener el rol del usuario de manera eficiente
  const user = JSON.parse(localStorage.getItem('user') || 'null');
  const userRole = user?.rol || 'Empleado';

  // Determinar si es administrador
  // Determinar roles
  const isSuperAdmin = userRole === 'SuperAdmin' || user?.rol_detallado === 'SuperAdmin';
  const isAdmin = userRole === 'Admin' || userRole === 'Admin del Sistema';

  // Configuración simple
  let config;
  if (isSuperAdmin) {
    config = {text: 'SuperAdministrador', className: 'superadmin' };
  } else if (isAdmin) {
    config = {text: 'Administrador', className: 'admin' };
  } else {
    config = {text: 'Empleado', className: 'employee' };
  }

  return (
    <div className={`role-badge ${config.className}`}>
      <span className="role-icon">{config.icon}</span>
      <span className="role-text">{config.text}</span>
    </div>
  );
});

RoleBadge.displayName = 'RoleBadge';

export default RoleBadge;

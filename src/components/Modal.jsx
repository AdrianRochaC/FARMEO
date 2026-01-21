import React from 'react';
import './Modal.css';

const Modal = ({ isOpen, onClose, title, children, className = "" }) => {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className={`modal-window ${className}`} onClick={e => e.stopPropagation()}>
        <div className="farmeo-modal-header">
          <h2>{title}</h2>
          <button className="modal-close" onClick={onClose}>&times;</button>
        </div>
        <div className="farmeo-modal-content">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal; 
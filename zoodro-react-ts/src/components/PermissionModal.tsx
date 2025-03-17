import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faTimes } from '@fortawesome/free-solid-svg-icons';

interface PermissionModalProps {
  onClose: () => void;
  onRetry: () => void;
}

const PermissionModal: React.FC<PermissionModalProps> = ({ onClose, onRetry }) => {
  return (
    <div className="modal-backdrop">
      <div className="modal-container">
        <div className="modal-header">
          <h2>دسترسی به موقعیت مکانی</h2>
          <button className="close-button" onClick={onClose}>×</button>
        </div>
        
        <div className="modal-body">
          <p>
            برای استفاده بهتر از این برنامه، لطفاً اجازه دسترسی به موقعیت مکانی خود را بدهید.
          </p>
          <p>
            با این کار می‌توانیم پیشنهادات نزدیک به شما را نمایش دهیم.
          </p>
        </div>
        
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose}>بعداً</button>
          <button className="apply-button" onClick={onRetry}>اجازه دسترسی</button>
        </div>
      </div>
    </div>
  );
};

export default PermissionModal; 
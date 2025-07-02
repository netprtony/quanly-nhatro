import React, { useState, useEffect } from "react";

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showConfirm = false,
  onConfirm,
}) => {
  const [isVisible, setIsVisible] = useState(isOpen);
  const [animationState, setAnimationState] = useState("hidden");
  const [shake, setShake] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      requestAnimationFrame(() => {
        setAnimationState("fade-in");
      });
    } else {
      setAnimationState("fade-out");
      setTimeout(() => setIsVisible(false), 250);
    }
  }, [isOpen]);

  const handleBackdropClick = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500); // End shake after 0.5s
  };

  if (!isVisible) return null;

  return (
    <div
      className={`modal fade ${animationState === "fade-in" ? "show d-block" : ""}`}
      style={{ backgroundColor: "rgba(0, 0, 0, 0.5)", backdropFilter: "blur(4px)" }}
      onClick={handleBackdropClick}
    >
      <div
        className={`modal-dialog modal-dialog-centered modal-lg ${
          shake ? "animate__animated animate__shakeX" : ""
        }`}
        style={{ maxHeight: "90vh" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="modal-content">
          <div className="modal-header">
            <h5 className="modal-title">{title}</h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>
          <div className="modal-body" style={{ maxHeight: "60vh", overflowY: "auto" }}>
            {children}
          </div>
          <div className="modal-footer">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
            >
              Đóng
            </button>
            {showConfirm && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={onConfirm}
              >
                Xác nhận
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Modal;
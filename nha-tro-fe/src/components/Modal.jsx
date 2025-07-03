import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import "animate.css";

const backdropVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
};

const modalVariants = {
  hidden: { opacity: 0, y: "-20%" },
  visible: { opacity: 1, y: "0%" },
  exit: { opacity: 0, y: "-20%" },
};

const Modal = ({
  isOpen,
  onClose,
  title,
  children,
  showConfirm = false,
  onConfirm,
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal fade show d-block"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(4px)",
            zIndex: 1050,
          }}
          variants={backdropVariants}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="modal-dialog modal-dialog-centered modal-lg"
            style={{ maxHeight: "90vh" }}
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            transition={{ duration: 0.3 }}
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
                />
              </div>
              <div
                className="modal-body"
                style={{ maxHeight: "60vh", overflowY: "auto" }}
              >
                {children}
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={onClose}>
                  Đóng
                </button>
                {showConfirm && (
                  <button className="btn btn-primary" onClick={onConfirm}>
                    Xác nhận
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default Modal;

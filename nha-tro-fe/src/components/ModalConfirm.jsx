import React from "react";
import PropTypes from "prop-types";
import { motion, AnimatePresence } from "framer-motion";

export default function ModalConfirm({
  isOpen,
  onClose,
  onConfirm,
  title = "Xác nhận",
  message = "Bạn có chắc chắn muốn tiếp tục?",
  confirmText = "Đồng ý",
  cancelText = "Hủy",
}) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="modal-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            zIndex: 1050,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backdropFilter: "blur(2px)",
          }}
          onClick={onClose}
        >
          <motion.div
            className="modal-content-custom"
            initial={{ y: "-30%", opacity: 0 }}
            animate={{ y: "0%", opacity: 1 }}
            exit={{ y: "-30%", opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#fff",
              padding: "24px",
              borderRadius: "12px",
              width: "90%",
              maxWidth: "400px",
              boxShadow: "0 10px 30px rgba(0,0,0,0.2)",
            }}
          >
            <h5 className="mb-3">{title}</h5>
            <p>{message}</p>
            <div className="d-flex justify-content-end gap-2 mt-4">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={onClose} // Gọi hàm đóng modal khi bấm Hủy
              >
                {cancelText || "Hủy"}
              </button>
              <button className="btn btn-danger" onClick={onConfirm}>
                {confirmText}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

ModalConfirm.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.string,
  message: PropTypes.string,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
};

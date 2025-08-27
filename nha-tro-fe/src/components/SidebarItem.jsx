import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";
export default function SidebarItem({ icon, label, path, dropdown, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Kiểm tra active cho item chính
  const isActive = path && location.pathname === path;

  // Kiểm tra active cho dropdown con
  const isChildActive = dropdown && children.some(child => location.pathname === child.path);

  const handleClick = () => {
    if (dropdown) {
      setOpen(!open);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div>
      {/* ITEM CHA */}
      <div
        className={`d-flex align-items-center justify-content-between py-2 px-2 rounded sidebar-item 
          ${isActive ? "text-primary fw-bold" : isChildActive ? "text-primary" : "text-dark"}`}
        onClick={handleClick}
        style={{ cursor: "pointer", transition: "background 0.2s" }}
      >
        <div className="d-flex align-items-center">
          <img
            src={`/images/icons/${icon}`}
            alt={label}
            width={20}
            height={20}
            className="me-2"
          />
          <span>{label}</span>
        </div>
        {dropdown && (
          open ? <FaChevronUp size={12} /> : <FaChevronDown size={12} />
        )}
      </div>

      {/* DROPDOWN CHILDREN */}
      {dropdown && (
        <div
          className="dropdown-children overflow-hidden"
          style={{
            maxHeight: open ? `${children.length * 40}px` : "0",
            transition: "max-height 0.3s ease",
          }}
        >
          {children.map((item, index) => {
            const childActive = location.pathname === item.path;
            return (
              <div
                key={index}
                className={`ps-4 py-2 sidebar-child-item 
                  ${childActive ? "bg-light text-primary fw-bold" : "text-secondary"}`}
                style={{
                  cursor: "pointer",
                  borderRadius: 4,
                  transition: "background 0.2s",
                }}
                onClick={() => navigate(item.path)}
              >
                {item.label}
              </div>
            );
          })}
        </div>
      )}

      {/* CSS */}
      <style>{`
        .sidebar-item:hover:not(.text-primary) {
          background: #f3f4f6; /* hover cha */
        }
        .sidebar-child-item:hover:not(.bg-light) {
          background: #f9fafb; /* hover con */
        }
      `}</style>
    </div>
  );
}
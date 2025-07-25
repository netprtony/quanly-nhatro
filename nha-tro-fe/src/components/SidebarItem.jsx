import { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function SidebarItem({ icon, label, path, dropdown, children }) {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const handleClick = () => {
    if (dropdown) {
      setOpen(!open);
    } else if (path) {
      navigate(path);
    }
  };

  return (
    <div>
      <div
        className="d-flex align-items-center justify-content-between py-2 px-2 rounded"
        onClick={handleClick}
        style={{ cursor: "pointer" }}
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
          <i className={`fas fa-chevron-${open ? "up" : "down"}`} />
        )}
      </div>

      {dropdown && (
        <div
          className="dropdown-children overflow-hidden transition-all"
          style={{
            maxHeight: open ? `${children.length * 40}px` : "0",
            transition: "max-height 0.3s ease",
          }}
        >
          {children.map((item, index) => (
            <div
              key={index}
              className="ps-4 py-2 text-secondary hover:text-dark"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

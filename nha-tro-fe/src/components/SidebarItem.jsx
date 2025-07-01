import React, { useState } from "react";
import { Link } from "react-router-dom";

const SidebarItem = ({ iconClass, label, dropdown, children }) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="mb-2">
      <div
        className={`d-flex align-items-center justify-content-between px-3 py-2 sidebar-item ${
          open ? "active" : ""
        }`}
        onClick={() => dropdown && setOpen(!open)}
        style={{ cursor: dropdown ? "pointer" : "default" }}
      >
        <div className="d-flex align-items-center gap-2">
          <i className={iconClass}></i>
          <span>{label}</span>
        </div>
        {dropdown && (
          open ? <i className="fas fa-chevron-up" style={{ fontSize: "12px" }} />
               : <i className="fas fa-chevron-down" style={{ fontSize: "12px" }} />
        )}
      </div>
      {open && dropdown && (
        <ul className="list-unstyled ps-4">
          {children?.map((child, index) => (
            <li key={index} className="py-1 text-muted">
              <Link to={child.path} className="text-decoration-none text-muted">
                {child.label}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default SidebarItem;

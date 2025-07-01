import React from 'react';
const Header = () => {
  return (
    <nav className="navbar navbar-expand-lg navbar-light bg-light">
      <div className="container-fluid">
        <a className="navbar-brand" href="#">
          <img src="/logo.png" alt="Logo" width="30" height="24" className="d-inline-block align-text-top" />
        </a>
        <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav" aria-controls="navbarNav" aria-expanded="false" aria-label="Toggle navigation">
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav">
            <li className="nav-item">
              <a className="nav-link active" href="#">Home</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Explore</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">My Accounts</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Accountants</a>
            </li>
            <li className="nav-item">
              <a className="nav-link" href="#">Stakeholders</a>
            </li>
          </ul>
        </div>
        <div>
          <a href="#" className="text-muted me-2">?</a>
          <a href="#" className="text-muted">?</a>
        </div>
      </div>
    </nav>
  );
};

export default Header;
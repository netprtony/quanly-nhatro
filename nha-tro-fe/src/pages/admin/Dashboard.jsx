import AdminLayout from "/src/layouts/AdminLayout.jsx";

export default function Dashboard() {
  return (
    <AdminLayout>
      <h2 className="mb-4">Tổng quan hệ thống</h2>
      <div className="row">
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>Tổng số phòng</h5>
            <p className="fs-3 fw-bold text-primary">24</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>Khách đang ở</h5>
            <p className="fs-3 fw-bold text-success">18</p>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card shadow-sm p-3">
            <h5>Doanh thu tháng</h5>
            <p className="fs-3 fw-bold text-warning">12,500,000₫</p>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}

import SidebarItem from "./SidebarItem.jsx";

export default function Sidebar() {
  return (
    <div className="sidebar bg-white border-end p-3" style={{ width: "220px", height: "100vh" }}>
      <SidebarItem icon="dashboard.svg" label="Dashboard" path="/admin/dashboard" />

      <SidebarItem icon="building.svg" label="Phòng" dropdown children={[
        { label: "Phòng trọ", path: "/admin/rooms" },
        { label: "Loại Phòng", path: "/admin/type-rooms" }
      ]} />

      <SidebarItem icon="user.svg" label="Tài khoản" dropdown children={[
        { label: "Tài khoản", path: "/admin/accounts" },
      ]} />

      <SidebarItem icon="tenant.svg" label="Khách Thuê" dropdown children={[
        { label: "Khách Thuê", path: "/admin/tenants" },
        { label: "Quản lý đặt phòng online", path: "/admin/reservations" }
      ]} />

      <SidebarItem icon="contract.svg" label="Hợp Đồng" dropdown children={[
        { label: "Hợp Đồng", path: "/admin/contracts" },
      ]} />

      <SidebarItem icon="electricity.svg" label="Dịch vụ" dropdown children={[
        { label: "Dịch vụ khác", path: "/admin/electricity" },
        { label: "Công tơ điện", path: "/admin/electricity" }
      ]} />

      <SidebarItem icon="receipt.svg" label="Hóa Đơn" dropdown children={[
        { label: "Hóa đơn", path: "/admin/invoices" },
        { label: "Chi tiết hóa đơn", path: "/admin/invoice-details" },
        { label: "Thanh toán", path: "/admin/payments" }
      ]} />
      <SidebarItem icon="device.svg" label="Thiết bị" dropdown children={[
        { label: "Quản lý thiết bị", path: "/admin/devices" },

      ]} />
      <SidebarItem icon="settings.svg" label="Cài Đặt" dropdown children={[
        { label: "Cài đặt chung", path: "/admin/settings" },
        { label: "Sao lưu dữ liệu", path: "/admin/backup" },
        { label: "Khôi phục dữ liệu", path: "/admin/restore" }
      ]} />
    </div>
  );
}

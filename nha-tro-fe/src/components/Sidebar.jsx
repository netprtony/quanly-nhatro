import SidebarItem from "./SidebarItem.jsx";

export default function Sidebar() {
  return (
    <div className="sidebar bg-white border-end p-3" style={{ width: "220px", height: "100vh" }}>
      <SidebarItem iconClass="fas fa-tachometer-alt" label="Dashboard" />
      
      <SidebarItem iconClass="fas fa-building" label="Phòng" dropdown children={[
        { label: "Phòng trọ", path: "/admin/rooms" },
        { label: "Loại Phòng", path: "/admin/room-types" }
      ]} />

      <SidebarItem iconClass="fas fa-user" label="Tài khoản" dropdown children={[
        { label: "Tài khoản", path: "/admin/users" },
        { label: "Add", path: "/admin/users/add" }
      ]} />

      <SidebarItem iconClass="fas fa-users" label="Khách Thuê" dropdown children={[
        { label: "Khách Thuê", path: "/admin/tenants" },
        { label: "Add New", path: "/admin/tenants/add" }
      ]} />

      <SidebarItem iconClass="fas fa-handshake" label="Hợp Đồng" dropdown children={[
        { label: "Hợp Đồng", path: "/admin/contracts" },
        { label: "Monthly", path: "/admin/contracts/monthly" }
      ]} />

      <SidebarItem iconClass="fas fa-bolt" label="Điện" dropdown children={[
        { label: "Số điện theo phòng", path: "/admin/electricity" },
        { label: "Reorder", path: "/admin/electricity/reorder" }
      ]} />

      <SidebarItem iconClass="fas fa-ticket" label="Phiếu Thu" dropdown children={[
        { label: "Phiếu thu", path: "/admin/receipts" },
        { label: "Chi tiết phiếu thu", path: "/admin/receipts/detail" }
      ]} />

      <SidebarItem iconClass="fas fa-cog" label="Cài Đặt" dropdown children={[
        { label: "Cài đặt chung", path: "/admin/settings" },
        { label: "Cài đặt nâng cao", path: "/admin/settings/advanced" }
      ]} />
    </div>
  );
}

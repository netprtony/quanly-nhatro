import SidebarItem from "./SidebarItem.jsx";

export default function Sidebar() {
  return (
    <div className="sidebar bg-white border-end p-3" style={{ width: "220px", height: "100vh" }}>
      <SidebarItem iconClass="fas fa-tachometer-alt" label="Dashboard" path="/dashboard" />
      
      <SidebarItem iconClass="fas fa-building" label="Phòng" dropdown children={[
        { label: "Phòng trọ", path: "/rooms" },
        { label: "Loại Phòng", path: "/room-types" }
      ]} />

      <SidebarItem iconClass="fas fa-user" label="Tài khoản" dropdown children={[
        { label: "Tài khoản", path: "/users" },
        { label: "Add", path: "/users/add" }
      ]} />

      <SidebarItem iconClass="fas fa-users" label="Khách Thuê" dropdown children={[
        { label: "Khách Thuê", path: "/tenants" },
        { label: "Add New", path: "/tenants/add" }
      ]} />

      <SidebarItem iconClass="fas fa-handshake" label="Hợp Đồng" dropdown children={[
        { label: "Hợp Đồng", path: "/contracts" },
        { label: "Monthly", path: "/contracts/monthly" }
      ]} />

      <SidebarItem iconClass="fas fa-bolt" label="Điện" dropdown children={[
        { label: "Số điện theo phòng", path: "/electricity" },
        { label: "Reorder", path: "/electricity/reorder" }
      ]} />

      <SidebarItem iconClass="fas fa-ticket" label="Phiếu Thu" dropdown children={[
        { label: "Phiếu thu", path: "/receipts" },
        { label: "Chi tiết phiếu thu", path: "/receipts/detail" }
      ]} />

      <SidebarItem iconClass="fas fa-cog" label="Cài Đặt" dropdown children={[
        { label: "Cài đặt chung", path: "/settings" },
        { label: "Cài đặt nâng cao", path: "/settings/advanced" }
      ]} />
    </div>
  );
}

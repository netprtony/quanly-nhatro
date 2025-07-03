import SidebarItem from "./SidebarItem.jsx";

export default function Sidebar() {
  return (
    <div className="sidebar bg-white border-end p-3" style={{ width: "220px", height: "100vh" }}>
      <SidebarItem icon="dashboard.svg" label="Dashboard" path="/dashboard" />

      <SidebarItem icon="building.svg" label="Phòng" dropdown children={[
        { label: "Phòng trọ", path: "/rooms" },
        { label: "Loại Phòng", path: "/room-types" }
      ]} />

      <SidebarItem icon="user.svg" label="Tài khoản" dropdown children={[
        { label: "Tài khoản", path: "/users" },
        { label: "Add", path: "/users/add" }
      ]} />

      <SidebarItem icon="tenant.svg" label="Khách Thuê" dropdown children={[
        { label: "Khách Thuê", path: "/tenants" },
        { label: "Add New", path: "/tenants/add" }
      ]} />

      <SidebarItem icon="contract.svg" label="Hợp Đồng" dropdown children={[
        { label: "Hợp Đồng", path: "/contracts" },
        { label: "Monthly", path: "/contracts/monthly" }
      ]} />

      <SidebarItem icon="electricity.svg" label="Điện" dropdown children={[
        { label: "Số điện theo phòng", path: "/electricity" },
        { label: "Reorder", path: "/electricity/reorder" }
      ]} />

      <SidebarItem icon="receipt.svg" label="Phiếu Thu" dropdown children={[
        { label: "Phiếu thu", path: "/receipts" },
        { label: "Chi tiết phiếu thu", path: "/receipts/detail" }
      ]} />

      <SidebarItem icon="settings.svg" label="Cài Đặt" dropdown children={[
        { label: "Cài đặt chung", path: "/settings" },
        { label: "Cài đặt nâng cao", path: "/settings/advanced" }
      ]} />
    </div>
  );
}

import { useUser } from "../contexts/UserContext";
import { Navigate } from "react-router-dom";

export default function GuestRoute({ children }) {
  const { currentUser } = useUser();

  if (currentUser) {
    // Nếu là admin, chuyển hướng về dashboard admin
    if (currentUser.role === "ADMIN") return <Navigate to="/admin/dashboard" />;
    // Nếu là user thường, chuyển hướng về trang home (hoặc trang user riêng)
    return <Navigate to="/home" />;
  }

  return children;
}

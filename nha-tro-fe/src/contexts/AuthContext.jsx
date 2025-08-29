import { createContext, useContext } from "react";
import { useUser } from "./UserContext";

// Tạo AuthContext
export const AuthContext = createContext();

// Provider cho AuthContext, sử dụng dữ liệu từ UserContext
export const AuthProvider = ({ children }) => {
  const { currentUser, login, logout } = useUser();

  return (
    <AuthContext.Provider value={{ user: currentUser, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook để sử dụng AuthContext
export const useAuth = () => {
  return useContext(AuthContext);
};
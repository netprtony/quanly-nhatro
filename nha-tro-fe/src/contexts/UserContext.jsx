import { createContext, useContext, useEffect, useState } from "react";

const UserContext = createContext();

export const UserProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);

  // Tải user từ localStorage khi load trang
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setCurrentUser(JSON.parse(storedUser));
    }
  }, []);

  const login = (userData) => {
  localStorage.setItem("user", JSON.stringify(userData));
  setCurrentUser(userData);
};

  const logout = () => {
    localStorage.removeItem("user");
    setCurrentUser(null);
  };

  return (
    <UserContext.Provider value={{ currentUser, login, logout }}>
      {children}
    </UserContext.Provider>
  );
};

// Custom hook để gọi ở các component
export const useUser = () => useContext(UserContext);

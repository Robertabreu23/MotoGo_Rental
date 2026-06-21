import { createContext, useContext, useState } from 'react';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [role, setRole] = useState(null); // 'cliente' | 'operador' | 'admin' | null
  const [user, setUser] = useState(null);

  const login = (selectedRole) => {
    setRole(selectedRole);
    setUser({
      name: 'Juan Martínez',
      initials: 'JM',
      email: 'juan@correo.com',
    });
  };

  const logout = () => {
    setRole(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ role, user, login, logout, setRole }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

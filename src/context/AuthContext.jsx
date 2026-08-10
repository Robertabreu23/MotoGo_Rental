import { createContext, useContext, useEffect, useState } from 'react';
import { clearToken, getToken, onUnauthorized, setToken } from '../api/client.js';
import { getMe, login as loginRequest, loginWithGoogle as loginWithGoogleRequest, register as registerRequest } from '../api/services.js';
import { getUserInitials, getUserRole } from '../api/mappers.js';

const AuthContext = createContext(null);

function normalizeUser(user) {
  if (!user) return null;

  return {
    ...user,
    name: user.name || user.nombre || user.correo || user.email || 'Usuario',
    initials: user.initials || getUserInitials(user),
    email: user.email || user.correo,
  };
}

export function AuthProvider({ children }) {
  const [role, setRoleState] = useState(null);
  const [user, setUser] = useState(null);
  const [token, setAuthToken] = useState(() => getToken());
  const [loading, setLoading] = useState(Boolean(getToken()));
  const [authError, setAuthError] = useState(null);

  const applySession = (authData) => {
    const nextToken = authData?.token;
    const nextUser = authData?.usuario || authData?.user || authData;

    if (nextToken) {
      setToken(nextToken);
      setAuthToken(nextToken);
    }

    const normalizedUser = normalizeUser(nextUser);
    setUser(normalizedUser);
    setRoleState(getUserRole(normalizedUser));
    setAuthError(null);
    return normalizedUser;
  };

  const login = async (credentials) => {
    const authData = await loginRequest(credentials);
    return applySession(authData);
  };

  const register = async (data) => {
    const authData = await registerRequest(data);
    return applySession(authData);
  };

  const loginWithGoogle = async (idToken) => {
    const authData = await loginWithGoogleRequest(idToken);
    return applySession(authData);
  };

  const logout = () => {
    clearToken();
    setAuthToken(null);
    setRoleState(null);
    setUser(null);
  };

  const setRole = (selectedRole) => {
    setRoleState(selectedRole);
  };

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);

    getMe()
      .then(currentUser => {
        if (!active) return;
        const normalizedUser = normalizeUser(currentUser);
        setUser(normalizedUser);
        setRoleState(getUserRole(normalizedUser));
        setAuthError(null);
      })
      .catch(error => {
        if (!active) return;
        setAuthError(error.message);
        logout();
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [token]);

  useEffect(() => onUnauthorized(() => {
    logout();
    setAuthError('Tu sesión expiró. Inicia sesión nuevamente.');
  }), []);

  return (
    <AuthContext.Provider value={{ role, user, token, loading, authError, login, register, loginWithGoogle, logout, setRole, isAuthenticated: Boolean(token) }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

import { createContext, useContext, useEffect, useState } from "react";
import { api, tokenStore } from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [role,    setRole]    = useState(null);
  const [loading, setLoading] = useState(true);

  /* Verificar sesión existente al iniciar */
  useEffect(() => {
    if (!tokenStore.has()) { setLoading(false); return; }

    api.get("/api/auth/me")
      .then(({ email, role }) => { setUser({ email }); setRole(role); })
      .catch(() => tokenStore.remove())
      .finally(() => setLoading(false));
  }, []);

  const signIn = (token, email, role) => {
    tokenStore.set(token);
    setUser({ email });
    setRole(role);
  };

  const signOut = () => {
    tokenStore.remove();
    setUser(null);
    setRole(null);
  };

  return (
    <AuthContext.Provider value={{ user, role, loading, signIn, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
};

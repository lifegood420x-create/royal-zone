import React, { createContext, useContext, useEffect, useState } from 'react';
import { useAuthenticate, User } from '@workspace/api-client-react';
import { getStartParam, bootstrapTelegram } from '../lib/telegram';

interface AuthContextValue {
  user: User | null;
  isAdmin: boolean;
  isLoading: boolean;
  error: Error | null;
}

const AuthContext = createContext<AuthContextValue>({
  user: null,
  isAdmin: false,
  isLoading: true,
  error: null,
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const authMutation = useAuthenticate();

  useEffect(() => {
    bootstrapTelegram();
    const startParam = getStartParam();

    authMutation.mutate(
      { data: { startParam } },
      {
        onSuccess: (data) => {
          setIsAdmin(data.isAdmin);
          setUser(data.user);
        },
      }
    );
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAdmin,
        isLoading: authMutation.isPending && !user,
        error: authMutation.error as Error | null,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

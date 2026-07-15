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

function getOrCreateDeviceId(): string {
  const KEY = 'bth_device_id';
  let id = localStorage.getItem(KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(KEY, id);
  }
  return id;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  const authMutation = useAuthenticate();

  useEffect(() => {
    bootstrapTelegram();
    const startParam = getStartParam();
    const deviceId = getOrCreateDeviceId();

    authMutation.mutate(
      { data: { startParam, deviceId } },
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

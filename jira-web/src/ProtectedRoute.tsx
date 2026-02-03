// src/ProtectedRoute.tsx
import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { getMe } from "./auth";
import type { User } from "./api";

type Props = {
    children: ReactNode;
};

export default function ProtectedRoute({ children }: Props ) {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const me = await getMe();
        if (!alive) return;
        setUser(me);
      } finally {
        if (alive) setLoading(false);
      }
    })();

    return () => {
      alive = false;
    };
  }, []);

  if (loading) return <div className="p-6">Loading...</div>;

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: location.pathname }}
      />
    );
  }

  return <>{children}</>;
}

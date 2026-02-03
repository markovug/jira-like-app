import { useState } from "react";
import { csrfCookie, login, type ApiError } from "../api"; //api,
import { useNavigate, useLocation } from "react-router-dom";
import { getMe } from "../auth";

export default function Login() {
  const [email, setEmail] = useState("test@example.com");
  const [password, setPassword] = useState("password");
  const [status, setStatus] = useState("");

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const location = useLocation();
  
  type LocationState = { from?: string };
  const state = location.state as LocationState | null;
  const from = state?.from ?? "/projects";

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("");

    try {
      await csrfCookie();

      await login(email, password);
      setLoading(true);
      //const me = await api.get("/me");
      const me = await getMe();
      setStatus(`Ulogiran: ${me?.name} (${me?.email})`);
      navigate(from, { replace: true });
    } catch (e) {
      const err = e as ApiError;
      setStatus(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6">
      <form
        onSubmit={handleLogin}
        className="w-full max-w-sm rounded-2xl border border-zinc-800 bg-zinc-900/40 p-6 shadow-lg backdrop-blur"
      >
        <h1 className="mb-6 text-center text-2xl font-bold tracking-tight text-zinc-100">
          Sign in
        </h1>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Email
            </label>
            <input
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-zinc-300">
              Password
            </label>
            <input
              type="password"
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-500"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          <button
            disabled={loading}
            className="w-full rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Log in"}
          </button>
        </div>

        {status && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-2 text-center text-sm text-red-300">
            {status}
          </div>
        )}
      </form>
    </div>
  );
}

import { useEffect, useState } from "react";
import { adminCreateUser, adminListUsers, adminUpdateUser, type ApiError, type AdminUser } from "../api";

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string>("");

  // create form
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<"admin" | "user">("user");

  async function load() {
    setErr("");
    setLoading(true);
    try {
      const data = await adminListUsers();
      setUsers(data);
    } catch (e) {
      const x = e as ApiError;
      setErr(x.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function create() {
    setErr("");
    try {
      await adminCreateUser({ name, email, password, role });
      setName("");
      setEmail("");
      setPassword("");
      setRole("user");
      await load();
    } catch (e) {
      const x = e as ApiError;
      setErr(x.message);
    }
  }

  async function changeRole(userId: number, newRole: "admin" | "user") {
    setErr("");
    
    setUsers((prev) => prev.map(u => (u.id === userId ? { ...u, role: newRole } : u)));

    try {
      await adminUpdateUser(userId, { role: newRole });
    } catch (e) {
      const x = e as ApiError;
      setErr(x.message);
      await load();
    }
  }

  if (loading) return <div className="p-6 text-sm opacity-80">Loading...</div>;

    return (
      <div className="mx-auto max-w-5xl p-6">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold tracking-tight">Admin • Users</h1>

          <div className="ml-auto">
            <button
              onClick={load}
              className="rounded-xl border border-zinc-800 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Refresh
            </button>
          </div>
        </div>

        {err && (
          <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
            {err}
          </div>
        )}

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Create user */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="flex items-center justify-between gap-4">
              <div className="text-sm font-semibold opacity-90">Create user</div>
              <div className="text-xs opacity-60">admin only</div>
            </div>

            <div className="mt-4 grid gap-3">
              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Name</div>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
                  placeholder="e.g. Tea"
                />
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Email</div>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
                  placeholder="tea@example.com"
                />
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Password</div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
                  placeholder="min 6 chars"
                />
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Role</div>
                <select
                  value={role}
                  onChange={(e) => setRole(e.target.value as "admin" | "user")}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="user">user</option>
                  <option value="admin">admin</option>
                </select>
              </div>

              <button
                onClick={create}
                disabled={!name || !email || !password}
                className="mt-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                Create
              </button>
            </div>
          </div>

          {/* Users list */}
          <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
            <div className="text-sm font-semibold opacity-90">Users</div>

            <div className="mt-4 grid gap-3">
              {users.map((u) => (
                <div
                  key={u.id}
                  className="rounded-2xl border border-zinc-800 bg-white/5 p-4"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <div className="truncate font-semibold">
                        {u.name} <span className="opacity-60">#{u.id}</span>
                      </div>
                      <div className="truncate text-sm opacity-70">{u.email}</div>
                    </div>

                    <div className="shrink-0">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          changeRole(u.id, e.target.value as "admin" | "user")
                        }
                        className="rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                        title="Change role"
                      >
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                    </div>
                  </div>
                </div>
              ))}

              {users.length === 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm opacity-70">
                  No users found.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    );
}

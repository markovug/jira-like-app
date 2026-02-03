import { Link, Outlet, useParams, useLocation } from "react-router-dom";
import LogoutButton from "../components/LogoutButton";

function NavLink({
  to,
  children,
  active,
}: {
  to: string;
  children: React.ReactNode;
  active?: boolean;
}) {
  return (
    <Link
      to={to}
      className={[
        "rounded-lg px-3 py-2 text-sm font-semibold transition",
        active
          ? "bg-white/10 text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white",
      ].join(" ")}
    >
      {children}
    </Link>
  );
}

export default function AppShell() {
  const { key } = useParams<{ key?: string }>();
  const location = useLocation();

  const isProjects = location.pathname === "/projects";
  const isAdmin = location.pathname.startsWith("/admin");
  const isBoard = key ? location.pathname === `/projects/${key}/board` : false;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100">
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center gap-2 px-6 py-3">
          <div className="mr-2 text-sm font-bold tracking-wide">
            Jira-like-app
          </div>

          <nav className="flex items-center gap-1">
            <NavLink to="/projects" active={isProjects}>
              Projects
            </NavLink>

            {key && (
              <NavLink
                to={`/projects/${encodeURIComponent(key)}/board`}
                active={isBoard}
              >
                Board
              </NavLink>
            )}

            <NavLink to="/admin/users" active={isAdmin}>
              Admin
            </NavLink>
          </nav>

          <div className="ml-auto">
            <div className="rounded-xl border border-zinc-800 bg-white/5 px-3 py-1.5 hover:bg-white/10">
              <LogoutButton />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-6 py-6">
        <Outlet />
      </main>
    </div>
  );
}

import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { getProjectByKey, type Project } from "../api";

export default function ProjectDetails() {
  const { key } = useParams<{ key: string }>();
  const [project, setProject] = useState<Project | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!key) return;

    (async () => {
      setError("");
      try {
        const p = await getProjectByKey(key);
        setProject(p);
      } catch {
        setError("Ne mogu dohvatiti projekt.");
      }
    })();
  }, [key]);

  if (error)
    return (
      <div className="p-6">
        <div className="rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      </div>
    );

  if (!project) return <div className="p-6 text-sm opacity-80">Loading...</div>;

  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="flex items-center gap-3">
        <Link
          to="/projects"
          className="text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Back
        </Link>

        <div className="ml-auto flex items-center gap-2">
          <Link
            to={`/projects/${project.key}/issues`}
            className="rounded-xl border border-zinc-800 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Issues →
          </Link>
          <Link
            to={`/projects/${project.key}/board`}
            className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200"
          >
            Board →
          </Link>
        </div>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight">{project.name}</h1>

      <div className="mt-4 rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <div className="text-xs font-medium text-zinc-300">Key</div>
            <div className="mt-1 text-sm text-white/90">{project.key}</div>
          </div>

          <div>
            <div className="text-xs font-medium text-zinc-300">ID</div>
            <div className="mt-1 text-sm text-white/90">{project.id}</div>
          </div>
        </div>

        <div className="mt-4">
          <div className="text-xs font-medium text-zinc-300">Description</div>
          <div className="mt-1 whitespace-pre-wrap text-sm text-white/85">
            {project.description ? (
              project.description
            ) : (
              <span className="opacity-70">No description</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

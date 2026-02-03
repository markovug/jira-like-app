import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import { createProject, listProjects, type Project } from "../api";

function normalizeKey(input: string) {
  return input
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 30);
}

export default function Projects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [name, setName] = useState("");
  const [key, setKey] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState<string>("");

  async function load() {
    setError("");
    try {
      const data = await listProjects();
      setProjects(data);
    } catch (err) {
      if (axios.isAxiosError(err)) {
        setError(err.response?.data?.message ?? "Ne mogu dohvatiti projekte.");
      } else {
        setError("Ne mogu dohvatiti projekte.");
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    if (!key && name.trim()) setKey(normalizeKey(name));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [name]);

  async function onRefresh() {
    setRefreshing(true);
    await load();
  }

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    const payload = {
      name: name.trim(),
      key: key.trim().toUpperCase(),
      description: description.trim() || undefined,
    };

    if (!payload.name) return setError("Name je obavezan.");
    if (!payload.key) return setError("Key je obavezan.");

    setCreating(true);
    try {
      await createProject(payload);
      setName("");
      setKey("");
      setDescription("");
      await load();
    } catch (err) {
      // Laravel 422 (validation)
      if (axios.isAxiosError(err)) {
        const msg =
          err.response?.data?.message ??
          "Greška pri kreiranju projekta.";

        // ako ti Laravel vraća errors: { key: [...], name: [...] }
        const errors = err.response?.data?.errors;
        if (errors) {
          const first =
            errors.key?.[0] || errors.name?.[0] || errors.description?.[0];
          setError(first ?? msg);
        } else {
          setError(msg);
        }
      } else {
        setError("Greška pri kreiranju projekta.");
      }
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div className="mx-auto max-w-7xl p-6">
      <div className="flex items-center gap-4">
        <h1 className="text-4xl font-bold tracking-tight">Projects</h1>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={onRefresh}
            disabled={refreshing}
            className="rounded-xl border border-zinc-700 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
          >
            {refreshing ? "Refreshing..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        {/* Create form */}
        <form
          onSubmit={onCreate}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4"
        >
          <div className="text-sm font-semibold opacity-90">Create project</div>

          <div className="mt-4 grid gap-3">
            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              placeholder="Name (npr. My Project)"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <input
              className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              placeholder="Key (npr. MY_PROJECT)"
              value={key}
              onChange={(e) => setKey(e.target.value)}
            />

            <textarea
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              placeholder="Description (optional)"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
            />

            <button
              type="submit"
              disabled={creating}
              className="mt-1 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        </form>

        {/* Projects list */}
        <div className="grid gap-3">
          <div className="text-sm font-semibold opacity-90">Your projects</div>

          <div className="grid gap-3">
            {projects.map((p) => (
              <Link
                key={p.id}
                to={`/projects/${p.key}`}
                className="block rounded-2xl border border-zinc-800 bg-white/5 p-4 text-left hover:bg-white/10"
              >
                <div className="font-semibold">{p.name}</div>
                <div className="text-sm opacity-70">{p.key}</div>

                {p.description && (
                  <div className="mt-2 text-sm opacity-80">{p.description}</div>
                )}
              </Link>
            ))}

            {projects.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm opacity-70">
                No projects yet. Create your first one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

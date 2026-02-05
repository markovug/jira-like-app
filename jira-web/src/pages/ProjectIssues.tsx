import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { createIssue, listIssues, type Issue, type ApiError } from "../api";

export default function ProjectIssues() {
  const { key } = useParams<{ key: string }>();
  const projectKey = key ?? "";

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<Issue["type"]>("task");
  const [priority, setPriority] = useState<Issue["priority"]>("medium");
  const [creating, setCreating] = useState(false);

  async function load() {
    if (!projectKey) return;
    setError("");
    try {
      const data = await listIssues(projectKey);
      setIssues(data);
    } catch {
      setError("Ne mogu dohvatiti issue-e.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey]);

  async function onCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) {
      setError("Summary je obavezan.");
      return;
    }

    setCreating(true);
    setError("");

    try {
      await createIssue(projectKey, {
        summary: summary.trim(),
        description: description.trim() || undefined,
        type,
        priority,
      });

      setSummary("");
      setDescription("");
      await load();
    } catch (e) {
        const err = e as ApiError;

        const msg =
          err.errors
            ? Object.values(err.errors)[0]?.[0]
            : err.message ?? "Greška pri kreiranju issue-a.";

        setError(msg);
    } finally {
      setCreating(false);
    }
  }

  if (loading) return <div className="p-6 text-sm opacity-80">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      <div className="flex items-center gap-3">
        <Link
          to={`/projects/${projectKey}`}
          className="text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Project
        </Link>

        <h1 className="text-lg font-bold tracking-tight">
          Issues <span className="text-white/60">•</span>{" "}
          <span className="text-white/90">{projectKey}</span>
        </h1>
      </div>

      {error && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Create form */}
        <form
          onSubmit={onCreate}
          className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4"
        >
          <div className="flex items-center justify-between">
            <div className="text-sm font-semibold opacity-90">Create issue</div>
            <div className="text-xs opacity-60">{issues.length} total</div>
          </div>

          <div className="mt-4 grid gap-3">
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Summary</div>
              <input
                placeholder="e.g. Login button not working"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              />
            </div>

            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Description</div>
              <textarea
                placeholder="Optional"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-500 focus:border-zinc-600"
              />
            </div>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Type</div>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Issue["type"])}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="task">task</option>
                  <option value="bug">bug</option>
                  <option value="story">story</option>
                </select>
              </div>

              <div>
                <div className="mb-1 text-xs font-medium text-zinc-300">Priority</div>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as Issue["priority"])}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <button
              type="submit"
              disabled={creating}
              className="mt-2 rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
            >
              {creating ? "Creating..." : "Create issue"}
            </button>
          </div>
        </form>

        {/* List */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
          <div className="text-sm font-semibold opacity-90">Issue list</div>

          <div className="mt-4 grid gap-3">
            {issues.map((i) => (
              <div
                key={i.id}
                className="rounded-2xl border border-zinc-800 bg-white/5 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="font-semibold">{i.key}</div>

                  <div className="flex flex-wrap items-center gap-2 text-xs text-white/70">
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5">
                      {i.type}
                    </span>
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5">
                      {i.priority}
                    </span>
                    <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5">
                      {i.status}
                    </span>
                  </div>
                </div>

                <div className="mt-2 text-sm text-white/90">{i.summary}</div>

                {i.description && (
                  <div className="mt-2 whitespace-pre-wrap text-sm text-white/70">
                    {i.description}
                  </div>
                )}
              </div>
            ))}

            {issues.length === 0 && (
              <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm opacity-70">
                No issues yet. Create the first one on the left.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

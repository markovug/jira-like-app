import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { listIssues, updateIssue, type Issue, type ApiError } from "../api";

type Col = {
  title: string;
  status: Issue["status"];
};

const COLS: Col[] = [
  { title: "To do", status: "todo" },
  { title: "In progress", status: "in_progress" },
  { title: "Done", status: "done" },
];

export default function ProjectBoard() {
  const { key } = useParams<{ key: string }>();
  const projectKey = key ?? "";

  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [draggingId, setDraggingId] = useState<number | null>(null);

  async function load() {
    if (!projectKey) return;
    setErr("");
    try {
      const data = await listIssues(projectKey);
      setIssues(data);
    } catch (e) {
      const err = e as ApiError;
      setErr(err.message || "Ne mogu dohvatiti issue-e.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey]);

  const byStatus = useMemo(() => {
    const map: Record<Issue["status"], Issue[]> = {
      todo: [],
      in_progress: [],
      done: [],
    };
    for (const i of issues) map[i.status].push(i);
    return map;
  }, [issues]);

  async function moveIssue(projectKey: string, issueId: number, newStatus: Issue["status"]) {
    setIssues((prev) =>
      prev.map((i) => (i.id === issueId ? { ...i, status: newStatus } : i))
    );

    try {
      await updateIssue(projectKey, issueId, { status: newStatus });
    } catch (e) {
      const err = e as ApiError;
      setErr(err.message || "Ne mogu odraditi update taska!");
      await load();
    }
  }

  if (loading) return <div className="p-6 text-sm opacity-80">Loading...</div>;

  return (
    <div className="mx-auto max-w-6xl p-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          to={`/projects/${projectKey}`}
          className="text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Project
        </Link>
  
        <h1 className="text-lg font-bold tracking-tight">
          Board <span className="text-white/60">•</span>{" "}
          <span className="text-white/90">{projectKey}</span>
        </h1>
  
        <div className="ml-auto flex items-center gap-3">
          <Link
            to={`/projects/${projectKey}/issues`}
            className="rounded-xl border border-zinc-800 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
          >
            Issues
          </Link>
  
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
  
      {/* Columns */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        {COLS.map((col) => (
          <div
            key={col.status}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const raw = e.dataTransfer.getData("text/plain");
              const id = Number(raw);
              if (!id || Number.isNaN(id)) return;
              moveIssue(projectKey, id, col.status);
              setDraggingId(null);
            }}
            className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4"
          >
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold">
                {col.title}
              </div>
              <div className="rounded-full border border-zinc-800 bg-white/5 px-2 py-0.5 text-xs opacity-80">
                {byStatus[col.status].length}
              </div>
            </div>
          
            <div className="grid gap-3">
              {byStatus[col.status].map((i) => (
                <div
                  key={i.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggingId(i.id);
                    e.dataTransfer.setData("text/plain", String(i.id));
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragEnd={() => setDraggingId(null)}
                  className={[
                    "rounded-2xl border border-zinc-800 bg-white/5 p-4 transition",
                    "cursor-grab hover:bg-white/10",
                    draggingId === i.id ? "opacity-60" : "",
                  ].join(" ")}
                  title="Drag me"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="font-semibold">{i.key}</div>
                
                    <div className="flex items-center gap-2 text-xs text-white/70">
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5">
                        {i.type}
                      </span>
                      <span className="rounded-full border border-zinc-800 bg-zinc-950/40 px-2 py-0.5">
                        {i.priority}
                      </span>
                    </div>
                  </div>
                
                  <div className="mt-2">
                    <Link
                      to={`/projects/${encodeURIComponent(projectKey)}/issues/${i.id}`}
                      onMouseDown={(e) => e.stopPropagation()}
                      className="text-sm font-medium underline underline-offset-2 text-white/90 hover:text-white"
                      title="Open details"
                    >
                      {i.summary}
                    </Link>
                  </div>
                
                  <div className="mt-2 text-xs text-white/70">
                    Assignee:{" "}
                    <span className="text-white/90">
                      {i.assignee?.name ?? "Unassigned"}
                    </span>
                  </div>
                </div>
              ))}
  
              {byStatus[col.status].length === 0 && (
                <div className="rounded-2xl border border-zinc-800 bg-white/5 p-4 text-sm opacity-70">
                  No issues here.
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

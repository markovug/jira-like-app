import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  type ApiError,
  type Issue,
  firstFieldError,
  getIssue,
  updateIssue,
  listUsers,
  type SimpleUser
} from "../api";

export default function IssueDetailsPage() {
  const navigate = useNavigate();
  const { key, issueId } = useParams<{ key: string; issueId: string }>();

  const [users, setUsers] = useState<SimpleUser[]>([]);
  const [assigneeId, setAssigneeId] = useState<number | "">("");

  const projectKey = key ?? "";
  const id = useMemo(() => Number(issueId), [issueId]);

  const [issue, setIssue] = useState<Issue | null>(null);
  const [loading, setLoading] = useState(true);

  const [saving, setSaving] = useState(false);
  const [globalError, setGlobalError] = useState<string | null>(null);

  const [summary, setSummary] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<Issue["status"]>("todo");
  const [type, setType] = useState<Issue["type"]>("task");
  const [priority, setPriority] = useState<Issue["priority"]>("medium");

  const [summaryError, setSummaryError] = useState<string | null>(null);

  const [editMode, setEditMode] = useState(false);

  async function load() {
    if (!projectKey || !Number.isFinite(id)) return;

    setLoading(true);
    setGlobalError(null);

    try {
      const [issueData, usersData] = await Promise.all([
        getIssue(projectKey, id),
        listUsers(),
      ]);

      setIssue(issueData);
      setUsers(usersData);

      setSummary(issueData.summary ?? "");
      setDescription(issueData.description ?? "");
      setStatus(issueData.status);
      setType(issueData.type);
      setPriority(issueData.priority);

      setAssigneeId(issueData.assignee_id ?? "");
    } catch (e) {
      const err = e as ApiError;
      if (err.status === 401) navigate("/login");
      else setGlobalError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectKey, id]);

  function startEdit() {
    setSummaryError(null);
    setGlobalError(null);
    setEditMode(true);
  }

  function cancelEdit() {
    if (!issue) return;
    setSummary(issue.summary ?? "");
    setDescription(issue.description ?? "");
    setStatus(issue.status);
    setType(issue.type);
    setPriority(issue.priority);
    setAssigneeId(issue.assignee_id ?? "");

    setSummaryError(null);
    setGlobalError(null);
    setEditMode(false);
  }

  async function save() {
    if (!issue) return;

    setSaving(true);
    setGlobalError(null);
    setSummaryError(null);

    try {
      const updated = await updateIssue(projectKey, issue.id, {
        summary,
        description,
        status,
        type,
        priority,
        assignee_id: assigneeId === "" ? null : assigneeId,
      });
      setIssue(updated);
      setEditMode(false);
      navigate(`/projects/${encodeURIComponent(projectKey)}/board`);
    } catch (e) {
      const err = e as ApiError;
      setGlobalError(err.message);
      setSummaryError(firstFieldError(err.errors, "summary"));
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <div className="p-6 text-sm opacity-80">Loading…</div>;
  if (!issue) return <div className="p-6 text-sm opacity-80">Issue not found.</div>;
  
  return (
    <div className="mx-auto max-w-4xl p-6">
      {/* header komponente */}
      <div className="flex items-center gap-3">
        <Link
          to={`/projects/${encodeURIComponent(projectKey)}/board`}
          className="text-sm font-semibold text-white/80 hover:text-white"
        >
          ← Board
        </Link>
  
        <div className="text-xl font-extrabold tracking-tight">{issue.key}</div>
  
        <div className="ml-auto flex items-center gap-2">
          {!editMode ? (
            <button
              onClick={startEdit}
              className="rounded-xl border border-zinc-800 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10"
            >
              Edit
            </button>
          ) : (
            <>
              <button
                onClick={save}
                disabled={saving}
                className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-zinc-200 disabled:opacity-60"
              >
                {saving ? "Saving…" : "Save"}
              </button>
          
              <button
                onClick={cancelEdit}
                disabled={saving}
                className="rounded-xl border border-zinc-800 bg-white/5 px-4 py-2 text-sm font-semibold hover:bg-white/10 disabled:opacity-60"
              >
                Cancel
              </button>
            </>
          )}
        </div>
      </div>
        
      {globalError && (
        <div className="mt-4 rounded-xl border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
          {globalError}
        </div>
      )}
  
      <div className="mt-6 grid gap-5">
        {/* Summary */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
          <div className="mb-2 text-sm font-semibold opacity-90">Summary</div>
    
          {editMode ? (
            <>
              <input
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                disabled={saving}
                className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 disabled:opacity-60"
              />
  
              {summaryError && (
                <div className="mt-2 text-sm text-red-300">
                  {summaryError}
                </div>
              )}
            </>
          ) : (
            <div className="text-sm text-white/90">{issue.summary}</div>
          )}
        </div>
        
        {/* Description */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
          <div className="mb-2 text-sm font-semibold opacity-90">Description</div>
        
          {editMode ? (
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              disabled={saving}
              rows={6}
              className="w-full resize-none rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm text-zinc-100 outline-none focus:border-zinc-600 disabled:opacity-60"
            />
          ) : (
            <div className="whitespace-pre-wrap text-sm text-white/85">
              {issue.description ?? (
                <span className="opacity-70">No description</span>
              )}
            </div>
          )}
        </div>
        
        {/* Meta */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-950/30 p-4">
          <div className="mb-3 text-sm font-semibold opacity-90">Meta</div>
        
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {/* Status */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Status</div>
              {editMode ? (
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as Issue["status"])}
                  disabled={saving}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600 disabled:opacity-60"
                >
                  <option value="todo">todo</option>
                  <option value="in_progress">in_progress</option>
                  <option value="done">done</option>
                </select>
              ) : (
                <div className="text-sm text-white/90">{issue.status}</div>
              )}
            </div>
            
            {/* Assignee */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Assignee</div>
              {editMode ? (
                <select
                  value={assigneeId}
                  onChange={(e) =>
                    setAssigneeId(e.target.value === "" ? "" : Number(e.target.value))
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600 disabled:opacity-60"
                >
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name}
                    </option>
                  ))}
                </select>
              ) : (
                <div className="text-sm text-white/90">
                  {issue.assignee?.name ?? "Unassigned"}
                </div>
              )}
            </div>
            
            {/* Type */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Type</div>
              {editMode ? (
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value as Issue["type"])}
                  disabled={saving}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600 disabled:opacity-60"
                >
                  <option value="task">task</option>
                  <option value="bug">bug</option>
                  <option value="story">story</option>
                </select>
              ) : (
                <div className="text-sm text-white/90">{issue.type}</div>
              )}
            </div>
            
            {/* Priority */}
            <div>
              <div className="mb-1 text-xs font-medium text-zinc-300">Priority</div>
              {editMode ? (
                <select
                  value={priority}
                  onChange={(e) =>
                    setPriority(e.target.value as Issue["priority"])
                  }
                  disabled={saving}
                  className="w-full rounded-xl border border-zinc-800 bg-zinc-950/40 px-3 py-2 text-sm outline-none focus:border-zinc-600 disabled:opacity-60"
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              ) : (
                <div className="text-sm text-white/90">{issue.priority}</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

import axios from "axios";

export const API_BASE = "http://localhost:8000";

function getCookie(name: string): string | null {
  const match = document.cookie
    .split("; ")
    .find((row) => row.startsWith(name + "="));
  if (!match) return null;
  return match.split("=")[1] ?? null;
}

export const web = axios.create({
  baseURL: API_BASE,
  withCredentials: true,
});

export const api = axios.create({
  baseURL: `${API_BASE}/api`,
  withCredentials: true,
});

function attachXsrf(instance: typeof web) {
  instance.interceptors.request.use((config) => {
    const raw = getCookie("XSRF-TOKEN");
    if (raw) {
      config.headers = config.headers ?? {};
      config.headers["X-XSRF-TOKEN"] = decodeURIComponent(raw);
    }
    return config;
  });
}

attachXsrf(web);
attachXsrf(api);

function attachErrorNormalization(instance: typeof api) {
  instance.interceptors.response.use(
    (res) => res,
    (err) => Promise.reject(normalizeApiError(err))
  );
}

attachErrorNormalization(web);
attachErrorNormalization(api);

export async function csrfCookie() {
  await web.get(`/sanctum/csrf-cookie`);
}

export async function login(email: string, password: string) {
  await web.post(`/login`, { email, password });
}

export async function logout() {
  await web.post(`/logout`, {});
}

export type User = {
  id: number;
  name: string;
  email: string;
};

export type Project = {
  id: number;
  name: string;
  key?: string | null;
  description?: string | null;
  created_at?: string;
  updated_at?: string;
};

export async function listProjects() {
  const res = await api.get<Project[]>("/projects");
  return res.data;
}

export async function createProject(payload: { key: string; name: string; description?: string }) {
  const res = await api.post<Project>("/projects", payload);
  return res.data;
}

export async function getProjectByKey(key: string) {
  const res = await api.get<Project>(`/projects/${encodeURIComponent(key)}`);
  return res.data;
}

export type Issue = {
  id: number;
  project_id: number;
  key: string;
  summary: string;
  description?: string | null;
  type: "task" | "bug" | "story";
  status: "todo" | "in_progress" | "done";
  priority: "low" | "medium" | "high";
  created_at?: string;
  updated_at?: string;
  assignee_id?: number | null;
  created_by?: number;

  assignee?: { id: number; name: string; email: string } | null;
  creator?: { id: number; name: string; email: string } | null;
};

export async function listIssues(projectKey: string) {
  const res = await api.get<Issue[]>(`/projects/${encodeURIComponent(projectKey)}/issues`);
  return res.data;
}

export async function createIssue(projectKey: string, payload: {
  summary: string;
  description?: string;
  type?: Issue["type"];
  status?: Issue["status"];
  priority?: Issue["priority"];
}) {
  const res = await api.post<Issue>(`/projects/${encodeURIComponent(projectKey)}/issues`, payload);
  return res.data;
}

export async function updateIssue(
  projectKey: string, 
  issueId: number, 
  patch: Partial<Pick<Issue, "summary" | "description" | "type" | "status" | "priority" | "assignee_id">>
) {
  const res = await api.patch<Issue>(`/projects/${encodeURIComponent(projectKey)}/issues/${issueId}`, patch);
  return res.data;
}

export async function getIssue(projectKey: string, issueId: number) {
  const res = await api.get<Issue>(`/projects/${encodeURIComponent(projectKey)}/issues/${issueId}`);
  return res.data;
}

export type ApiFieldErrors = Record<string, string[]>;

export type ApiError = {
  status: number;
  message: string;
  errors?: ApiFieldErrors;
};

export type ApiErrorPayload = {
  message?: unknown;
  errors?: unknown;
};

export function normalizeApiError(err: unknown): ApiError {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status ?? 0;
    const data: ApiErrorPayload | undefined =
      typeof err.response?.data === "object" && err.response?.data !== null
        ? (err.response.data as ApiErrorPayload)
        : undefined;

    const message =
      (typeof data?.message === "string" && data.message) ||
      err.message ||
      "Network error";

    const errors =
      data?.errors && typeof data.errors === "object"
        ? (data.errors as ApiFieldErrors)
        : undefined;

    return { status, message, errors };
  }

  if (err instanceof Error) {
    return {
      status: 0,
      message: err.message,
    };
  }

  return {
    status: 0,
    message: "Unknown error",
  };
}

export function firstFieldError(errors: ApiFieldErrors | undefined, field: string): string | null {
  const list = errors?.[field];
  return list && list.length > 0 ? list[0] : null;
}

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "user";
  created_at?: string;
};

export async function adminListUsers() {
  const res = await api.get<AdminUser[]>("/admin/users");
  return res.data;
}

export async function adminCreateUser(payload: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "user";
}) {
  const res = await api.post<AdminUser>("/admin/users", payload);
  return res.data;
}

export async function adminUpdateUser(id: number, patch: Partial<{ name: string; password: string; role: "admin" | "user" }>) {
  const res = await api.patch<AdminUser>(`/admin/users/${id}`, patch);
  return res.data;
}

export type SimpleUser = {
  id: number;
  name: string;
  email: string;
};

export async function listUsers() {
  const res = await api.get<SimpleUser[]>("/users");
  return res.data;
}
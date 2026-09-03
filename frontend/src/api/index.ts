import axios from "axios";
import type {
  User,
  Repository,
  Commit,
  CommitDetail,
  TreeEntry,
  Issue,
  Comment,
  Pipeline,
  TokenResponse,
  PaginatedResponse,
} from "../types";

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000/api";

const api = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("access_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      const refresh = localStorage.getItem("refresh_token");
      if (refresh) {
        try {
          const res = await axios.post(`${API_BASE}/auth/token/refresh`, {
            refresh,
          });
          localStorage.setItem("access_token", res.data.access);
          error.config.headers.Authorization = `Bearer ${res.data.access}`;
          return api(error.config);
        } catch {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          window.location.href = "/login";
        }
      }
    }
    return Promise.reject(error);
  }
);

export const auth = {
  register: (data: {
    username: string;
    password: string;
    password2: string;
    email: string;
  }) => api.post<User>("/auth/register", data),

  login: (data: { username: string; password: string }) =>
    api.post<TokenResponse>("/auth/token", data),

  me: () => api.get<User>("/auth/me"),
};

export const repos = {
  list: (username?: string) =>
    username
      ? api.get<PaginatedResponse<Repository>>(`/users/${username}/repos`)
      : api.get<PaginatedResponse<Repository>>("/repos"),

  get: (owner: string, name: string) =>
    api.get<Repository>(`/repos/${owner}/${name}`),

  create: (data: { name: string; description?: string; is_private?: boolean }) =>
    api.post<Repository>("/repos", data),

  delete: (owner: string, name: string) =>
    api.delete(`/repos/${owner}/${name}`),

  star: (owner: string, name: string) =>
    api.put(`/repos/${owner}/${name}/star`),

  unstar: (owner: string, name: string) =>
    api.delete(`/repos/${owner}/${name}/star`),

  stargazers: (owner: string, name: string) =>
    api.get<PaginatedResponse<User>>(`/repos/${owner}/${name}/stargazers`),
};

export const commits = {
  list: (owner: string, repo: string, page = 1) =>
    api.get<PaginatedResponse<Commit>>(
      `/repos/${owner}/${repo}/commits?page=${page}`
    ),

  get: (owner: string, repo: string, sha: string) =>
    api.get<CommitDetail>(`/repos/${owner}/${repo}/commits/${sha}`),
};

export const tree = {
  get: (owner: string, repo: string, ref = "head") =>
    api.get<TreeEntry[]>(`/repos/${owner}/${repo}/tree?ref=${ref}`),
};

export const files = {
  get: (owner: string, repo: string, path: string, ref = "head") =>
    api.get<string>(`/repos/${owner}/${repo}/contents/${path}?ref=${ref}`),

  upload: (owner: string, repo: string, message: string, fileList: File[]) => {
    const formData = new FormData();
    formData.append("message", message);
    fileList.forEach((file) => formData.append("files", file));
    return api.post(`/repos/${owner}/${repo}/files`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },

  delete: (owner: string, repo: string, path: string, message: string) =>
    api.delete(`/repos/${owner}/${repo}/files/${path}`, {
      data: { message },
    }),
};

export const issues = {
  list: (owner: string, repo: string) =>
    api.get<PaginatedResponse<Issue>>(`/repos/${owner}/${repo}/issues`),

  get: (owner: string, repo: string, number: number) =>
    api.get<Issue>(`/repos/${owner}/${repo}/issues/${number}`),

  create: (owner: string, repo: string, data: { title: string; body: string }) =>
    api.post<Issue>(`/repos/${owner}/${repo}/issues`, data),

  close: (owner: string, repo: string, number: number) =>
    api.patch<Issue>(`/repos/${owner}/${repo}/issues/${number}`, {
      status: "closed",
    }),

  reopen: (owner: string, repo: string, number: number) =>
    api.patch<Issue>(`/repos/${owner}/${repo}/issues/${number}`, {
      status: "open",
    }),

  comments: (owner: string, repo: string, number: number) =>
    api.get<PaginatedResponse<Comment>>(
      `/repos/${owner}/${repo}/issues/${number}/comments`
    ),

  addComment: (owner: string, repo: string, number: number, body: string) =>
    api.post<Comment>(`/repos/${owner}/${repo}/issues/${number}/comments`, {
      body,
    }),
};

export const pipelines = {
  list: (owner: string, repo: string) =>
    api.get<PaginatedResponse<Pipeline>>(
      `/repos/${owner}/${repo}/pipelines`
    ),

  get: (owner: string, repo: string, pk: number) =>
    api.get<Pipeline>(`/repos/${owner}/${repo}/pipelines/${pk}`),
};

export default api;

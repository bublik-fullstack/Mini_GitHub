export interface User {
  id: number;
  username: string;
  email: string;
}

export interface Repository {
  id: number;
  name: string;
  description: string;
  owner: User;
  is_private: boolean;
  stars_count: number;
  created_at: string;
  updated_at: string;
}

export interface Commit {
  id: number;
  sha: string;
  message: string;
  author: User;
  created_at: string;
}

export interface CommitDetail extends Commit {
  files: CommitFile[];
}

export interface CommitFile {
  path: string;
  status: "added" | "modified" | "deleted";
  patch: string;
}

export interface TreeEntry {
  path: string;
  type: "file" | "dir";
  size?: number;
  sha: string;
}

export interface Issue {
  id: number;
  number: number;
  title: string;
  body: string;
  status: "open" | "closed";
  author: User;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: number;
  body: string;
  author: User;
  created_at: string;
}

export interface Pipeline {
  id: number;
  status: "pending" | "running" | "success" | "failed";
  steps: PipelineStep[];
  created_at: string;
  finished_at: string | null;
}

export interface PipelineStep {
  name: string;
  status: "pending" | "running" | "success" | "failed";
  output: string;
}

export interface TokenResponse {
  access: string;
  refresh: string;
}

export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

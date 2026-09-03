import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { repos, commits, tree, files, issues, pipelines } from "../api";
import type { Repository, Commit, TreeEntry, Issue, Pipeline } from "../types";
import FileTree from "../components/FileTree";
import DiffViewer from "../components/DiffViewer";

type Tab = "code" | "commits" | "issues" | "ci";

export default function RepoDetail() {
  const { owner, name } = useParams<{ owner: string; name: string }>();
  const [repo, setRepo] = useState<Repository | null>(null);
  const [tab, setTab] = useState<Tab>("code");
  const [commitList, setCommitList] = useState<Commit[]>([]);
  const [treeEntries, setTreeEntries] = useState<TreeEntry[]>([]);
  const [issueList, setIssueList] = useState<Issue[]>([]);
  const [pipelineList, setPipelineList] = useState<Pipeline[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [fileContent, setFileContent] = useState<string>("");
  const [selectedCommit, setSelectedCommit] = useState<string | null>(null);
  const [commitFiles, setCommitFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!owner || !name) return;
    setLoading(true);
    repos
      .get(owner, name)
      .then((res) => setRepo(res.data))
      .finally(() => setLoading(false));
  }, [owner, name]);

  useEffect(() => {
    if (!owner || !name) return;
    if (tab === "commits") {
      commits.list(owner, name).then((res) => setCommitList(res.data.results || []));
    } else if (tab === "code") {
      tree.get(owner, name).then((res) => setTreeEntries(res.data || []));
    } else if (tab === "issues") {
      issues.list(owner, name).then((res) => setIssueList(res.data.results || []));
    } else if (tab === "ci") {
      pipelines.list(owner, name).then((res) => setPipelineList(res.data.results || []));
    }
  }, [owner, name, tab]);

  const handleFileClick = async (path: string) => {
    if (!owner || !name) return;
    setSelectedFile(path);
    setSelectedCommit(null);
    const res = await files.get(owner, name, path);
    setFileContent(res.data);
  };

  const handleCommitClick = async (sha: string) => {
    if (!owner || !name) return;
    setSelectedCommit(sha);
    setSelectedFile(null);
    const res = await commits.get(owner, name, sha);
    setCommitFiles(res.data.files || []);
  };

  if (loading) return <p style={styles.loading}>Загрузка...</p>;
  if (!repo) return <p style={styles.loading}>Репозиторий не найден</p>;

  const tabs: { key: Tab; label: string }[] = [
    { key: "code", label: "Код" },
    { key: "commits", label: "Коммиты" },
    { key: "issues", label: "Issues" },
    { key: "ci", label: "CI" },
  ];

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.repoName}>
          {repo.owner.username}/{repo.name}
        </h1>
        {repo.description && <p style={styles.desc}>{repo.description}</p>}
      </div>

      <div style={styles.tabs}>
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => {
              setTab(t.key);
              setSelectedFile(null);
              setSelectedCommit(null);
            }}
            style={tab === t.key ? styles.tabActive : styles.tab}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div style={styles.content}>
        {tab === "code" && (
          <div style={styles.codeSection}>
            <div style={styles.treePanel}>
              <FileTree entries={treeEntries} onFileClick={handleFileClick} />
            </div>
            <div style={styles.filePanel}>
              {selectedFile ? (
                <pre style={styles.fileContent}>{fileContent}</pre>
              ) : (
                <p style={styles.hint}>Выберите файл</p>
              )}
            </div>
          </div>
        )}

        {tab === "commits" && (
          <div>
            {commitList.map((c) => (
              <div
                key={c.id}
                onClick={() => handleCommitClick(c.sha)}
                style={styles.commitRow}
              >
                <code style={styles.sha}>{c.sha.slice(0, 7)}</code>
                <span>{c.message}</span>
                <span style={styles.date}>
                  {new Date(c.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {selectedCommit && (
              <div style={styles.diffSection}>
                <h3>Diff: {selectedCommit.slice(0, 7)}</h3>
                <DiffViewer files={commitFiles} />
              </div>
            )}
          </div>
        )}

        {tab === "issues" && (
          <div>
            {issueList.map((i) => (
              <div key={i.id} style={styles.issueRow}>
                <span
                  style={{
                    ...styles.statusBadge,
                    background: i.status === "open" ? "#238636" : "#8b949e",
                  }}
                >
                  {i.status}
                </span>
                <span style={styles.issueTitle}>
                  #{i.number} {i.title}
                </span>
              </div>
            ))}
            {issueList.length === 0 && (
              <p style={styles.hint}>Нет Issues</p>
            )}
          </div>
        )}

        {tab === "ci" && (
          <div>
            {pipelineList.map((p) => (
              <div key={p.id} style={styles.pipelineRow}>
                <span
                  style={{
                    ...styles.statusBadge,
                    background:
                      p.status === "success"
                        ? "#238636"
                        : p.status === "failed"
                        ? "#da3633"
                        : "#9e6a03",
                  }}
                >
                  {p.status}
                </span>
                <span>ID: {p.id}</span>
                <span style={styles.date}>
                  {new Date(p.created_at).toLocaleDateString()}
                </span>
              </div>
            ))}
            {pipelineList.length === 0 && (
              <p style={styles.hint}>Нет прогонов CI</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 1100,
    margin: "40px auto",
    padding: "0 24px",
  },
  header: {
    marginBottom: 24,
  },
  repoName: {
    color: "#f0f6fc",
    fontSize: 24,
    margin: 0,
  },
  desc: {
    color: "#8b949e",
    margin: "8px 0 0",
  },
  tabs: {
    display: "flex",
    gap: 4,
    borderBottom: "1px solid #30363d",
    marginBottom: 24,
  },
  tab: {
    background: "none",
    border: "none",
    color: "#8b949e",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 14,
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    background: "none",
    border: "none",
    color: "#f0f6fc",
    padding: "12px 16px",
    cursor: "pointer",
    fontSize: 14,
    borderBottom: "2px solid #f78166",
  },
  content: {
    minHeight: 400,
  },
  codeSection: {
    display: "flex",
    gap: 16,
  },
  treePanel: {
    width: 280,
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: 12,
    flexShrink: 0,
  },
  filePanel: {
    flex: 1,
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: 12,
    overflow: "auto",
  },
  fileContent: {
    margin: 0,
    fontSize: 13,
    lineHeight: 1.5,
    color: "#c9d1d9",
  },
  hint: {
    color: "#8b949e",
    textAlign: "center",
    padding: 40,
  },
  commitRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 8,
    cursor: "pointer",
    color: "#c9d1d9",
    fontSize: 14,
  },
  sha: {
    color: "#58a6ff",
    fontWeight: 600,
  },
  date: {
    marginLeft: "auto",
    color: "#8b949e",
    fontSize: 12,
  },
  diffSection: {
    marginTop: 24,
    color: "#f0f6fc",
  },
  issueRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 8,
    color: "#c9d1d9",
    fontSize: 14,
  },
  statusBadge: {
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
    textTransform: "capitalize",
  },
  issueTitle: {
    flex: 1,
  },
  pipelineRow: {
    display: "flex",
    alignItems: "center",
    gap: 12,
    padding: "10px 12px",
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 8,
    color: "#c9d1d9",
    fontSize: 14,
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#8b949e",
  },
};

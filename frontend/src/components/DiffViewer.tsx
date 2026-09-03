import type { CommitFile } from "../types";

interface Props {
  files: CommitFile[];
}

export default function DiffViewer({ files }: Props) {
  return (
    <div>
      {files.map((file) => (
        <div key={file.path} style={styles.file}>
          <div style={styles.header}>
            <span style={styles.path}>{file.path}</span>
            <span style={{ ...styles.badge, ...badgeColor(file.status) }}>
              {file.status}
            </span>
          </div>
          <pre style={styles.patch}>{file.patch}</pre>
        </div>
      ))}
    </div>
  );
}

function badgeColor(status: string): React.CSSProperties {
  switch (status) {
    case "added":
      return { background: "#238636" };
    case "modified":
      return { background: "#9e6a03" };
    case "deleted":
      return { background: "#da3633" };
    default:
      return {};
  }
}

const styles: Record<string, React.CSSProperties> = {
  file: {
    border: "1px solid #30363d",
    borderRadius: 6,
    marginBottom: 16,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "8px 12px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
  },
  path: {
    fontFamily: "monospace",
    fontSize: 14,
    color: "#c9d1d9",
  },
  badge: {
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
    textTransform: "capitalize",
  },
  patch: {
    margin: 0,
    padding: 12,
    fontSize: 13,
    lineHeight: 1.5,
    overflowX: "auto",
    background: "#0d1117",
    color: "#c9d1d9",
  },
};

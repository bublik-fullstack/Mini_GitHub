import { useState } from "react";
import type { TreeEntry } from "../types";

interface Props {
  entries: TreeEntry[];
  onFileClick: (path: string) => void;
}

export default function FileTree({ entries, onFileClick }: Props) {
  const [expanded, setExpanded] = useState<Set<string>>(new Set());

  const toggleDir = (path: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(path)) next.delete(path);
      else next.add(path);
      return next;
    });
  };

  const sorted = [...entries].sort((a, b) => {
    if (a.type === "dir" && b.type !== "dir") return -1;
    if (a.type !== "dir" && b.type === "dir") return 1;
    return a.path.localeCompare(b.path);
  });

  return (
    <div style={styles.tree}>
      {sorted.map((entry) => (
        <div key={entry.path} style={styles.row}>
          {entry.type === "dir" ? (
            <button onClick={() => toggleDir(entry.path)} style={styles.dirBtn}>
              {expanded.has(entry.path) ? "📂" : "📁"} {entry.path}
            </button>
          ) : (
            <button onClick={() => onFileClick(entry.path)} style={styles.fileBtn}>
              📄 {entry.path}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  tree: {
    fontFamily: "monospace",
    fontSize: 14,
  },
  row: {
    padding: "4px 0",
  },
  dirBtn: {
    background: "none",
    border: "none",
    color: "#58a6ff",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    textAlign: "left",
  },
  fileBtn: {
    background: "none",
    border: "none",
    color: "#c9d1d9",
    cursor: "pointer",
    fontSize: 14,
    padding: 0,
    textAlign: "left",
  },
};

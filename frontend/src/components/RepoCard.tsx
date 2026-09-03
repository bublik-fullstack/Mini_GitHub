import { Link } from "react-router-dom";
import type { Repository } from "../types";

interface Props {
  repo: Repository;
}

export default function RepoCard({ repo }: Props) {
  return (
    <div style={styles.card}>
      <Link to={`/${repo.owner.username}/${repo.name}`} style={styles.name}>
        {repo.name}
      </Link>
      {repo.description && <p style={styles.desc}>{repo.description}</p>}
      <div style={styles.meta}>
        {repo.is_private && <span style={styles.private}>Private</span>}
        <span>Stars: {repo.stars_count}</span>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    border: "1px solid #30363d",
    borderRadius: 6,
    padding: 16,
    background: "#0d1117",
  },
  name: {
    color: "#58a6ff",
    fontSize: 16,
    fontWeight: 600,
    textDecoration: "none",
  },
  desc: {
    color: "#8b949e",
    fontSize: 14,
    margin: "8px 0 0",
  },
  meta: {
    display: "flex",
    gap: 12,
    marginTop: 8,
    fontSize: 12,
    color: "#8b949e",
  },
  private: {
    background: "#da3633",
    color: "#fff",
    padding: "2px 8px",
    borderRadius: 12,
    fontSize: 11,
  },
};

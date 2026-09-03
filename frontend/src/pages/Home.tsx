import { useEffect, useState } from "react";
import { repos } from "../api";
import type { Repository } from "../types";
import RepoCard from "../components/RepoCard";

export default function Home() {
  const [repoList, setRepoList] = useState<Repository[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      setLoading(false);
      return;
    }
    repos
      .list()
      .then((res) => setRepoList(res.data.results || []))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p style={styles.loading}>Загрузка...</p>;

  const token = localStorage.getItem("access_token");

  return (
    <div style={styles.container}>
      {!token ? (
        <div style={styles.hero}>
          <h1>Mini GitHub</h1>
          <p style={styles.sub}>
            Платформа совместной разработки. Храните код, создавайте коммиты,
            работайте с Issues.
          </p>
        </div>
      ) : (
        <>
          <h2 style={styles.title}>Мои репозитории</h2>
          {repoList.length === 0 ? (
            <p style={styles.empty}>Пока нет репозиториев. Создайте первый!</p>
          ) : (
            <div style={styles.grid}>
              {repoList.map((repo) => (
                <RepoCard key={repo.id} repo={repo} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    maxWidth: 900,
    margin: "40px auto",
    padding: "0 24px",
  },
  hero: {
    textAlign: "center",
    padding: "80px 0",
  },
  sub: {
    color: "#8b949e",
    fontSize: 16,
    maxWidth: 500,
    margin: "16px auto 0",
  },
  title: {
    color: "#f0f6fc",
    marginBottom: 24,
  },
  loading: {
    textAlign: "center",
    padding: 40,
    color: "#8b949e",
  },
  empty: {
    color: "#8b949e",
  },
  grid: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
};

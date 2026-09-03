import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { auth } from "../api";
import type { User } from "../types";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (token) {
      auth.me().then((res) => setUser(res.data)).catch(() => {
        localStorage.removeItem("access_token");
      });
    }
  }, []);

  const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    setUser(null);
    navigate("/login");
  };

  return (
    <header style={styles.header}>
      <Link to="/" style={styles.logo}>
        MiniGitHub
      </Link>
      <nav style={styles.nav}>
        {user ? (
          <>
            <Link to={`/users/${user.username}`} style={styles.link}>
              {user.username}
            </Link>
            <button onClick={logout} style={styles.btn}>
              Выйти
            </button>
          </>
        ) : (
          <>
            <Link to="/login" style={styles.link}>
              Войти
            </Link>
            <Link to="/register" style={styles.btn}>
              Регистрация
            </Link>
          </>
        )}
      </nav>
    </header>
  );
}

const styles: Record<string, React.CSSProperties> = {
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "12px 24px",
    background: "#161b22",
    borderBottom: "1px solid #30363d",
  },
  logo: {
    color: "#f0f6fc",
    fontSize: 20,
    fontWeight: 700,
    textDecoration: "none",
  },
  nav: {
    display: "flex",
    gap: 16,
    alignItems: "center",
  },
  link: {
    color: "#c9d1d9",
    textDecoration: "none",
    fontSize: 14,
  },
  btn: {
    background: "#238636",
    color: "#fff",
    border: "none",
    padding: "6px 16px",
    borderRadius: 6,
    cursor: "pointer",
    fontSize: 14,
  },
};

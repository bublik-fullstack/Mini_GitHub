import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../api";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      const res = await auth.login({ username, password });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      navigate("/");
    } catch {
      setError("Неверное имя пользователя или пароль");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Вход</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          type="text"
          placeholder="Имя пользователя"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={styles.input}
          required
        />
        <input
          type="password"
          placeholder="Пароль"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.btn}>
          Войти
        </button>
        <p style={styles.link}>
          Нет аккаунта? <Link to="/register">Зарегистрироваться</Link>
        </p>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    display: "flex",
    justifyContent: "center",
    paddingTop: 80,
  },
  form: {
    width: 360,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  title: {
    color: "#f0f6fc",
    textAlign: "center",
    marginBottom: 8,
  },
  input: {
    padding: "10px 12px",
    borderRadius: 6,
    border: "1px solid #30363d",
    background: "#0d1117",
    color: "#c9d1d9",
    fontSize: 14,
  },
  btn: {
    padding: "10px",
    borderRadius: 6,
    border: "none",
    background: "#238636",
    color: "#fff",
    fontSize: 14,
    cursor: "pointer",
  },
  error: {
    color: "#da3633",
    textAlign: "center",
    fontSize: 14,
  },
  link: {
    color: "#8b949e",
    textAlign: "center",
    fontSize: 14,
  },
};

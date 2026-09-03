import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { auth } from "../api";

export default function Register() {
  const [form, setForm] = useState({
    username: "",
    email: "",
    password: "",
    password2: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.password2) {
      setError("Пароли не совпадают");
      return;
    }
    try {
      await auth.register(form);
      const res = await auth.login({
        username: form.username,
        password: form.password,
      });
      localStorage.setItem("access_token", res.data.access);
      localStorage.setItem("refresh_token", res.data.refresh);
      navigate("/");
    } catch {
      setError("Ошибка регистрации. Проверьте данные.");
    }
  };

  return (
    <div style={styles.container}>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Регистрация</h2>
        {error && <p style={styles.error}>{error}</p>}
        <input
          name="username"
          placeholder="Имя пользователя"
          value={form.username}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="password"
          type="password"
          placeholder="Пароль"
          value={form.password}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <input
          name="password2"
          type="password"
          placeholder="Повторите пароль"
          value={form.password2}
          onChange={handleChange}
          style={styles.input}
          required
        />
        <button type="submit" style={styles.btn}>
          Зарегистрироваться
        </button>
        <p style={styles.link}>
          Уже есть аккаунт? <Link to="/login">Войти</Link>
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

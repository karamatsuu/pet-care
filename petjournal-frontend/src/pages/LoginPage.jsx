import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "../routes/AuthContext.jsx";
import styles from "./FormPage.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await login(form);
      navigate(location.state?.from?.pathname || "/", { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <p className={styles.kicker}>PetJournal</p>
        <h1>Log in</h1>
        {error && <div className={styles.error}>{error}</div>}
        <label>Email
          <input
            autoComplete="email"
            type="email"
            value={form.email}
            onChange={(event) => setForm({ ...form, email: event.target.value })}
            required
          />
        </label>
        <label>Password
          <input
            autoComplete="current-password"
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <button disabled={submitting} type="submit">{submitting ? "Logging in..." : "Log in"}</button>
        <p>New to PetJournal? <Link to="/register">Create an account</Link></p>
      </form>
    </main>
  );
}

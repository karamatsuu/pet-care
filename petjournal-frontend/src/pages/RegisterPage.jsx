import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { useAuth } from "../routes/AuthContext.jsx";
import styles from "./FormPage.module.css";

export default function RegisterPage() {
  const navigate = useNavigate();
  const { register } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await register(form);
      navigate("/", { replace: true });
    } catch (err) {
      setError(err.details ? JSON.stringify(err.details) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className={styles.authShell}>
      <form className={styles.formCard} onSubmit={handleSubmit}>
        <p className={styles.kicker}>PetJournal</p>
        <h1>Create account</h1>
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
            autoComplete="new-password"
            minLength={8}
            type="password"
            value={form.password}
            onChange={(event) => setForm({ ...form, password: event.target.value })}
            required
          />
        </label>
        <button disabled={submitting} type="submit">{submitting ? "Creating..." : "Create account"}</button>
        <p>Already have an account? <Link to="/login">Log in</Link></p>
      </form>
    </main>
  );
}

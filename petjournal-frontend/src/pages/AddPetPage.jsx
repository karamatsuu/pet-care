import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api from "../api/api.js";
import styles from "./FormPage.module.css";

export default function AddPetPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    species: "",
    breed: "",
    birth_date: "",
    weight: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    const payload = {
      name: form.name,
      species: form.species,
      breed: form.breed || null,
      birth_date: form.birth_date || null,
      weight: form.weight || null
    };

    try {
      const pet = await api.pets.create(payload);
      navigate(`/pets/${pet.id}`);
    } catch (err) {
      setError(err.details ? JSON.stringify(err.details) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="page-shell">
      <Link className={styles.backLink} to="/">Back to dashboard</Link>
      <form className={styles.formCardWide} onSubmit={handleSubmit}>
        <h1>Add pet</h1>
        {error && <div className={styles.error}>{error}</div>}
        <label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} required /></label>
        <label>Species<input value={form.species} onChange={(event) => update("species", event.target.value)} required /></label>
        <label>Breed<input value={form.breed} onChange={(event) => update("breed", event.target.value)} /></label>
        <label>Birth date<input type="date" value={form.birth_date} onChange={(event) => update("birth_date", event.target.value)} /></label>
        <label>Weight<input min="0" step="0.01" type="number" value={form.weight} onChange={(event) => update("weight", event.target.value)} /></label>
        <button disabled={submitting} type="submit">{submitting ? "Saving..." : "Save pet"}</button>
      </form>
    </main>
  );
}

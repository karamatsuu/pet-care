import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";

import api from "../api/api.js";
import styles from "./FormPage.module.css";

export default function EditPetPage() {
  const { petId } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState(null);
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    api.pets.get(petId)
      .then((pet) => setForm({
        name: pet.name || "",
        species: pet.species || "",
        breed: pet.breed || "",
        birth_date: pet.birth_date || "",
        weight: pet.weight || ""
      }))
      .catch((err) => setError(err.message));
  }, [petId]);

  function update(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      await api.pets.update(petId, {
        ...form,
        breed: form.breed || null,
        birth_date: form.birth_date || null,
        weight: form.weight || null
      });
      navigate(`/pets/${petId}`);
    } catch (err) {
      setError(err.details ? JSON.stringify(err.details) : err.message);
    } finally {
      setSubmitting(false);
    }
  }

  if (!form) {
    return <main className="page-shell">Loading pet...</main>;
  }

  return (
    <main className="page-shell">
      <Link className={styles.backLink} to={`/pets/${petId}`}>Back to profile</Link>
      <form className={styles.formCardWide} onSubmit={handleSubmit}>
        <h1>Edit pet</h1>
        {error && <div className={styles.error}>{error}</div>}
        <label>Name<input value={form.name} onChange={(event) => update("name", event.target.value)} required /></label>
        <label>Species<input value={form.species} onChange={(event) => update("species", event.target.value)} required /></label>
        <label>Breed<input value={form.breed} onChange={(event) => update("breed", event.target.value)} /></label>
        <label>Birth date<input type="date" value={form.birth_date} onChange={(event) => update("birth_date", event.target.value)} /></label>
        <label>Weight<input min="0" step="0.01" type="number" value={form.weight} onChange={(event) => update("weight", event.target.value)} /></label>
        <button disabled={submitting} type="submit">{submitting ? "Saving..." : "Save changes"}</button>
      </form>
    </main>
  );
}

import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import api, { API_BASE_URL } from "../api/api.js";
import { useAuth } from "../routes/AuthContext.jsx";
import styles from "./DashboardPage.module.css";

function photoSrc(photoUrl) {
  if (!photoUrl) return null;
  return photoUrl.startsWith("http") ? photoUrl : `${API_BASE_URL}${photoUrl}`;
}

function formatDate(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric"
  }).format(new Date(value));
}

export default function DashboardPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadPets() {
      try {
        const items = await api.pets.list();
        if (mounted) setPets(items);
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadPets();
    return () => {
      mounted = false;
    };
  }, []);

  async function handleLogout() {
    await logout();
    navigate("/login", { replace: true });
  }

  return (
    <main className="page-shell">
      <header className={styles.header}>
        <div>
          <p className={styles.kicker}>PetJournal</p>
          <h1>My pets</h1>
          <p className={styles.subtitle}>Care profiles, health records, feeding notes, and upcoming visits.</p>
        </div>
        <div className={styles.actions}>
          <span className={styles.email}>{user?.email}</span>
          <Link className={styles.primaryButton} to="/pets/new">Add pet</Link>
          <button className={styles.secondaryButton} type="button" onClick={handleLogout}>Log out</button>
        </div>
      </header>

      {error && <div className={styles.error}>{error}</div>}
      {loading && <div className={styles.empty}>Loading pets...</div>}

      {!loading && pets.length === 0 && (
        <section className={styles.empty}>
          <h2>No pets yet</h2>
          <p>Add your first pet to start tracking health notes and care routines.</p>
          <Link className={styles.primaryButton} to="/pets/new">Add pet</Link>
        </section>
      )}

      <section className={styles.grid} aria-label="Pets">
        {pets.map((pet) => (
          <Link className={styles.card} to={`/pets/${pet.id}`} key={pet.id}>
            <div className={styles.photo}>
              {photoSrc(pet.photo_url) ? (
                <img src={photoSrc(pet.photo_url)} alt={pet.name} />
              ) : (
                <span>{pet.name?.slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <div className={styles.cardBody}>
              <div className={styles.cardTitle}>
                <h2>{pet.name}</h2>
                <span>{pet.species}</span>
              </div>
              <dl className={styles.meta}>
                <div>
                  <dt>Breed</dt>
                  <dd>{pet.breed || "Unknown"}</dd>
                </div>
                <div>
                  <dt>Weight</dt>
                  <dd>{pet.weight ? `${pet.weight}` : "Not logged"}</dd>
                </div>
                <div>
                  <dt>Birthday</dt>
                  <dd>{formatDate(pet.birth_date)}</dd>
                </div>
              </dl>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

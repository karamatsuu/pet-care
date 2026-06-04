import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";

import api, { API_BASE_URL } from "../api/api.js";
import styles from "./PetProfilePage.module.css";

const tabs = [
  { id: "overview", label: "Overview" },
  { id: "vaccinations", label: "Vaccinations" },
  { id: "medications", label: "Medications" },
  { id: "appointments", label: "Appointments" },
  { id: "weight", label: "Weight" },
  { id: "feeding", label: "Feeding" }
];

function fullPhotoUrl(photoUrl) {
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

function formatDateTime(value) {
  if (!value) return "Not set";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  }).format(new Date(value));
}

function EmptyState({ children }) {
  return <div className={styles.empty}>{children}</div>;
}

export default function PetProfilePage() {
  const { petId } = useParams();
  const [activeTab, setActiveTab] = useState("overview");
  const [pet, setPet] = useState(null);
  const [records, setRecords] = useState({
    vaccinations: [],
    medications: [],
    appointments: [],
    weightLogs: [],
    feedingLogs: []
  });
  const [photoFile, setPhotoFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    async function loadProfile() {
      setLoading(true);
      setError("");

      try {
        const [
          petData,
          vaccinations,
          medications,
          appointments,
          weightLogs,
          feedingLogs
        ] = await Promise.all([
          api.pets.get(petId),
          api.pets.vaccinations(petId),
          api.pets.medications(petId),
          api.pets.appointments(petId),
          api.pets.weightLogs(petId),
          api.pets.feedingLogs(petId)
        ]);

        if (!mounted) return;

        setPet(petData);
        setRecords({ vaccinations, medications, appointments, weightLogs, feedingLogs });
      } catch (err) {
        if (mounted) setError(err.message);
      } finally {
        if (mounted) setLoading(false);
      }
    }

    loadProfile();
    return () => {
      mounted = false;
    };
  }, [petId]);

  const latestWeight = useMemo(() => records.weightLogs[0]?.weight || pet?.weight, [records.weightLogs, pet]);
  const nextAppointment = useMemo(() => records.appointments[0], [records.appointments]);

  async function handlePhotoUpload(event) {
    event.preventDefault();
    if (!photoFile) return;

    setUploading(true);
    setError("");

    try {
      const result = await api.pets.uploadPhoto(petId, photoFile);
      setPet(result.pet);
      setPhotoFile(null);
      event.currentTarget.reset();
    } catch (err) {
      setError(err.details?.photo?.[0] || err.message);
    } finally {
      setUploading(false);
    }
  }

  if (loading) {
    return <main className="page-shell">Loading pet profile...</main>;
  }

  if (error && !pet) {
    return (
      <main className="page-shell">
        <div className={styles.error}>{error}</div>
        <Link className={styles.backLink} to="/">Back to dashboard</Link>
      </main>
    );
  }

  return (
    <main className="page-shell">
      <Link className={styles.backLink} to="/">Back to dashboard</Link>

      <section className={styles.hero}>
        <div className={styles.photo}>
          {fullPhotoUrl(pet.photo_url) ? (
            <img src={fullPhotoUrl(pet.photo_url)} alt={pet.name} />
          ) : (
            <span>{pet.name?.slice(0, 1).toUpperCase()}</span>
          )}
        </div>

        <div className={styles.heroContent}>
          <p className={styles.kicker}>{pet.species}</p>
          <h1>{pet.name}</h1>
          <dl className={styles.summary}>
            <div>
              <dt>Breed</dt>
              <dd>{pet.breed || "Unknown"}</dd>
            </div>
            <div>
              <dt>Birth date</dt>
              <dd>{formatDate(pet.birth_date)}</dd>
            </div>
            <div>
              <dt>Current weight</dt>
              <dd>{latestWeight ? `${latestWeight}` : "Not logged"}</dd>
            </div>
          </dl>
        </div>

        <div className={styles.heroActions}>
          <Link className={styles.primaryButton} to={`/pets/${pet.id}/edit`}>Edit pet</Link>
          <form className={styles.uploadForm} onSubmit={handlePhotoUpload}>
            <input
              accept="image/jpeg,image/png"
              name="photo"
              type="file"
              onChange={(event) => setPhotoFile(event.target.files?.[0] || null)}
            />
            <button className={styles.secondaryButton} disabled={!photoFile || uploading} type="submit">
              {uploading ? "Uploading..." : "Upload photo"}
            </button>
          </form>
        </div>
      </section>

      {error && <div className={styles.error}>{error}</div>}

      <nav className={styles.tabs} aria-label="Pet profile sections">
        {tabs.map((tab) => (
          <button
            className={activeTab === tab.id ? styles.activeTab : ""}
            key={tab.id}
            type="button"
            onClick={() => setActiveTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <section className={styles.panel}>
        {activeTab === "overview" && (
          <div className={styles.overviewGrid}>
            <article>
              <h2>Next appointment</h2>
              {nextAppointment ? (
                <p>{formatDateTime(nextAppointment.date)} with {nextAppointment.vet_name} for {nextAppointment.reason}.</p>
              ) : (
                <p>No upcoming appointments recorded.</p>
              )}
            </article>
            <article>
              <h2>Care totals</h2>
              <ul className={styles.statList}>
                <li><span>Vaccinations</span><strong>{records.vaccinations.length}</strong></li>
                <li><span>Medications</span><strong>{records.medications.length}</strong></li>
                <li><span>Weight logs</span><strong>{records.weightLogs.length}</strong></li>
                <li><span>Feeding logs</span><strong>{records.feedingLogs.length}</strong></li>
              </ul>
            </article>
          </div>
        )}

        {activeTab === "vaccinations" && (
          <RecordList empty="No vaccinations recorded.">
            {records.vaccinations.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>Given {formatDate(item.date_given)} · Next due {formatDate(item.next_due)}</span>
                {item.notes && <p>{item.notes}</p>}
              </li>
            ))}
          </RecordList>
        )}

        {activeTab === "medications" && (
          <RecordList empty="No medications recorded.">
            {records.medications.map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.dosage} · {item.frequency}</span>
                <span>{formatDate(item.start_date)} to {formatDate(item.end_date)}</span>
                {item.notes && <p>{item.notes}</p>}
              </li>
            ))}
          </RecordList>
        )}

        {activeTab === "appointments" && (
          <RecordList empty="No appointments recorded.">
            {records.appointments.map((item) => (
              <li key={item.id}>
                <strong>{item.reason}</strong>
                <span>{formatDateTime(item.date)} · {item.vet_name}</span>
                {item.notes && <p>{item.notes}</p>}
              </li>
            ))}
          </RecordList>
        )}

        {activeTab === "weight" && (
          <RecordList empty="No weight logs recorded.">
            {records.weightLogs.map((item) => (
              <li key={item.id}>
                <strong>{item.weight}</strong>
                <span>{formatDateTime(item.recorded_at)}</span>
              </li>
            ))}
          </RecordList>
        )}

        {activeTab === "feeding" && (
          <RecordList empty="No feeding logs recorded.">
            {records.feedingLogs.map((item) => (
              <li key={item.id}>
                <strong>{item.food_type}</strong>
                <span>{item.amount} · {formatDateTime(item.fed_at)}</span>
              </li>
            ))}
          </RecordList>
        )}
      </section>
    </main>
  );
}

function RecordList({ children, empty }) {
  const items = Array.isArray(children) ? children.filter(Boolean) : children;
  if (!items || items.length === 0) {
    return <EmptyState>{empty}</EmptyState>;
  }
  return <ul className={styles.recordList}>{children}</ul>;
}

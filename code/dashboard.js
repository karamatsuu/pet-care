const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "petjournal_auth_token";

const elements = {
  userEmail: document.querySelector("#userEmail"),
  logoutButton: document.querySelector("#logoutButton"),
  alert: document.querySelector("#pageAlert"),
  petsGrid: document.querySelector("#petsGrid"),
  emptyState: document.querySelector("#emptyState"),
  petCount: document.querySelector("#petCount"),
  appointmentsList: document.querySelector("#appointmentsList"),
  medicationsList: document.querySelector("#medicationsList")
};

function authHeaders(extra = {}) {
  const token = sessionStorage.getItem(TOKEN_KEY);
  return token ? { ...extra, Authorization: `Bearer ${token}` } : extra;
}

async function apiRequest(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: authHeaders(options.headers || {}),
    credentials: "include"
  });

  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json") ? await response.json() : null;

  if (!response.ok || payload?.success === false) {
    const error = payload?.error || response.statusText || "Request failed";
    throw new Error(typeof error === "string" ? error : JSON.stringify(error));
  }

  return payload?.data ?? payload;
}

function showAlert(message) {
  elements.alert.textContent = message;
  elements.alert.hidden = false;
}

function clearAlert() {
  elements.alert.textContent = "";
  elements.alert.hidden = true;
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function photoUrl(photoPath) {
  if (!photoPath) return null;
  return photoPath.startsWith("http") ? photoPath : `${API_BASE_URL}${photoPath}`;
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

function calculateAge(birthDate) {
  if (!birthDate) return "Not set";
  const born = new Date(`${birthDate}T00:00:00`);
  const today = new Date();
  let years = today.getFullYear() - born.getFullYear();
  let months = today.getMonth() - born.getMonth();

  if (today.getDate() < born.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years > 0) return `${years} year${years === 1 ? "" : "s"}`;
  return `${Math.max(months, 0)} month${months === 1 ? "" : "s"}`;
}

function isWithinNextSevenDays(value) {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  const end = new Date(now);
  end.setDate(now.getDate() + 7);
  return date >= now && date <= end;
}

function medicationDueInNextSevenDays(item) {
  const today = new Date();
  const sevenDays = new Date(today);
  sevenDays.setDate(today.getDate() + 7);

  const start = item.start_date ? new Date(`${item.start_date}T00:00:00`) : null;
  const end = item.end_date ? new Date(`${item.end_date}T23:59:59`) : null;

  if (start && start > sevenDays) return false;
  if (end && end < today) return false;
  return true;
}

async function loadUser() {
  try {
    const data = await apiRequest("/auth/me");
    const user = data.user || data;
    elements.userEmail.textContent = user.email || "Signed in";
  } catch {
    elements.userEmail.textContent = "Signed in";
  }
}

async function logout() {
  try {
    await apiRequest("/auth/logout", { method: "POST" });
  } finally {
    sessionStorage.removeItem(TOKEN_KEY);
    window.location.href = "index.html";
  }
}

async function loadPets() {
  clearAlert();
  elements.petsGrid.innerHTML = `<p class="muted">Loading pets...</p>`;

  try {
    const data = await apiRequest("/pets");
    const pets = data.pets || [];
    renderPets(pets);
    loadCareSummary(pets);
  } catch (error) {
    elements.petsGrid.innerHTML = "";
    showAlert(error.message);
  }
}

function renderPets(pets) {
  elements.petCount.textContent = `${pets.length} pet${pets.length === 1 ? "" : "s"}`;
  elements.emptyState.hidden = pets.length !== 0;

  if (!pets.length) {
    elements.petsGrid.innerHTML = "";
    elements.appointmentsList.innerHTML = `<p class="muted">No pets yet.</p>`;
    elements.medicationsList.innerHTML = `<p class="muted">No pets yet.</p>`;
    return;
  }

  elements.petsGrid.innerHTML = pets.map((pet) => {
    const src = photoUrl(pet.photo_url);
    return `
      <a class="pet-card" href="pet-profile.html?id=${encodeURIComponent(pet.id)}">
        <div class="pet-photo">
          ${src
            ? `<img src="${src}" alt="${escapeHtml(pet.name)}">`
            : `<span>${escapeHtml((pet.name || "?").slice(0, 1).toUpperCase())}</span>`}
        </div>
        <div class="pet-body">
          <div class="pet-title">
            <h3>${escapeHtml(pet.name || "Unnamed pet")}</h3>
            <span class="species-pill">${escapeHtml(pet.species || "Pet")}</span>
          </div>
          <dl class="pet-facts">
            <div>
              <dt>Breed</dt>
              <dd>${escapeHtml(pet.breed || "Unknown")}</dd>
            </div>
            <div>
              <dt>Age</dt>
              <dd>${escapeHtml(calculateAge(pet.birth_date))}</dd>
            </div>
          </dl>
        </div>
      </a>
    `;
  }).join("");
}

async function loadCareSummary(pets) {
  elements.appointmentsList.innerHTML = `<p class="muted">Loading appointments...</p>`;
  elements.medicationsList.innerHTML = `<p class="muted">Loading medications...</p>`;

  try {
    const careData = await Promise.all(pets.map(async (pet) => {
      const [appointmentsData, medicationsData] = await Promise.all([
        apiRequest(`/pets/${pet.id}/appointments`),
        apiRequest(`/pets/${pet.id}/medications`)
      ]);

      return {
        pet,
        appointments: appointmentsData.appointments || [],
        medications: medicationsData.medications || []
      };
    }));

    const appointments = careData
      .flatMap(({ pet, appointments }) => appointments.map((item) => ({ ...item, pet })))
      .filter((item) => isWithinNextSevenDays(item.date))
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const medications = careData
      .flatMap(({ pet, medications }) => medications.map((item) => ({ ...item, pet })))
      .filter(medicationDueInNextSevenDays)
      .sort((a, b) => String(a.name).localeCompare(String(b.name)));

    renderAppointments(appointments);
    renderMedications(medications);
  } catch (error) {
    elements.appointmentsList.innerHTML = `<p class="muted">Could not load appointments.</p>`;
    elements.medicationsList.innerHTML = `<p class="muted">Could not load medications.</p>`;
    showAlert(error.message);
  }
}

function renderAppointments(appointments) {
  if (!appointments.length) {
    elements.appointmentsList.innerHTML = `<p class="muted">No appointments in the next 7 days.</p>`;
    return;
  }

  elements.appointmentsList.innerHTML = appointments.map((item) => `
    <article class="care-card">
      <div class="care-date">${formatDateTime(item.date)}</div>
      <strong>${escapeHtml(item.pet.name)} · ${escapeHtml(item.reason)}</strong>
      <p>${escapeHtml(item.vet_name || "Vet not set")}</p>
    </article>
  `).join("");
}

function renderMedications(medications) {
  if (!medications.length) {
    elements.medicationsList.innerHTML = `<p class="muted">No medications due in the next 7 days.</p>`;
    return;
  }

  elements.medicationsList.innerHTML = medications.map((item) => `
    <article class="care-card">
      <div class="care-date">${formatDate(item.start_date)}${item.end_date ? ` to ${formatDate(item.end_date)}` : ""}</div>
      <strong>${escapeHtml(item.pet.name)} · ${escapeHtml(item.name)}</strong>
      <p>${escapeHtml(item.dosage)} · ${escapeHtml(item.frequency)}</p>
    </article>
  `).join("");
}

elements.logoutButton.addEventListener("click", logout);

loadUser();
loadPets();

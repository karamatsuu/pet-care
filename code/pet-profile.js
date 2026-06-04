const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "petjournal_auth_token";

const tabConfig = {
  vaccinations: {
    label: "Vaccinations",
    title: "Vaccination records",
    path: "vaccinations",
    collectionKey: "vaccinations",
    render: renderVaccinations,
    fields: [
      { name: "name", label: "Vaccine name", type: "text", required: true },
      { name: "date_given", label: "Date given", type: "date", required: true },
      { name: "next_due", label: "Next due", type: "date" },
      { name: "notes", label: "Notes", type: "textarea", full: true }
    ]
  },
  medications: {
    label: "Medications",
    title: "Medication records",
    path: "medications",
    collectionKey: "medications",
    render: renderMedications,
    fields: [
      { name: "name", label: "Medication name", type: "text", required: true },
      { name: "dosage", label: "Dosage", type: "text", required: true },
      { name: "frequency", label: "Frequency", type: "text", required: true },
      { name: "start_date", label: "Start date", type: "date", required: true },
      { name: "end_date", label: "End date", type: "date" },
      { name: "notes", label: "Notes", type: "textarea", full: true }
    ]
  },
  appointments: {
    label: "Appointments",
    title: "Appointment records",
    path: "appointments",
    collectionKey: "appointments",
    render: renderAppointments,
    fields: [
      { name: "vet_name", label: "Vet name", type: "text", required: true },
      { name: "date", label: "Date and time", type: "datetime-local", required: true },
      { name: "reason", label: "Reason", type: "text", required: true },
      { name: "notes", label: "Notes", type: "textarea", full: true }
    ]
  },
  weight: {
    label: "Weight",
    title: "Weight history",
    path: "weight-logs",
    collectionKey: "weight_logs",
    render: renderWeightLogs,
    fields: [
      { name: "weight", label: "Weight", type: "number", step: "0.01", required: true },
      { name: "recorded_at", label: "Recorded at", type: "datetime-local" }
    ]
  },
  feeding: {
    label: "Feeding Log",
    title: "Feeding log",
    path: "feeding-logs",
    collectionKey: "feeding_logs",
    render: renderFeedingLogs,
    fields: [
      { name: "food_type", label: "Food type", type: "text", required: true },
      { name: "amount", label: "Amount", type: "text", required: true },
      { name: "fed_at", label: "Fed at", type: "datetime-local" }
    ]
  }
};

const state = {
  petId: new URLSearchParams(window.location.search).get("id"),
  activeTab: "vaccinations",
  records: {}
};

const elements = {
  alert: document.querySelector("#pageAlert"),
  petName: document.querySelector("#petName"),
  petSpecies: document.querySelector("#petSpecies"),
  petBreed: document.querySelector("#petBreed"),
  petAge: document.querySelector("#petAge"),
  petBirthDate: document.querySelector("#petBirthDate"),
  petPhoto: document.querySelector("#petPhoto"),
  tabs: document.querySelectorAll(".tab"),
  activeTabLabel: document.querySelector("#activeTabLabel"),
  recordsTitle: document.querySelector("#recordsTitle"),
  recordsList: document.querySelector("#recordsList"),
  addEntryButton: document.querySelector("#addEntryButton"),
  inlineFormWrap: document.querySelector("#inlineFormWrap")
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

function photoUrl(photoPath) {
  if (!photoPath) return null;
  return photoPath.startsWith("http") ? photoPath : `${API_BASE_URL}${photoPath}`;
}

async function loadPet() {
  if (!state.petId) {
    showAlert("Missing pet ID in the URL. Open this page as pet-profile.html?id=1.");
    return;
  }

  try {
    const data = await apiRequest(`/pets/${state.petId}`);
    const pet = data.pet || data;
    renderPet(pet);
  } catch (error) {
    showAlert(error.message);
  }
}

function renderPet(pet) {
  elements.petName.textContent = pet.name || "Unnamed pet";
  elements.petSpecies.textContent = pet.species || "Pet";
  elements.petBreed.textContent = pet.breed || "Unknown";
  elements.petAge.textContent = calculateAge(pet.birth_date);
  elements.petBirthDate.textContent = formatDate(pet.birth_date);

  const src = photoUrl(pet.photo_url);
  elements.petPhoto.innerHTML = src
    ? `<img src="${src}" alt="${escapeHtml(pet.name)}">`
    : `<span>${escapeHtml((pet.name || "?").slice(0, 1).toUpperCase())}</span>`;
}

async function loadTab(tabId) {
  const config = tabConfig[tabId];
  state.activeTab = tabId;
  clearAlert();
  setActiveTabButton(tabId);
  elements.activeTabLabel.textContent = config.label;
  elements.recordsTitle.textContent = config.title;
  elements.inlineFormWrap.hidden = true;
  elements.inlineFormWrap.innerHTML = "";
  elements.recordsList.innerHTML = `<div class="empty-state"><h3>Loading...</h3><p>Fetching ${config.label.toLowerCase()}.</p></div>`;

  try {
    const data = await apiRequest(`/pets/${state.petId}/${config.path}`);
    const records = data[config.collectionKey] || [];
    state.records[tabId] = records;
    config.render(records);
  } catch (error) {
    showAlert(error.message);
    elements.recordsList.innerHTML = "";
  }
}

function setActiveTabButton(tabId) {
  elements.tabs.forEach((button) => {
    button.classList.toggle("active", button.dataset.tab === tabId);
  });
}

function renderEmpty() {
  const template = document.querySelector("#emptyTemplate");
  elements.recordsList.innerHTML = "";
  elements.recordsList.append(template.content.cloneNode(true));
}

function renderCards(records, buildCard) {
  if (!records.length) {
    renderEmpty();
    return;
  }
  elements.recordsList.innerHTML = records.map(buildCard).join("");
  bindDeleteButtons();
}

function renderVaccinations(records) {
  renderCards(records, (item) => `
    <article class="record-card">
      <header>
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <div class="record-meta">
            <span>Given ${formatDate(item.date_given)}</span>
            <span>Next due ${formatDate(item.next_due)}</span>
          </div>
        </div>
        <button class="danger-button" data-delete-id="${item.id}" type="button">Delete</button>
      </header>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
    </article>
  `);
}

function renderMedications(records) {
  renderCards(records, (item) => `
    <article class="record-card">
      <header>
        <div>
          <h3>${escapeHtml(item.name)}</h3>
          <div class="record-meta">
            <span>${escapeHtml(item.dosage)}</span>
            <span>${escapeHtml(item.frequency)}</span>
            <span>${formatDate(item.start_date)} to ${formatDate(item.end_date)}</span>
          </div>
        </div>
        <button class="danger-button" data-delete-id="${item.id}" type="button">Delete</button>
      </header>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
    </article>
  `);
}

function renderAppointments(records) {
  renderCards(records, (item) => `
    <article class="record-card">
      <header>
        <div>
          <h3>${escapeHtml(item.reason)}</h3>
          <div class="record-meta">
            <span>${formatDateTime(item.date)}</span>
            <span>${escapeHtml(item.vet_name)}</span>
          </div>
        </div>
        <button class="danger-button" data-delete-id="${item.id}" type="button">Delete</button>
      </header>
      ${item.notes ? `<p>${escapeHtml(item.notes)}</p>` : ""}
    </article>
  `);
}

function renderWeightLogs(records) {
  if (!records.length) {
    renderEmpty();
    return;
  }
  elements.recordsList.innerHTML = `
    <table class="record-table">
      <thead><tr><th>Weight</th><th>Recorded at</th><th>Action</th></tr></thead>
      <tbody>
        ${records.map((item) => `
          <tr>
            <td>${escapeHtml(String(item.weight))}</td>
            <td>${formatDateTime(item.recorded_at)}</td>
            <td><button class="danger-button" data-delete-id="${item.id}" type="button">Delete</button></td>
          </tr>
        `).join("")}
      </tbody>
    </table>
  `;
  bindDeleteButtons();
}

function renderFeedingLogs(records) {
  renderCards(records, (item) => `
    <article class="record-card">
      <header>
        <div>
          <h3>${escapeHtml(item.food_type)}</h3>
          <div class="record-meta">
            <span>${escapeHtml(item.amount)}</span>
            <span>${formatDateTime(item.fed_at)}</span>
          </div>
        </div>
        <button class="danger-button" data-delete-id="${item.id}" type="button">Delete</button>
      </header>
    </article>
  `);
}

function bindDeleteButtons() {
  elements.recordsList.querySelectorAll("[data-delete-id]").forEach((button) => {
    button.addEventListener("click", async () => {
      const config = tabConfig[state.activeTab];
      const recordId = button.dataset.deleteId;
      const confirmed = window.confirm("Delete this entry? This cannot be undone.");
      if (!confirmed) return;

      try {
        await apiRequest(`/pets/${state.petId}/${config.path}/${recordId}`, { method: "DELETE" });
        await loadTab(state.activeTab);
      } catch (error) {
        showAlert(error.message);
      }
    });
  });
}

function openInlineForm() {
  const config = tabConfig[state.activeTab];
  elements.inlineFormWrap.hidden = false;
  elements.inlineFormWrap.innerHTML = `
    <form class="inline-form" id="entryForm">
      <div class="form-grid">
        ${config.fields.map(renderField).join("")}
      </div>
      <div class="form-actions">
        <button class="primary-button" type="submit">Save entry</button>
        <button class="secondary-button" type="button" id="cancelEntry">Cancel</button>
      </div>
    </form>
  `;

  document.querySelector("#cancelEntry").addEventListener("click", () => {
    elements.inlineFormWrap.hidden = true;
    elements.inlineFormWrap.innerHTML = "";
  });

  document.querySelector("#entryForm").addEventListener("submit", submitInlineForm);
}

function renderField(field) {
  const required = field.required ? "required" : "";
  const full = field.full ? " full-width" : "";
  const step = field.step ? `step="${field.step}"` : "";

  if (field.type === "textarea") {
    return `
      <label class="${full}">
        ${field.label}
        <textarea name="${field.name}" rows="3" ${required}></textarea>
      </label>
    `;
  }

  return `
    <label class="${full}">
      ${field.label}
      <input name="${field.name}" type="${field.type}" ${step} ${required}>
    </label>
  `;
}

async function submitInlineForm(event) {
  event.preventDefault();
  clearAlert();

  const config = tabConfig[state.activeTab];
  const formData = new FormData(event.currentTarget);
  const payload = {};

  config.fields.forEach((field) => {
    const value = formData.get(field.name);
    if (value !== "") payload[field.name] = value;
  });

  try {
    await apiRequest(`/pets/${state.petId}/${config.path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    elements.inlineFormWrap.hidden = true;
    elements.inlineFormWrap.innerHTML = "";
    await loadTab(state.activeTab);
  } catch (error) {
    showAlert(error.message);
  }
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

elements.tabs.forEach((button) => {
  button.addEventListener("click", () => loadTab(button.dataset.tab));
});

elements.addEntryButton.addEventListener("click", openInlineForm);

loadPet();
if (state.petId) {
  loadTab(state.activeTab);
}

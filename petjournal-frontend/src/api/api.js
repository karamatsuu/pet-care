const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "petjournal_auth_token";

class ApiError extends Error {
  constructor(message, status, details) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function getToken() {
  return sessionStorage.getItem(TOKEN_KEY);
}

function setToken(token) {
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

function clearToken() {
  sessionStorage.removeItem(TOKEN_KEY);
}

function buildHeaders(body, extraHeaders = {}) {
  const headers = new Headers(extraHeaders);
  const token = getToken();

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  if (body && !(body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  return headers;
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";
  const payload = contentType.includes("application/json")
    ? await response.json()
    : null;

  if (!response.ok || payload?.success === false) {
    const serverError = payload?.error || response.statusText || "Request failed";
    const message = typeof serverError === "string" ? serverError : "Validation failed";

    throw new ApiError(message, response.status, serverError);
  }

  return payload?.data ?? payload;
}

async function request(path, options = {}) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: buildHeaders(options.body, options.headers),
  });

  return parseResponse(response);
}

function jsonRequest(method, path, body) {
  return request(path, {
    method,
    body: body === undefined ? undefined : JSON.stringify(body),
  });
}

function deleteRequest(path) {
  return request(path, { method: "DELETE" });
}

export async function register(payload) {
  const data = await jsonRequest("POST", "/auth/register", payload);
  setToken(data?.access_token || data?.token);
  return data;
}

export async function login(credentials) {
  const data = await jsonRequest("POST", "/auth/login", credentials);
  setToken(data?.access_token || data?.token);
  return data;
}

export async function logout() {
  try {
    return await jsonRequest("POST", "/auth/logout");
  } finally {
    clearToken();
  }
}

export async function getMe() {
  return request("/auth/me");
}

export async function getAllPets() {
  return request("/pets");
}

export async function getPetById(id) {
  return request(`/pets/${id}`);
}

export async function createPet(payload) {
  return jsonRequest("POST", "/pets", payload);
}

export async function updatePet(id, payload) {
  return jsonRequest("PUT", `/pets/${id}`, payload);
}

export async function deletePet(id) {
  return deleteRequest(`/pets/${id}`);
}

export async function uploadPetPhoto(id, file) {
  const body = new FormData();
  body.append("photo", file);
  return request(`/pets/${id}/photo`, {
    method: "POST",
    body,
  });
}

export async function getVaccinationsByPet(petId) {
  return request(`/pets/${petId}/vaccinations`);
}

export async function createVaccination(petId, payload) {
  return jsonRequest("POST", `/pets/${petId}/vaccinations`, payload);
}

export async function deleteVaccination(petId, vaccinationId) {
  return deleteRequest(`/pets/${petId}/vaccinations/${vaccinationId}`);
}

export async function getMedicationsByPet(petId) {
  return request(`/pets/${petId}/medications`);
}

export async function createMedication(petId, payload) {
  return jsonRequest("POST", `/pets/${petId}/medications`, payload);
}

export async function deleteMedication(petId, medicationId) {
  return deleteRequest(`/pets/${petId}/medications/${medicationId}`);
}

export async function getAppointmentsByPet(petId) {
  return request(`/pets/${petId}/appointments`);
}

export async function createAppointment(petId, payload) {
  return jsonRequest("POST", `/pets/${petId}/appointments`, payload);
}

export async function deleteAppointment(petId, appointmentId) {
  return deleteRequest(`/pets/${petId}/appointments/${appointmentId}`);
}

export async function getWeightLogsByPet(petId) {
  return request(`/pets/${petId}/weight-logs`);
}

export async function createWeightLog(petId, payload) {
  return jsonRequest("POST", `/pets/${petId}/weight-logs`, payload);
}

export async function getFeedingLogsByPet(petId) {
  return request(`/pets/${petId}/feeding-logs`);
}

export async function createFeedingLog(petId, payload) {
  return jsonRequest("POST", `/pets/${petId}/feeding-logs`, payload);
}

const api = {
  auth: {
    register,
    login,
    logout,
    getMe,
    me: getMe,
    getToken,
    setToken,
    clearToken,
  },
  pets: {
    getAll: getAllPets,
    list: getAllPets,
    getById: getPetById,
    get: getPetById,
    create: createPet,
    update: updatePet,
    delete: deletePet,
    remove: deletePet,
    uploadPhoto: uploadPetPhoto,
    vaccinations: getVaccinationsByPet,
    medications: getMedicationsByPet,
    appointments: getAppointmentsByPet,
    weightLogs: getWeightLogsByPet,
    feedingLogs: getFeedingLogsByPet,
  },
  vaccinations: {
    getByPet: getVaccinationsByPet,
    create: createVaccination,
    delete: deleteVaccination,
  },
  medications: {
    getByPet: getMedicationsByPet,
    create: createMedication,
    delete: deleteMedication,
  },
  appointments: {
    getByPet: getAppointmentsByPet,
    create: createAppointment,
    delete: deleteAppointment,
  },
  weightLogs: {
    getByPet: getWeightLogsByPet,
    create: createWeightLog,
  },
  feedingLogs: {
    getByPet: getFeedingLogsByPet,
    create: createFeedingLog,
  },
};

export default api;
export { API_BASE_URL, ApiError, clearToken, getToken, setToken };

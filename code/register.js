const API_BASE_URL = "http://localhost:5000";
const TOKEN_KEY = "petjournal_auth_token";

const form = document.querySelector("#registerForm");
const submitButton = document.querySelector("#submitButton");
const apiError = document.querySelector("#apiError");

const fields = {
  email: document.querySelector("#email"),
  password: document.querySelector("#password"),
  confirmPassword: document.querySelector("#confirmPassword")
};

const errors = {
  email: document.querySelector("#emailError"),
  password: document.querySelector("#passwordError"),
  confirmPassword: document.querySelector("#confirmPasswordError")
};

function setFieldError(name, message) {
  errors[name].textContent = message || "";
  fields[name].classList.toggle("invalid", Boolean(message));
}

function clearErrors() {
  apiError.hidden = true;
  apiError.textContent = "";
  Object.keys(errors).forEach((name) => setFieldError(name, ""));
}

function validate() {
  clearErrors();
  let valid = true;
  const email = fields.email.value.trim();
  const password = fields.password.value;
  const confirmPassword = fields.confirmPassword.value;

  if (!email) {
    setFieldError("email", "Email is required.");
    valid = false;
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    setFieldError("email", "Enter a valid email address.");
    valid = false;
  }

  if (!password) {
    setFieldError("password", "Password is required.");
    valid = false;
  } else if (password.length < 8) {
    setFieldError("password", "Password must be at least 8 characters.");
    valid = false;
  }

  if (!confirmPassword) {
    setFieldError("confirmPassword", "Confirm your password.");
    valid = false;
  } else if (password !== confirmPassword) {
    setFieldError("confirmPassword", "Passwords do not match.");
    valid = false;
  }

  return valid;
}

function setLoading(isLoading) {
  submitButton.disabled = isLoading;
  submitButton.classList.toggle("loading", isLoading);
  submitButton.querySelector(".button-text").textContent = isLoading ? "Creating..." : "Create account";
}

async function postJson(path, body) {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(body)
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok || payload?.success === false) {
    const error = payload?.error || response.statusText || "Registration failed.";
    throw new Error(typeof error === "string" ? error : JSON.stringify(error));
  }

  return payload?.data ?? payload;
}

function storeToken(data) {
  const token = data?.access_token || data?.token || data?.data?.access_token || data?.data?.token;
  if (token) {
    sessionStorage.setItem(TOKEN_KEY, token);
  }
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!validate()) return;

  setLoading(true);

  try {
    const data = await postJson("/auth/register", {
      email: fields.email.value.trim(),
      password: fields.password.value
    });
    storeToken(data);
    window.location.href = "dashboard.html";
  } catch (error) {
    apiError.textContent = error.message;
    apiError.hidden = false;
  } finally {
    setLoading(false);
  }
});

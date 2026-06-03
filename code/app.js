const pets = {
  max: {
    name: "Max",
    age: "3 years old",
    shortAge: "3 yrs",
    species: "Dog",
    gender: "♂",
    tone: "coral",
    art: "dog-art",
    checkupTime: "10:30 am",
    checkupDate: "23 Sep 2026",
    weight: "24 kg",
    alert: "Low",
    memoryTitle: "The walk that slowed time down",
    memory: "He pressed his nose into every flower and looked back as if he wanted me to remember the whole path.",
    ai: "Max turns ordinary walks into tiny ceremonies. The way he pauses, notices, and returns to your side is his quiet way of saying: this is our world, and I am happy in it."
  },
  buddy: {
    name: "Buddy",
    age: "5 years old",
    shortAge: "5 yrs",
    species: "Golden Retriever",
    gender: "♂",
    tone: "dark",
    art: "retriever-art",
    checkupTime: "2:00 pm",
    checkupDate: "12 Oct 2026",
    weight: "31 kg",
    alert: "Low",
    memoryTitle: "The grin after the rain",
    memory: "Buddy came back from the yard with wet paws and the proudest smile, like the rain had been his private adventure.",
    ai: "Buddy carries joy in a way that fills the room before he even reaches you. His muddy paws are less a mess than a signature: proof that he lived the day fully."
  },
  luna: {
    name: "Luna",
    age: "2 years old",
    shortAge: "2 yrs",
    species: "Cat",
    gender: "♀",
    tone: "teal",
    art: "cat-art",
    checkupTime: "10:30 am",
    checkupDate: "25 Sep 2026",
    weight: "4.8 kg",
    alert: "Watch",
    memoryTitle: "The sun chose her first",
    memory: "Luna curled into the window light and blinked slowly whenever I said her name.",
    ai: "Luna made the room softer just by resting in it. Some pets ask for attention loudly; she gives love in slow blinks, warm windows, and the trust of staying close."
  },
  chloe: {
    name: "Chloe",
    age: "1 year old",
    shortAge: "1 yr",
    species: "Bunny",
    gender: "♀",
    tone: "gray",
    art: "bunny-art",
    checkupTime: "4:15 pm",
    checkupDate: "4 Nov 2026",
    weight: "2.1 kg",
    alert: "Low",
    memoryTitle: "A soft hop into trust",
    memory: "Chloe nudged the blanket closer before curling into the quietest corner of the couch.",
    ai: "Chloe's love is small and careful, but it changes the whole room. Every gentle hop feels like a little decision to trust you again."
  }
};

function savePets() {
  localStorage.setItem("petjournal_pets", JSON.stringify(pets));
}

function loadPets() {
  const saved = localStorage.getItem("petjournal_pets");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      Object.assign(pets, parsed);
    } catch (e) {}
  }
}

const memories = [
  "A quiet dinner, a warm paw, and the feeling that home was exactly where it needed to be.",
  "A checkup day with brave eyes and a happy tail at the end.",
  "A birthday treat shared with everyone who knows how much this little life matters."
];

const db = {
  async getPets() {
    // TODO: replace with Supabase fetch
    const saved = localStorage.getItem("petjournal_pets");
    return saved ? JSON.parse(saved) : null;
  },
  async savePet(id, data) {
    // TODO: replace with Supabase upsert
    pets[id] = data;
    localStorage.setItem("petjournal_pets", JSON.stringify(pets));
  },
  async getMemories() {
    // TODO: replace with Supabase fetch
    const saved = localStorage.getItem("petjournal_memories");
    return saved ? JSON.parse(saved) : null;
  },
  async saveMemory(text) {
    // TODO: replace with Supabase insert
    memories.unshift(text);
    localStorage.setItem("petjournal_memories", JSON.stringify(memories));
  },
  async deleteMemory(index) {
    // TODO: replace with Supabase delete
    memories.splice(index, 1);
    localStorage.setItem("petjournal_memories", JSON.stringify(memories));
  }
};

function saveMemories() {
  localStorage.setItem("petjournal_memories", JSON.stringify(memories));
}

function loadMemories() {
  const saved = localStorage.getItem("petjournal_memories");
  if (saved) {
    try {
      const parsed = JSON.parse(saved);
      memories.length = 0;
      parsed.forEach(m => memories.push(m));
    } catch (e) {}
  }
}

let selectedPet = "max";

function saveSelectedPet() {
  localStorage.setItem("petjournal_selectedPet", selectedPet);
}

function loadSelectedPet() {
  const saved = localStorage.getItem("petjournal_selectedPet");
  if (saved && pets[saved]) selectedPet = saved;
}

const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => [...document.querySelectorAll(selector)];

function showToast(message) {
  const toast = $("#toast");
  toast.textContent = message;
  toast.classList.add("visible");
  setTimeout(() => toast.classList.remove("visible"), 2200);
}

function go(screen) {
  $$(".screen").forEach((s) => s.classList.toggle("active", s.id === `${screen}Screen`));
  $$(".tab").forEach((t) => t.classList.toggle("active", t.dataset.go === screen));
  window.scrollTo(0, 0);
}

function renderPets() {
  $("#petCards").innerHTML = Object.entries(pets).map(([id, pet]) => `
    <button class="pet-card ${pet.tone} ${id === selectedPet ? "active" : ""}" data-pet="${id}">
      <h2>${pet.name}</h2>
      <p>${pet.species}</p>
      <span class="gender">${pet.gender}</span>
      <ul>
        <li class="paw-row">🐾 🐾 🐾</li>
        <li>${pet.shortAge}</li>
      </ul>
      <div class="pet-art ${pet.art}" aria-hidden="true"></div>
    </button>
  `).join("");

  $$(".pet-card").forEach((card) => {
    card.addEventListener("click", () => {
      selectedPet = card.dataset.pet;
      saveSelectedPet();
      renderAll();
      showToast(`${pets[selectedPet].name} is selected`);
    });
  });
}

function renderPetDetails() {
  const pet = pets[selectedPet];
  $("#memoryPetName").textContent = pet.name;
  $("#memoryTitle").textContent = pet.memoryTitle;
  $("#memoryText").textContent = pet.memory;
  $("#memoryAi").textContent = pet.ai;
  document.querySelector("#homeRecentMemory").textContent = `${pet.name}'s latest memory`;
  document.querySelector("#homeRecentCaption").textContent = pet.memory.substring(0, 80) + "…";
  $("#checkupTitle").textContent = `${pet.checkupDate}, ${pet.checkupTime}`;
  $("#checkupCopy").textContent = `${pet.name}'s next care visit is already planned. Bring notes, questions, and anything that felt different this week.`;
  $("#weightValue").textContent = pet.weight;
  $("#alertValue").textContent = pet.alert;
  const alertMetric = document.querySelector("#alertMetric");
  if (alertMetric) alertMetric.setAttribute("data-status", pets[selectedPet].alert.toLowerCase() === "watch" ? "watch" : pets[selectedPet].alert.toLowerCase() === "low" ? "low" : "good");
}

function renderMemoryList() {
  const pet = pets[selectedPet];
  $("#memoryList").innerHTML = memories.map((text, index) => `
    <article class="memory-item" style="position:relative">
      <p class="tiny">${pet.name} memory ${index + 1}</p>
      <h3>${index === 0 ? "Small proof of love" : index === 1 ? "Brave little heart" : "A day worth keeping"}</h3>
      <p>${text}</p>
      <button data-index="${index}" class="delete-memory" style="position:absolute;top:12px;right:12px;background:none;border:none;color:var(--muted);font-size:18px;cursor:pointer">✕</button>
    </article>
  `).join("");
  document.querySelectorAll(".delete-memory").forEach(btn => {
    btn.addEventListener("click", async () => {
      const i = parseInt(btn.dataset.index);
      await db.deleteMemory(i);
      renderMemoryList();
      showToast("Memory removed");
    });
  });
}

function searchApp(query) {
  const q = query.toLowerCase().trim();
  if (!q) { renderMemoryList(); return; }
  const pet = pets[selectedPet];
  const results = memories.filter(m => m.toLowerCase().includes(q));
  const list = document.querySelector("#memoryList");
  if (!results.length) {
    list.innerHTML = `<article class="memory-item"><p class="tiny">No results</p><h3>No memories match "${q}"</h3><p>Try different words.</p></article>`;
    return;
  }
  list.innerHTML = results.map((text, i) => `
    <article class="memory-item">
      <p class="tiny">${pet.name} memory</p>
      <h3>Search match</h3>
      <p>${text}</p>
    </article>`).join("");
}

function renderShareCard() {
  const canvas = $("#shareCanvas");
  const ctx = canvas.getContext("2d");
  const pet = pets[selectedPet];

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
  gradient.addColorStop(0, "#FFFBF7");
  gradient.addColorStop(0.52, "#F5E4E2");
  gradient.addColorStop(1, "#E8B4A8");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "rgba(255, 255, 255, 0.82)";
  roundRect(ctx, 92, 120, 896, 1112, 56);
  ctx.fill();

  ctx.fillStyle = "#2D2620";
  ctx.textAlign = "center";
  ctx.font = "800 80px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText(`${pet.name} ✨`, 540, 270);

  ctx.font = "italic 42px Georgia, serif";
  wrapText(ctx, `"${pet.memory}"`, 540, 430, 760, 64);

  ctx.fillStyle = pet.tone === "coral" ? "#D97760" : "#5A9B8F";
  ctx.font = "500 34px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("A tiny life, a whole heart.", 540, 790);

  ctx.fillStyle = "#A89A91";
  ctx.font = "italic 31px Georgia, serif";
  wrapText(ctx, `✨ ${pet.ai}`, 540, 875, 760, 48);

  ctx.fillStyle = "#7F58B3";
  ctx.font = "500 30px -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif";
  ctx.fillText("PetJournal Care", 540, 1165);

  $("#downloadCard").href = canvas.toDataURL("image/png");
}

function roundRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.arcTo(x + width, y, x + width, y + height, radius);
  ctx.arcTo(x + width, y + height, x, y + height, radius);
  ctx.arcTo(x, y + height, x, y, radius);
  ctx.arcTo(x, y, x + width, y, radius);
  ctx.closePath();
}

function wrapText(ctx, text, x, y, maxWidth, lineHeight) {
  const words = text.split(" ");
  let line = "";
  let currentY = y;

  words.forEach((word) => {
    const test = `${line}${word} `;
    if (ctx.measureText(test).width > maxWidth && line) {
      ctx.fillText(line.trim(), x, currentY);
      currentY += lineHeight;
      line = `${word} `;
    } else {
      line = test;
    }
  });

  ctx.fillText(line.trim(), x, currentY);
}

function renderAll() {
  renderPets();
  renderPetDetails();
  renderMemoryList();
  renderShareCard();
}

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-go]");
  if (target) go(target.dataset.go);
});

document.addEventListener("click", (e) => {
  const target = e.target.closest("[data-tab]");
  if (target) go(target.dataset.tab);
});

document.querySelector("#addPet").addEventListener("click", () => {
  document.querySelector("#addPetModal").style.display = "flex";
});

document.querySelector("#cancelAddPet").addEventListener("click", () => {
  document.querySelector("#addPetModal").style.display = "none";
});

document.querySelector("#addPetForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const name = document.querySelector("#newPetName").value.trim();
  const species = document.querySelector("#newPetSpecies").value.trim();
  const age = document.querySelector("#newPetAge").value.trim();
  const id = name.toLowerCase().replace(/\s+/g, "_") + "_" + Date.now();
  const tones = ["coral", "teal", "dark", "gray"];
  pets[id] = {
    name, species, age,
    shortAge: age,
    gender: "♂",
    tone: tones[Object.keys(pets).length % tones.length],
    art: "dog-art",
    checkupTime: "TBD",
    checkupDate: "Not scheduled",
    weight: "—",
    alert: "Low",
    memoryTitle: "First memory",
    memory: `${name} joined the family today.`,
    ai: `Every great story starts somewhere. ${name}'s starts here.`
  };
  selectedPet = id;
  savePets();
  saveSelectedPet();
  renderAll();
  document.querySelector("#addPetModal").style.display = "none";
  document.querySelector("#addPetForm").reset();
  showToast(`${name} added! 🐾`);
});

document.querySelector("#newStory").addEventListener("click", () =>
  showToast("Fresh prompt: What made you smile today?")
);

document.querySelector("#rerenderCard").addEventListener("click", () => {
  renderShareCard();
  showToast("✨ Love card refreshed with new colors");
});

$("#journalForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const text = $("#journalText").value.trim();
  if (!text) return;
  const status = $("#journalStatus");
  status.className = "form-status loading";
  status.innerHTML = '<span class="spinner"></span>Writing a gentle AI memory...';

  window.setTimeout(async () => {
    await db.saveMemory(text);
    pets[selectedPet].memoryTitle = "A memory worth keeping";
    pets[selectedPet].memory = text;
    pets[selectedPet].ai = `${pets[selectedPet].name} gave this moment its meaning. What might look small from the outside becomes unforgettable when it belongs to the pet who knows your routines, your voice, and the softest place beside you.`;
    renderAll();
    savePets();
    status.className = "form-status success";
    status.innerHTML = "✨ Memory saved with AI story above";
    document.querySelector("#journalText").value = "";
    showToast("Memory saved with a poetic AI narrative");
  }, 1200);
});

document.querySelector("#symptomForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const pet = pets[selectedPet];
  const symptomText = document.querySelector("#symptomText").value.trim();
  if (!symptomText) { showToast("Please describe what you noticed"); return; }

  const result = document.querySelector("#symptomResult");
  result.innerHTML = '<div class="form-status loading"><span class="spinner"></span>Analyzing gently...</div>';

  window.setTimeout(() => {
    result.innerHTML = `
      <article class="symptom-result-card">
        <div class="symptom-result-head">
          <span class="warning-icon">⚠️</span>
          <div>
            <p class="tiny">Gentle health read</p>
            <p class="disclaimer">Not medical advice. Consult a licensed vet if symptoms persist.</p>
          </div>
        </div>
        <div class="symptom-result-grid">
          <section><h3>What it might be</h3><p>For ${pet.name}, this may be normal soreness after activity, mild stiffness, or a small strain.</p></section>
          <section><h3>Urgency level</h3><p><strong style="color:var(--teal)">Low urgency</strong> if appetite, energy, and mood are normal.</p></section>
          <section><h3>When to see a vet</h3><p>Call a vet if limping, swelling, hiding, or stiffness continues beyond a day.</p></section>
          <section><h3>Safe home care</h3><p>Rest, gentle walks only, water nearby, and note any changes.</p></section>
        </div>
        <button class="secondary-button" style="width:100%;margin-top:16px">📞 Find a vet near me</button>
      </article>`;
    showToast("Analysis complete");
  }, 900);
});

const searchInput = document.querySelector("input[type='search']");
if (searchInput) searchInput.addEventListener("input", e => searchApp(e.target.value));

const journalText = document.querySelector("#journalText");
if (journalText) {
  journalText.addEventListener("input", e => {
    document.querySelector("#charCount").textContent = e.target.value.length;
  });
  document.querySelector("#charCount").textContent = journalText.value.length;
}

loadPets();
loadMemories();
loadSelectedPet();
renderAll();

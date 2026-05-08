
// ================= CONFIG & STATE =================
const API_BASE_URL = "http://localhost:3000";

const state = {
  orders: [],
  settings: null,
  filter: "all",
  view: "dashboard",
  loading: false,
};

// ================= HELPERS =================
const $ = (selector) => document.querySelector(selector);
const $$ = (selector) => Array.from(document.querySelectorAll(selector));


function formatDateISO(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

function normalizeItems(raw) {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ================= STATUS HELPERS =================
function statusLabel(status) {
  if (status === "pending") return "En attente";
  if (status === "accepted") return "Acceptée";
  if (status === "rejected") return "Refusée";
  if (status === "completed") return "Complétée";
  return status;
}

function statusPillClass(status) {
  if (status === "pending")
    return "bg-amber-500/20 text-amber-400 border border-amber-500/30";
  if (status === "accepted")
    return "bg-blue-500/20 text-blue-400 border border-blue-500/30";
  if (status === "completed")
    return "bg-green-500/20 text-green-400 border border-green-500/30";
  if (status === "rejected")
    return "bg-red-500/20 text-red-400 border border-red-500/30";
  return "bg-dark-700 text-gray-300 border border-dark-600";
}

// ================= API =================
async function apiRequest(path, options = {}) {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    throw new Error(`API ${res.status} ${res.statusText}${body ? ` - ${body}` : ""}`);
  }

  if (res.status === 204) return null;
  return await res.json();
}

async function fetchInitialData() {
  state.loading = true;
  try {
    const [orders, settings] = await Promise.all([
      apiRequest("/orders?_sort=createdAt&_order=desc"),
      apiRequest("/settings"),
    ]);

    state.orders = Array.isArray(orders) ? orders : [];
    state.settings = settings || null;
  } finally {
    state.loading = false;
  }
}





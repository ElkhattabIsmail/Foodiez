
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




// ================= RENDERING =================
function renderFooter() {
  if (!state.settings) return;
  const nameEl = $("#footerRestaurantName");
  const emailEl = $("#footerContactEmail");
  if (nameEl) nameEl.textContent = state.settings.restaurantName || "Foodiez";
  if (emailEl) emailEl.textContent = state.settings.contactEmail || "contact@foodiez.com";
}

function renderDashboard() {
  const stats = computeStats(state.orders);

  const setText = (id, value) => {
    const el = $(id);
    if (el) el.textContent = String(value);
  };

  setText("#stat-total", stats.total);
  setText("#stat-pending", stats.pending);
  setText("#stat-accepted", stats.accepted);
  setText("#stat-completed", stats.completed);
  setText("#stat-rejected", stats.rejected);

  const tbody = $("#recentOrdersBody");
  if (!tbody) return;

  const recent = state.orders.slice(0, 5);
  if (recent.length === 0) {
    tbody.innerHTML = `
      <tr>
        <td class="px-4 py-4 text-gray-400 text-sm" colspan="5">Aucune commande récente.</td>
      </tr>
    `;
    return;
  }

  tbody.innerHTML = recent
    .map((o) => {
      const itemsText = Array.isArray(o.items) ? o.items.join(", ") : "";
      return `
        <tr class="hover:bg-dark-700/30">
          <td class="px-4 py-3 font-medium">${escapeHtml(o.customerName || "")}</td>
          <td class="px-4 py-3 text-gray-300">${escapeHtml(itemsText)}</td>
          <td class="px-4 py-3 font-bold text-primary">${Number(o.totalPrice || 0)} DH</td>
          <td class="px-4 py-3">
            <span class="px-2.5 py-1 rounded-full text-xs ${statusPillClass(o.status)}">${statusLabel(
        o.status
      )}</span>
          </td>
          <td class="px-4 py-3 text-gray-400">${escapeHtml(o.createdAt || "")}</td>
        </tr>
      `;
    })
    .join("");
}

function renderOrders() {
  const grid = $("#ordersGrid");
  const empty = $("#ordersEmpty");
  if (!grid) return;

  const filtered =
    state.filter === "all" ? state.orders : state.orders.filter((o) => o.status === state.filter);

  if (empty) empty.classList.toggle("hidden", filtered.length !== 0);

  grid.innerHTML = filtered
    .map((o) => {
      const items = Array.isArray(o.items) ? o.items : [];
      return `
      <div class="bg-dark-800 border border-dark-700 rounded-xl p-4" data-order-id="${o.id}">
        <div class="flex justify-between items-start mb-3">
          <div>
            <p class="font-semibold">${escapeHtml(o.customerName || "")}</p>
            <p class="text-xs text-gray-400">#${o.id} • ${escapeHtml(o.createdAt || "")}</p>
          </div>
          <span class="px-2.5 py-1 rounded-full text-xs ${statusPillClass(o.status)}">${statusLabel(o.status)}</span>
        </div>
        <div class="flex flex-wrap gap-1.5 mb-3">
          ${items
            .map((it) => `<span class="px-2 py-0.5 bg-dark-700 rounded text-xs">${escapeHtml(it)}</span>`)
            .join("")}
        </div>
        <div class="flex items-center justify-between gap-2 pt-3 border-t border-dark-700">
          <span class="text-lg font-bold text-primary">${Number(o.totalPrice || 0)} DH</span>
          <div class="flex items-center gap-2">
            <select data-action="status" class="bg-dark-700 border border-dark-600 rounded-lg px-2 py-1 text-xs">
              <option value="pending" ${o.status === "pending" ? "selected" : ""}>En attente</option>
              <option value="accepted" ${o.status === "accepted" ? "selected" : ""}>Acceptée</option>
              <option value="completed" ${o.status === "completed" ? "selected" : ""}>Complétée</option>
              <option value="rejected" ${o.status === "rejected" ? "selected" : ""}>Refusée</option>
            </select>
            <button data-action="delete" class="px-2 py-1 bg-red-600 rounded text-xs">Supprimer</button>
          </div>
        </div>
      </div>
    `;
    })
    .join("");
}

function renderFilterButtons() {
  const buttons = $$("button[data-filter]");
  for (const btn of buttons) {
    const isActive = btn.dataset.filter === state.filter;
    if (isActive) {
      btn.className = "px-3 py-1.5 rounded-lg text-xs font-medium bg-dark-700 text-white";
    } else {
      btn.className =
        "px-3 py-1.5 rounded-lg text-xs font-medium text-gray-300 hover:text-white border border-dark-700";
    }
  }
}

function renderNavActive() {
  const links = $$("a[data-link]");
  for (const a of links) {
    const hash = (a.getAttribute("href") || "").replace("#", "");
    const isActive = hash === state.view;
    if (isActive) {
      a.className = "px-4 py-2 rounded-lg text-sm font-medium bg-dark-700 text-white";
    } else {
      a.className = "px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white";
    }
  }
}
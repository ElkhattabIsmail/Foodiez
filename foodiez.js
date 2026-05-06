/* ═══════════════════════════════════════════════════════════════════
   foodiez.js — Application complète (SPA Foodiez)
   Contient : API · Utilitaires · Rendu DOM · Contrôleur principal
═══════════════════════════════════════════════════════════════════ */


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  1. COUCHE API — Fetch vers JSON Server                       ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const API_URL = 'http://localhost:3000';

/** Helper Fetch générique */
async function apiFetch(endpoint, options = {}) {
  const response = await fetch(`${API_URL}${endpoint}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`Erreur API : ${response.status} ${response.statusText}`);
  }

  if (options.method === 'DELETE') return true;
  return response.json();
}

/* ── ORDERS ── */
const getAllOrders  = ()          => apiFetch('/orders');
const createOrder  = (data)      => apiFetch('/orders',       { method: 'POST',  body: JSON.stringify(data)   });
const updateOrder  = (id, fields) => apiFetch(`/orders/${id}`, { method: 'PATCH', body: JSON.stringify(fields) });
const deleteOrder  = (id)        => apiFetch(`/orders/${id}`, { method: 'DELETE' });

/* ── SETTINGS ── */
const getSettings  = ()          => apiFetch('/settings');


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  2. CONSTANTES & UTILITAIRES                                  ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const STATUS_LABELS = {
  pending:   'En attente',
  accepted:  'Acceptée',
  completed: 'Complétée',
  rejected:  'Refusée',
};

const STATUS_CLASSES = {
  pending:   'bg-amber-500/20 text-amber-400 border border-amber-500/30',
  accepted:  'bg-blue-500/20  text-blue-400  border border-blue-500/30',
  completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
  rejected:  'bg-red-500/20   text-red-400   border border-red-500/30',
};

/** pending → [accepted, rejected] / accepted → [completed, rejected] */
const STATUS_TRANSITIONS = {
  pending:   ['accepted', 'rejected'],
  accepted:  ['completed', 'rejected'],
  completed: [],
  rejected:  [],
};

/** Échappe les caractères HTML pour éviter les injections XSS */
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/** Formate une date ISO en français (ex : 16 mars 2025) */
function formatDate(dateStr) {
  if (!dateStr) return '—';
  try {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: '2-digit', month: 'short', year: 'numeric',
    });
  } catch {
    return dateStr;
  }
}

/** Génère un badge HTML coloré selon le statut */
function statusBadge(status) {
  const classes = STATUS_CLASSES[status] || 'bg-gray-500/20 text-gray-400';
  const label   = STATUS_LABELS[status]  || status;
  return `<span class="px-2.5 py-1 rounded-full text-xs ${classes}">${escHtml(label)}</span>`;
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  3. ÉTATS : LOADER / ERREUR / VIDE                            ║
   ╚═══════════════════════════════════════════════════════════════╝ */

function loaderHTML() {
  return `
    <div class="flex items-center justify-center gap-3 py-12 text-gray-400 text-sm">
      <svg class="animate-spin w-5 h-5 text-primary" fill="none" viewBox="0 0 24 24">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"/>
      </svg>
      Chargement…
    </div>`;
}

function errorHTML(msg) {
  return `
    <div class="text-center py-12">
      <p class="text-3xl mb-3">⚠️</p>
      <p class="text-red-400 font-medium">${escHtml(msg)}</p>
      <p class="text-gray-500 text-xs mt-2">
        Assurez-vous que JSON Server tourne sur
        <code class="bg-dark-700 px-1 rounded">http://localhost:3000</code>
      </p>
    </div>`;
}

function emptyHTML(msg = 'Aucune commande trouvée.') {
  return `
    <div class="text-center py-12 text-gray-400">
      <p class="text-4xl mb-3 opacity-40">📭</p>
      <p>${escHtml(msg)}</p>
      <button onclick="navigate('new-order')"
              class="mt-4 px-4 py-2 bg-primary text-white text-sm rounded-lg hover:bg-orange-600 transition">
        + Créer une commande
      </button>
    </div>`;
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  4. TOAST NOTIFICATIONS                                       ║
   ╚═══════════════════════════════════════════════════════════════╝ */

function showToast(message, type = 'success') {
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'fixed bottom-5 right-5 z-50 flex flex-col gap-2';
    document.body.appendChild(container);
  }

  const icons   = { success: '✅', error: '❌', info: 'ℹ️' };
  const borders = { success: 'border-green-500/40', error: 'border-red-500/40', info: 'border-blue-500/40' };

  const toast = document.createElement('div');
  toast.className = `flex items-center gap-3 px-4 py-3 rounded-xl text-sm
    bg-dark-700 border ${borders[type] || borders.info}
    text-gray-100 shadow-xl min-w-[220px] transition-all duration-300`;
  toast.innerHTML = `<span>${icons[type] || '💬'}</span><span>${escHtml(message)}</span>`;

  container.appendChild(toast);

  setTimeout(() => {
    toast.style.opacity   = '0';
    toast.style.transform = 'translateX(20px)';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  5. NAVIGATION SPA                                            ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const SECTIONS = ['dashboard', 'orders', 'new-order'];

function navigate(sectionName) {
  if (!SECTIONS.includes(sectionName)) return;

  // Affiche la section active, cache les autres
  SECTIONS.forEach(name => {
    const el = document.getElementById(`section-${name}`);
    if (el) el.classList.toggle('hidden', name !== sectionName);
  });

  // Met à jour l'état actif des liens navbar
  document.querySelectorAll('[data-nav]').forEach(link => {
    const active = link.dataset.nav === sectionName;
    link.classList.toggle('bg-dark-700',   active);
    link.classList.toggle('text-white',    active);
    link.classList.toggle('text-gray-400', !active);
  });

  // Charge les données de la section
  if (sectionName === 'dashboard') loadDashboard();
  if (sectionName === 'orders')    loadOrders();
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  6. RENDU DOM                                                 ║
   ╚═══════════════════════════════════════════════════════════════╝ */

/* ── Stats Cards (Dashboard) ── */
function renderStats(orders) {
  const grid = document.getElementById('stats-grid');
  if (!grid) return;

  const count = (status) => orders.filter(o => o.status === status).length;

  const cards = [
    { value: orders.length,      label: 'Total commandes', wrapClass: 'bg-dark-700 border-dark-600',         textClass: 'text-white'    },
    { value: count('pending'),   label: 'En attente',      wrapClass: 'bg-amber-500/10 border-amber-500/30', textClass: 'text-amber-400' },
    { value: count('accepted'),  label: 'Acceptées',       wrapClass: 'bg-blue-500/10  border-blue-500/30',  textClass: 'text-blue-400'  },
    { value: count('completed'), label: 'Complétées',      wrapClass: 'bg-green-500/10 border-green-500/30', textClass: 'text-green-400' },
    { value: count('rejected'),  label: 'Refusées',        wrapClass: 'bg-red-500/10   border-red-500/30',   textClass: 'text-red-400'   },
  ];

  grid.innerHTML = cards.map(c => `
    <div class="border ${c.wrapClass} rounded-xl p-4">
      <p class="text-2xl font-bold ${c.textClass}">${c.value}</p>
      <p class="text-xs text-gray-400 mt-1">${c.label}</p>
    </div>`).join('');
}

/* ── Tableau Commandes Récentes (Dashboard) ── */
function renderRecentOrders(orders, limit = 5) {
  const tbody = document.getElementById('recent-tbody');
  if (!tbody) return;

  const recent = [...orders]
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, limit);

  if (recent.length === 0) {
    tbody.innerHTML = `<tr><td colspan="5" class="px-4 py-8 text-center text-gray-500">Aucune commande récente</td></tr>`;
    return;
  }

  tbody.innerHTML = recent.map(o => `
    <tr class="hover:bg-dark-700/30 transition-colors">
      <td class="px-4 py-3 font-medium">${escHtml(o.customerName)}</td>
      <td class="px-4 py-3 text-gray-300 text-sm">
        ${(o.items || []).slice(0, 3).map(escHtml).join(', ')}${(o.items || []).length > 3 ? ' …' : ''}
      </td>
      <td class="px-4 py-3 font-bold text-primary">${o.totalPrice} DH</td>
      <td class="px-4 py-3">${statusBadge(o.status)}</td>
      <td class="px-4 py-3 text-gray-400 text-sm">${formatDate(o.createdAt)}</td>
    </tr>`).join('');
}

/* ── Boutons d'action sur une card ── */
function actionButtonsHTML(order) {
  const nexts = STATUS_TRANSITIONS[order.status] || [];

  if (nexts.length === 0) {
    return `<span class="text-xs text-gray-500 italic">Aucune action</span>`;
  }

  const cfg = {
    accepted:  { bg: 'bg-blue-600  hover:bg-blue-700',  label: 'Accepter'  },
    completed: { bg: 'bg-green-600 hover:bg-green-700', label: 'Compléter' },
    rejected:  { bg: 'bg-red-600   hover:bg-red-700',   label: 'Refuser'   },
  };

  return nexts.map(s => `
    <button onclick="handleStatusChange(${order.id}, '${s}')"
            class="px-3 py-1.5 ${cfg[s].bg} text-white rounded-lg text-xs font-medium transition-colors">
      ${cfg[s].label}
    </button>`).join('');
}

/* ── HTML d'une Order Card ── */
function orderCardHTML(order) {
  const tags = (order.items || [])
    .map(i => `<span class="px-2 py-0.5 bg-dark-700 rounded text-xs">${escHtml(i)}</span>`)
    .join('');

  return `
    <div id="order-card-${order.id}"
         class="bg-dark-800 border border-dark-700 rounded-xl p-4 transition-all duration-300">

      <div class="flex justify-between items-start mb-3">
        <div>
          <p class="font-semibold">${escHtml(order.customerName)}</p>
          <p class="text-xs text-gray-400">#${order.id} · ${formatDate(order.createdAt)}</p>
        </div>
        ${statusBadge(order.status)}
      </div>

      <div class="flex flex-wrap gap-1.5 mb-3 min-h-[24px]">
        ${tags || '<span class="text-xs text-gray-500 italic">Aucun article</span>'}
      </div>

      <div class="flex justify-between items-center pt-3 border-t border-dark-700">
        <span class="text-lg font-bold text-primary">${order.totalPrice} DH</span>
        <div class="flex gap-1.5 items-center flex-wrap justify-end">
          ${actionButtonsHTML(order)}
          <button onclick="handleDelete(${order.id})"
                  class="px-3 py-1.5 bg-dark-700 hover:bg-red-600/20 text-gray-400
                         hover:text-red-400 border border-dark-600 hover:border-red-500/40
                         rounded-lg text-xs font-medium transition-colors ml-1">
            🗑
          </button>
        </div>
      </div>
    </div>`;
}

/* ── Grille de cards filtrée ── */
function renderOrderCards(orders, filter = 'all') {
  const grid = document.getElementById('orders-grid');
  if (!grid) return;

  const filtered = filter === 'all' ? orders : orders.filter(o => o.status === filter);
  const sorted   = [...filtered].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

  if (sorted.length === 0) {
    grid.innerHTML = emptyHTML(
      filter === 'all'
        ? 'Aucune commande trouvée.'
        : `Aucune commande avec le statut « ${STATUS_LABELS[filter] || filter} ».`
    );
    return;
  }

  grid.innerHTML = `<div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
    ${sorted.map(orderCardHTML).join('')}
  </div>`;
}

/* ── Footer ── */
function renderFooter(settings) {
  const nameEl  = document.getElementById('footer-name');
  const emailEl = document.getElementById('footer-email');
  if (nameEl  && settings.restaurantName) nameEl.textContent  = settings.restaurantName;
  if (emailEl && settings.contactEmail)   emailEl.textContent = settings.contactEmail;
}

/* ── Tags du formulaire ── */
function renderItemTags() {
  const container = document.getElementById('f-items-tags');
  if (!container) return;

  if (AppState.formItems.length === 0) {
    container.innerHTML = '<span class="text-xs text-gray-500 italic">Aucun article ajouté</span>';
    return;
  }

  container.innerHTML = AppState.formItems.map((item, i) => `
    <span class="inline-flex items-center gap-1.5 px-2.5 py-1
                 bg-dark-700 border border-dark-600 rounded-lg text-xs">
      ${escHtml(item)}
      <button onclick="removeItemFromForm(${i})"
              class="text-gray-500 hover:text-red-400 transition-colors font-bold text-sm leading-none">×</button>
    </span>`).join('');
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  7. ÉTAT GLOBAL                                               ║
   ╚═══════════════════════════════════════════════════════════════╝ */

const AppState = {
  orders:        [],    // Cache local des commandes
  currentFilter: 'all',
  formItems:     [],    // Articles en cours de saisie
};


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  8. CONTRÔLEUR — HANDLERS & LOGIQUE MÉTIER                   ║
   ╚═══════════════════════════════════════════════════════════════╝ */

/* ── Dashboard ── */
async function loadDashboard() {
  const grid  = document.getElementById('stats-grid');
  const tbody = document.getElementById('recent-tbody');

  if (grid)  grid.innerHTML  = loaderHTML();
  if (tbody) tbody.innerHTML = `<tr><td colspan="5" class="py-6">${loaderHTML()}</td></tr>`;

  try {
    AppState.orders = await getAllOrders();
    renderStats(AppState.orders);
    renderRecentOrders(AppState.orders, 5);
  } catch (err) {
    if (grid)  grid.innerHTML  = errorHTML('Impossible de charger les statistiques.');
    if (tbody) tbody.innerHTML = '';
    console.error('[Dashboard]', err);
  }
}

/* ── Liste des commandes ── */
async function loadOrders() {
  const grid = document.getElementById('orders-grid');
  if (grid) grid.innerHTML = loaderHTML();

  try {
    AppState.orders = await getAllOrders();
    renderOrderCards(AppState.orders, AppState.currentFilter);
  } catch (err) {
    if (grid) grid.innerHTML = errorHTML('Impossible de charger les commandes.');
    console.error('[Orders]', err);
  }
}

/* ── Filtre ── */
function setFilter(filter, el) {
  AppState.currentFilter = filter;

  document.querySelectorAll('[data-filter]').forEach(btn => {
    const active = btn.dataset.filter === filter;
    btn.classList.toggle('bg-dark-700',    active);
    btn.classList.toggle('text-white',     active);
    btn.classList.toggle('text-gray-400',  !active);
    btn.classList.toggle('border-primary', active);
  });

  renderOrderCards(AppState.orders, filter);
}

/* ── Changement de statut ── */
async function handleStatusChange(orderId, newStatus) {
  try {
    await updateOrder(orderId, { status: newStatus });

    const idx = AppState.orders.findIndex(o => o.id === orderId);
    if (idx !== -1) AppState.orders[idx].status = newStatus;

    showToast(`Statut mis à jour : ${STATUS_LABELS[newStatus]}`);

    renderOrderCards(AppState.orders, AppState.currentFilter);
    renderStats(AppState.orders);
    renderRecentOrders(AppState.orders, 5);
  } catch (err) {
    showToast('Erreur lors de la mise à jour du statut.', 'error');
    console.error('[StatusChange]', err);
  }
}

/* ── Suppression ── */
async function handleDelete(orderId) {
  if (!confirm('Supprimer cette commande définitivement ?')) return;

  const card = document.getElementById(`order-card-${orderId}`);
  if (card) { card.style.opacity = '0'; card.style.transform = 'scale(0.95)'; }

  try {
    await deleteOrder(orderId);
    AppState.orders = AppState.orders.filter(o => o.id !== orderId);
    showToast('Commande supprimée.');

    setTimeout(() => {
      renderOrderCards(AppState.orders, AppState.currentFilter);
      renderStats(AppState.orders);
      renderRecentOrders(AppState.orders, 5);
    }, 300);
  } catch (err) {
    if (card) { card.style.opacity = '1'; card.style.transform = 'none'; }
    showToast('Erreur lors de la suppression.', 'error');
    console.error('[Delete]', err);
  }
}

/* ── Formulaire : ajouter un article ── */
function addItemToForm() {
  const input = document.getElementById('f-item-input');
  const val   = input.value.trim();
  if (!val) return;
  AppState.formItems.push(val);
  input.value = '';
  input.focus();
  renderItemTags();
}

/* ── Formulaire : supprimer un article ── */
function removeItemFromForm(index) {
  AppState.formItems.splice(index, 1);
  renderItemTags();
}

/* ── Formulaire : soumettre ── */
async function handleFormSubmit() {
  const name  = document.getElementById('f-name').value.trim();
  const price = parseFloat(document.getElementById('f-price').value);

  if (!name) {
    showToast('Le nom du client est obligatoire.', 'error');
    document.getElementById('f-name').focus();
    return;
  }
  if (AppState.formItems.length === 0) {
    showToast('Ajoutez au moins un article.', 'error');
    return;
  }
  if (isNaN(price) || price < 0) {
    showToast('Le prix doit être un nombre positif.', 'error');
    document.getElementById('f-price').focus();
    return;
  }

  const newOrder = {
    customerName: name,
    items:        [...AppState.formItems],
    totalPrice:   price,
    status:       'pending',
    createdAt:    new Date().toISOString().split('T')[0],
  };

  const submitBtn = document.getElementById('btn-submit');
  if (submitBtn) { submitBtn.disabled = true; submitBtn.textContent = 'Enregistrement…'; }

  try {
    const created = await createOrder(newOrder);
    AppState.orders.unshift(created);
    showToast('Commande créée avec succès ! 🎉');
    resetForm();
    navigate('orders');
  } catch (err) {
    showToast('Erreur lors de la création de la commande.', 'error');
    console.error('[FormSubmit]', err);
  } finally {
    if (submitBtn) { submitBtn.disabled = false; submitBtn.textContent = '✓ Enregistrer'; }
  }
}

/* ── Formulaire : reset ── */
function resetForm() {
  document.getElementById('f-name').value        = '';
  document.getElementById('f-price').value       = '';
  document.getElementById('f-item-input').value  = '';
  AppState.formItems = [];
  renderItemTags();
}

/* ── Settings / Footer ── */
async function loadSettings() {
  try {
    const settings = await getSettings();
    renderFooter(settings);
    if (settings.restaurantName) {
      document.title = `${settings.restaurantName} - Gestion de Commandes`;
    }
  } catch (err) {
    console.warn('[Settings]', err);
  }
}


/* ╔═══════════════════════════════════════════════════════════════╗
   ║  9. INITIALISATION — DOMContentLoaded                        ║
   ╚═══════════════════════════════════════════════════════════════╝ */

document.addEventListener('DOMContentLoaded', () => {

  // Settings (footer)
  loadSettings();

  // Navigation
  document.querySelectorAll('[data-nav]').forEach(link => {
    link.addEventListener('click', (e) => { e.preventDefault(); navigate(link.dataset.nav); });
  });

  // Filtres
  document.querySelectorAll('[data-filter]').forEach(btn => {
    btn.addEventListener('click', () => setFilter(btn.dataset.filter, btn));
  });

  // Formulaire — ajout article
  document.getElementById('btn-add-item')?.addEventListener('click', addItemToForm);

  // Formulaire — Entrée dans le champ article
  document.getElementById('f-item-input')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addItemToForm(); }
  });

  // Formulaire — soumettre
  document.getElementById('btn-submit')?.addEventListener('click', handleFormSubmit);

  // Formulaire — reset
  document.getElementById('btn-reset')?.addEventListener('click', resetForm);

  // Vue initiale
  navigate('dashboard');
});
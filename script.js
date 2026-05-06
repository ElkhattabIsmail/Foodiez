// script.js - Foodiez - Vanilla JS Simple

// ===== DONNÉES =====
let orders = [
    { id: 1, client: "Ahmed", items: "Pizza, Soda", total: 120, status: "pending", date: "2025-03-16" },
    { id: 2, client: "Sarah", items: "Burger, Frites", total: 85, status: "accepted", date: "2025-03-16" },
    { id: 3, client: "Mohamed", items: "Tacos", total: 95, status: "completed", date: "2025-03-15" },
    { id: 4, client: "Fatima", items: "Salade", total: 45, status: "rejected", date: "2025-03-15" },
    { id: 5, client: "Karim", items: "Pizza, Burger", total: 150, status: "pending", date: "2025-03-16" }
];

let currentView = 'dashboard';
let currentFilter = 'all';

// ===== CONFIG BADGES =====
const statusConfig = {
    pending: { class: 'bg-amber-500/20 text-amber-400 border-amber-500/30', label: 'En attente' },
    accepted: { class: 'bg-blue-500/20 text-blue-400 border-blue-500/30', label: 'Acceptée' },
    completed: { class: 'bg-green-500/20 text-green-400 border-green-500/30', label: 'Complétée' },
    rejected: { class: 'bg-red-500/20 text-red-400 border-red-500/30', label: 'Refusée' }
};

// ===== STATS =====
function getStats() {
    return {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        completed: orders.filter(o => o.status === 'completed').length,
        rejected: orders.filter(o => o.status === 'rejected').length
    };
}

// ===== BADGE HTML =====
function getBadge(status) {
    const cfg = statusConfig[status];
    return `<span class="px-2.5 py-1 rounded-full text-xs ${cfg.class} border">${cfg.label}</span>`;
}

// ===== RENDU DASHBOARD =====
function renderDashboard() {
    const stats = getStats();
    const recent = orders.slice(0, 5);

    return `
        <h1 class="text-2xl font-syne font-bold mb-5">Dashboard</h1>
        
        <!-- Stats Cards -->
        <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
            <div class="bg-dark-700 border border-dark-600 rounded-xl p-4">
                <p class="text-2xl font-bold text-white">${stats.total}</p>
                <p class="text-xs text-gray-400">Total commandes</p>
            </div>
            <div class="bg-amber-500/10 border border-amber-500/30 rounded-xl p-4">
                <p class="text-2xl font-bold text-amber-400">${stats.pending}</p>
                <p class="text-xs text-gray-400">En attente</p>
            </div>
            <div class="bg-blue-500/10 border border-blue-500/30 rounded-xl p-4">
                <p class="text-2xl font-bold text-blue-400">${stats.accepted}</p>
                <p class="text-xs text-gray-400">Acceptées</p>
            </div>
            <div class="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
                <p class="text-2xl font-bold text-green-400">${stats.completed}</p>
                <p class="text-xs text-gray-400">Complétées</p>
            </div>
            <div class="bg-red-500/10 border border-red-500/30 rounded-xl p-4">
                <p class="text-2xl font-bold text-red-400">${stats.rejected}</p>
                <p class="text-xs text-gray-400">Refusées</p>
            </div>
        </div>

        <!-- Recent Orders Table -->
        <div class="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
            <div class="px-4 py-3 border-b border-dark-700 flex justify-between">
                <h2 class="font-semibold">Commandes récentes</h2>
                <button onclick="navigate('orders')" class="text-primary text-sm hover:underline">Voir tout</button>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-sm">
                    <thead class="bg-dark-700/50 text-gray-400">
                        <tr>
                            <th class="px-4 py-2 text-left">Client</th>
                            <th class="px-4 py-2 text-left">Articles</th>
                            <th class="px-4 py-2 text-left">Total</th>
                            <th class="px-4 py-2 text-left">Statut</th>
                            <th class="px-4 py-2 text-left">Date</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-dark-700">
                        ${recent.map(o => `
                            <tr class="hover:bg-dark-700/30">
                                <td class="px-4 py-3 font-medium">${o.client}</td>
                                <td class="px-4 py-3 text-gray-300">${o.items}</td>
                                <td class="px-4 py-3 font-bold text-primary">${o.total} DH</td>
                                <td class="px-4 py-3">${getBadge(o.status)}</td>
                                <td class="px-4 py-3 text-gray-400">${o.date}</td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
    `;
}

// ===== RENDU LISTE COMMANDES =====
function renderOrders() {
    const filtered = currentFilter === 'all' ? orders : orders.filter(o => o.status === currentFilter);
    
    return `
        <h1 class="text-2xl font-syne font-bold mb-4">Commandes</h1>
        
        <!-- Filtres -->
        <div class="flex flex-wrap gap-2 mb-4">
            ${['all','pending','accepted','completed','rejected'].map(f => `
                <button onclick="setFilter('${f}')" 
                    class="px-3 py-1.5 rounded-lg text-sm font-medium transition ${currentFilter === f ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400 hover:bg-dark-700'}">
                    ${f === 'all' ? 'Toutes' : statusConfig[f].label}
                </button>
            `).join('')}
        </div>

        <!-- Cards -->
        <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            ${filtered.map(o => `
                <div id="order-${o.id}" class="bg-dark-800 border border-dark-700 rounded-xl p-4">
                    <div class="flex justify-between items-start mb-3">
                        <div>
                            <p class="font-semibold">${o.client}</p>
                            <p class="text-xs text-gray-400">#${o.id} • ${o.date}</p>
                        </div>
                        ${getBadge(o.status)}
                    </div>
                    <div class="flex flex-wrap gap-1.5 mb-3">
                        ${o.items.split(', ').map(it => `<span class="px-2 py-0.5 bg-dark-700 rounded text-xs">${it}</span>`).join('')}
                    </div>
                    <div class="flex justify-between items-center pt-3 border-t border-dark-700">
                        <span class="text-lg font-bold text-primary">${o.total} DH</span>
                        <div class="flex gap-1">
                            ${o.status === 'pending' ? `
                                <button onclick="updateStatus(${o.id}, 'accepted')" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs">✓</button>
                                <button onclick="updateStatus(${o.id}, 'rejected')" class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs">✕</button>
                            ` : o.status === 'accepted' ? `
                                <button onclick="updateStatus(${o.id}, 'completed')" class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs">Terminer</button>
                            ` : ''}
                            <button onclick="deleteOrder(${o.id})" class="px-2 py-1 bg-dark-700 hover:bg-red-900/40 text-gray-400 hover:text-red-400 rounded text-xs border border-dark-600">✕</button>
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
        ${filtered.length === 0 ? '<p class="text-gray-500 text-center py-8">Aucune commande</p>' : ''}
    `;
}

// ===== NAVIGATION =====
function navigate(view) {
    currentView = view;
    
    // Update navbar active state
    document.querySelectorAll('nav a').forEach((link, i) => {
        if (i === 0 && view === 'dashboard') {
            link.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-dark-700 text-white';
        } else if (i === 1 && view === 'orders') {
            link.className = 'px-4 py-2 rounded-lg text-sm font-medium bg-dark-700 text-white';
        } else {
            link.className = 'px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white';
        }
    });
    
    render();
}

function setFilter(filter) {
    currentFilter = filter;
    render();
}

// ===== ACTIONS =====
function updateStatus(id, newStatus) {
    const order = orders.find(o => o.id === id);
    if (order) {
        order.status = newStatus;
        render();
    }
}

function deleteOrder(id) {
    if (!confirm('Supprimer cette commande ?')) return;
    
    const el = document.getElementById(`order-${id}`);
    if (el) {
        el.style.transition = 'opacity 0.2s, transform 0.2s';
        el.style.opacity = '0';
        el.style.transform = 'scale(0.95)';
        setTimeout(() => {
            orders = orders.filter(o => o.id !== id);
            render();
        }, 200);
    } else {
        orders = orders.filter(o => o.id !== id);
        render();
    }
}

// ===== RENDU PRINCIPAL =====
function render() {
    const app = document.querySelector('main');
    if (!app) return;
    
    // Keep navbar and footer, replace only main content
    const content = currentView === 'dashboard' ? renderDashboard() : renderOrders();
    
    // Find the inner content area (skip navbar/footer)
    const mainContent = app;
    mainContent.innerHTML = content;
}

// ===== INITIALISATION =====
document.addEventListener('DOMContentLoaded', () => {
    // Setup navbar click handlers
    const navLinks = document.querySelectorAll('nav a');
    navLinks[0].onclick = (e) => { e.preventDefault(); navigate('dashboard'); };
    navLinks[1].onclick = (e) => { e.preventDefault(); navigate('orders'); };
    navLinks[2].onclick = (e) => { e.preventDefault(); alert('Fonctionnalité à venir'); };
    
    render();
});
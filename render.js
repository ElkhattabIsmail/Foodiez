// render.js

function render() {
    const app = document.getElementById('app');
    if (!app) return;

    if (state.view === 'dashboard') {
        app.innerHTML = renderDashboard();
    } else {
        app.innerHTML = renderOrdersList();
    }
    
    attachEvents();
}

function renderDashboard() {
    const stats = calculateStats();
    
    return `
        <div class="animate-fade-in">
            <h1 class="text-2xl font-syne font-bold text-white mb-5">Dashboard</h1>
            
            <div class="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
                <div class="bg-dark-700 border border-dark-600 rounded-xl p-4">
                    <p class="text-2xl font-bold text-white">${stats.total}</p>
                    <p class="text-xs text-gray-400">Total</p>
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

            <div class="bg-dark-800 border border-dark-700 rounded-xl overflow-hidden">
                <div class="px-4 py-3 border-b border-dark-700 flex justify-between">
                    <h2 class="font-semibold">Récentes</h2>
                    <button onclick="changeView('orders')" class="text-primary text-sm hover:underline">Voir tout</button>
                </div>
                <div class="overflow-x-auto">
                    <table class="w-full text-sm">
                        <thead class="bg-dark-700/50 text-gray-400">
                            <tr>
                                <th class="px-4 py-2 text-left">Client</th>
                                <th class="px-4 py-2 text-left">Articles</th>
                                <th class="px-4 py-2 text-left">Total</th>
                                <th class="px-4 py-2 text-left">Statut</th>
                            </tr>
                        </thead>
                        <tbody class="divide-y divide-dark-700">
                            ${state.orders.slice(0, 5).map(order => `
                                <tr class="hover:bg-dark-700/30">
                                    <td class="px-4 py-3 font-medium">${order.client}</td>
                                    <td class="px-4 py-3 text-gray-300">${order.items}</td>
                                    <td class="px-4 py-3 font-bold text-primary">${order.total} DH</td>
                                    <td class="px-4 py-3">${getBadge(order.status)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    `;
}

function renderOrdersList() {
    let filtered = state.orders;
    if (state.filter !== 'all') {
        filtered = state.orders.filter(o => o.status === state.filter);
    }

    return `
        <div class="animate-fade-in">
            <div class="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
                <h1 class="text-2xl font-syne font-bold text-white">Commandes</h1>
                
                <div class="flex gap-2 overflow-x-auto pb-2 md:pb-0">
                    <button onclick="setFilter('all')" class="filter-btn px-3 py-1.5 rounded-lg text-sm font-medium transition ${state.filter === 'all' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'}">Toutes</button>
                    <button onclick="setFilter('pending')" class="filter-btn px-3 py-1.5 rounded-lg text-sm font-medium transition ${state.filter === 'pending' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'}">En attente</button>
                    <button onclick="setFilter('accepted')" class="filter-btn px-3 py-1.5 rounded-lg text-sm font-medium transition ${state.filter === 'accepted' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'}">Acceptées</button>
                    <button onclick="setFilter('completed')" class="filter-btn px-3 py-1.5 rounded-lg text-sm font-medium transition ${state.filter === 'completed' ? 'bg-primary text-white' : 'bg-dark-800 text-gray-400'}">Complétées</button>
                </div>
            </div>

            <div class="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${filtered.length > 0 ? filtered.map(order => `
                    <div class="bg-dark-800 border border-dark-700 rounded-xl p-4 transition hover:border-dark-600">
                        <div class="flex justify-between items-start mb-3">
                            <div>
                                <p class="font-semibold">${order.client}</p>
                                <p class="text-xs text-gray-400">#${order.id} • ${order.date}</p>
                            </div>
                            ${getBadge(order.status)}
                        </div>
                        <div class="flex flex-wrap gap-1.5 mb-3">
                            ${order.items.split(', ').map(item => `<span class="px-2 py-0.5 bg-dark-700 rounded text-xs text-gray-300">${item}</span>`).join('')}
                        </div>
                        <div class="flex justify-between items-center pt-3 border-t border-dark-700">
                            <span class="text-lg font-bold text-primary">${order.total} DH</span>
                            <div class="flex gap-1">
                                ${order.status === 'pending' ? `
                                    <button onclick="updateStatus(${order.id}, 'accepted')" class="px-2 py-1 bg-blue-600 hover:bg-blue-700 rounded text-xs text-white">✓</button>
                                    <button onclick="updateStatus(${order.id}, 'rejected')" class="px-2 py-1 bg-red-600 hover:bg-red-700 rounded text-xs text-white">✕</button>
                                ` : order.status === 'accepted' ? `
                                    <button onclick="updateStatus(${order.id}, 'completed')" class="px-2 py-1 bg-green-600 hover:bg-green-700 rounded text-xs text-white">Terminer</button>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `).join('') : '<p class="text-gray-500 col-span-full text-center py-10">Aucune commande trouvée.</p>'}
            </div>
        </div>
    `;
}

function attachEvents() {
    // Les événements sont gérés via onclick inline pour simplifier
}
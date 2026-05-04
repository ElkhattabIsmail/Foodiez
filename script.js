// Foodiez SPA - Restaurant Order Management System

// Global variables
let orders = [];
let settings = {};
let currentSection = 'dashboard';
let currentFilter = 'all';
let isLoading = false;

// API Configuration
const API_BASE_URL = 'http://localhost:3000';

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

async function initializeApp() {
    try {
        showLoading(true);
        await loadSettings();
        await loadOrders();
        updateDashboard();
        updateOrdersList();
        navigateTo('dashboard');
        setupEventListeners();
    } catch (error) {
        showError('Erreur lors de l\'initialisation de l\'application: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// Setup event listeners
function setupEventListeners() {
    // New order form
    const form = document.getElementById('newOrderForm');
    if (form) {
        form.addEventListener('submit', handleNewOrderSubmit);
    }
}

// Navigation
function navigateTo(section) {
    // Hide all sections
    document.querySelectorAll('.content-section').forEach(sec => {
        sec.classList.add('hidden');
    });
    
    // Show target section
    const targetSection = document.getElementById(section);
    if (targetSection) {
        targetSection.classList.remove('hidden');
    }
    
    // Update navigation buttons
    document.querySelectorAll('.nav-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-section="${section}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('text-gray-700');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    currentSection = section;
    
    // Refresh data when navigating to dashboard or orders
    if (section === 'dashboard') {
        updateDashboard();
    } else if (section === 'orders') {
        updateOrdersList();
    }
}

// API Functions
async function loadSettings() {
    try {
        const response = await axios.get(`${API_BASE_URL}/settings`);
        settings = response.data;
        updateSettingsInUI();
    } catch (error) {
        console.error('Error loading settings:', error);
        throw error;
    }
}

async function loadOrders() {
    try {
        const response = await axios.get(`${API_BASE_URL}/orders`);
        orders = response.data;
    } catch (error) {
        console.error('Error loading orders:', error);
        throw error;
    }
}

async function createOrder(orderData) {
    try {
        showLoading(true);
        const response = await axios.post(`${API_BASE_URL}/orders`, {
            ...orderData,
            createdAt: new Date().toISOString().split('T')[0]
        });
        
        // Add to local orders array
        orders.push(response.data);
        
        // Refresh UI
        updateDashboard();
        updateOrdersList();
        
        // Navigate to orders section
        navigateTo('orders');
        
        showSuccess('Commande créée avec succès!');
    } catch (error) {
        showError('Erreur lors de la création de la commande: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function updateOrderStatus(orderId, newStatus) {
    try {
        showLoading(true);
        await axios.patch(`${API_BASE_URL}/orders/${orderId}`, { status: newStatus });
        
        // Update local orders array
        const orderIndex = orders.findIndex(o => o.id === orderId);
        if (orderIndex !== -1) {
            orders[orderIndex].status = newStatus;
        }
        
        // Refresh UI
        updateDashboard();
        updateOrdersList();
        
        showSuccess('Statut de la commande mis à jour!');
    } catch (error) {
        showError('Erreur lors de la mise à jour du statut: ' + error.message);
    } finally {
        showLoading(false);
    }
}

async function deleteOrder(orderId) {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette commande?')) {
        return;
    }
    
    try {
        showLoading(true);
        await axios.delete(`${API_BASE_URL}/orders/${orderId}`);
        
        // Remove from local orders array
        orders = orders.filter(o => o.id !== orderId);
        
        // Refresh UI
        updateDashboard();
        updateOrdersList();
        
        showSuccess('Commande supprimée avec succès!');
    } catch (error) {
        showError('Erreur lors de la suppression de la commande: ' + error.message);
    } finally {
        showLoading(false);
    }
}

// UI Update Functions
function updateSettingsInUI() {
    if (settings.restaurantName) {
        document.getElementById('restaurantName').textContent = settings.restaurantName;
        document.getElementById('footerRestaurantName').textContent = settings.restaurantName;
    }
    if (settings.contactEmail) {
        document.getElementById('footerEmail').textContent = settings.contactEmail;
    }
}

function updateDashboard() {
    // Calculate statistics
    const stats = {
        total: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        accepted: orders.filter(o => o.status === 'accepted').length,
        rejected: orders.filter(o => o.status === 'rejected').length,
        completed: orders.filter(o => o.status === 'completed').length
    };
    
    // Update statistics cards
    document.getElementById('totalOrders').textContent = stats.total;
    document.getElementById('pendingOrders').textContent = stats.pending;
    document.getElementById('acceptedOrders').textContent = stats.accepted;
    document.getElementById('rejectedOrders').textContent = stats.rejected;
    document.getElementById('completedOrders').textContent = stats.completed;
    
    // Update recent orders
    const recentOrdersContainer = document.getElementById('recentOrders');
    const recentOrders = orders
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5);
    
    if (recentOrders.length === 0) {
        recentOrdersContainer.innerHTML = '<p class="text-gray-500 text-center">Aucune commande récente</p>';
    } else {
        recentOrdersContainer.innerHTML = recentOrders.map(order => createOrderCard(order, false)).join('');
    }
}

function updateOrdersList() {
    const ordersContainer = document.getElementById('ordersList');
    const emptyState = document.getElementById('emptyOrdersState');
    
    // Filter orders based on current filter
    const filteredOrders = currentFilter === 'all' 
        ? orders 
        : orders.filter(o => o.status === currentFilter);
    
    if (filteredOrders.length === 0) {
        ordersContainer.innerHTML = '';
        emptyState.classList.remove('hidden');
    } else {
        emptyState.classList.add('hidden');
        ordersContainer.innerHTML = filteredOrders.map(order => createOrderCard(order, true)).join('');
    }
}

function createOrderCard(order, showActions = true) {
    const statusColors = {
        pending: 'bg-yellow-100 text-yellow-800',
        accepted: 'bg-blue-100 text-blue-800',
        rejected: 'bg-red-100 text-red-800',
        completed: 'bg-green-100 text-green-800'
    };
    
    const statusLabels = {
        pending: 'En Attente',
        accepted: 'Acceptée',
        rejected: 'Refusée',
        completed: 'Complétée'
    };
    
    const itemsList = Array.isArray(order.items) ? order.items.join(', ') : order.items;
    
    let cardHTML = `
        <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
            <div class="flex justify-between items-start mb-4">
                <div>
                    <h3 class="text-lg font-semibold text-gray-900">${order.customerName}</h3>
                    <p class="text-sm text-gray-500">Commande #${order.id}</p>
                </div>
                <span class="px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}">
                    ${statusLabels[order.status]}
                </span>
            </div>
            
            <div class="mb-4">
                <p class="text-sm text-gray-600 mb-1">
                    <strong>Articles:</strong> ${itemsList}
                </p>
                <p class="text-sm text-gray-600 mb-1">
                    <strong>Total:</strong> ${order.totalPrice} MAD
                </p>
                <p class="text-sm text-gray-500">
                    <strong>Date:</strong> ${order.createdAt}
                </p>
            </div>
    `;
    
    if (showActions) {
        cardHTML += `
            <div class="flex flex-wrap gap-2">
                <select onchange="updateOrderStatus(${order.id}, this.value)" 
                        class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                    <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>En Attente</option>
                    <option value="accepted" ${order.status === 'accepted' ? 'selected' : ''}>Acceptée</option>
                    <option value="rejected" ${order.status === 'rejected' ? 'selected' : ''}>Refusée</option>
                    <option value="completed" ${order.status === 'completed' ? 'selected' : ''}>Complétée</option>
                </select>
                <button onclick="deleteOrder(${order.id})" 
                        class="px-3 py-1 bg-red-600 text-white rounded-md text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                    Supprimer
                </button>
            </div>
        `;
    }
    
    cardHTML += '</div>';
    return cardHTML;
}

// Form Handling
function handleNewOrderSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    const items = formData.get('items').split(',').map(item => item.trim());
    
    const orderData = {
        customerName: formData.get('customerName'),
        items: items,
        totalPrice: parseFloat(formData.get('totalPrice')),
        status: 'pending'
    };
    
    createOrder(orderData);
    resetForm();
}

function resetForm() {
    const form = document.getElementById('newOrderForm');
    if (form) {
        form.reset();
    }
}

// Filter Functions
function filterOrders(filter) {
    currentFilter = filter;
    
    // Update filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('bg-indigo-600', 'text-white');
        btn.classList.add('bg-gray-200', 'text-gray-700');
    });
    
    const activeBtn = document.querySelector(`[data-filter="${filter}"]`);
    if (activeBtn) {
        activeBtn.classList.remove('bg-gray-200', 'text-gray-700');
        activeBtn.classList.add('bg-indigo-600', 'text-white');
    }
    
    updateOrdersList();
}

// UI State Functions
function showLoading(show) {
    isLoading = show;
    const loadingState = document.getElementById('loadingState');
    if (loadingState) {
        loadingState.classList.toggle('hidden', !show);
    }
}

function showError(message) {
    const errorState = document.getElementById('errorState');
    const errorMessage = document.getElementById('errorMessage');
    
    if (errorState && errorMessage) {
        errorMessage.textContent = message;
        errorState.classList.remove('hidden');
        
        // Auto-hide after 5 seconds
        setTimeout(() => {
            errorState.classList.add('hidden');
        }, 5000);
    }
}

function showSuccess(message) {
    // Create a temporary success message
    const successDiv = document.createElement('div');
    successDiv.className = 'fixed top-20 right-4 bg-green-50 border border-green-200 rounded-md p-4 z-50 max-w-sm';
    successDiv.innerHTML = `
        <div class="flex">
            <div class="flex-shrink-0">
                <svg class="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd" />
                </svg>
            </div>
            <div class="ml-3">
                <p class="text-sm font-medium text-green-800">${message}</p>
            </div>
        </div>
    `;
    
    document.body.appendChild(successDiv);
    
    // Auto-remove after 3 seconds
    setTimeout(() => {
        if (successDiv.parentNode) {
            successDiv.parentNode.removeChild(successDiv);
        }
    }, 3000);
}

// Utility Functions
function formatCurrency(amount) {
    return new Intl.NumberFormat('fr-MA', {
        style: 'currency',
        currency: 'MAD'
    }).format(amount);
}

function formatDate(dateString) {
    return new Date(dateString).toLocaleDateString('fr-FR');
}
// utils.js

function getBadge(status) {
    const styles = {
        pending: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
        accepted: 'bg-blue-500/20 text-blue-400 border border-blue-500/30',
        completed: 'bg-green-500/20 text-green-400 border border-green-500/30',
        rejected: 'bg-red-500/20 text-red-400 border border-red-500/30'
    };
    const labels = {
        pending: 'En attente',
        accepted: 'Acceptée',
        completed: 'Complétée',
        rejected: 'Refusée'
    };
    return `<span class="px-2.5 py-1 rounded-full text-xs ${styles[status]}">${labels[status]}</span>`;
}

function calculateStats() {
    return {
        total: state.orders.length,
        pending: state.orders.filter(o => o.status === 'pending').length,
        accepted: state.orders.filter(o => o.status === 'accepted').length,
        completed: state.orders.filter(o => o.status === 'completed').length,
        rejected: state.orders.filter(o => o.status === 'rejected').length
    };
}
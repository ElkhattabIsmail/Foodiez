// app.js

function changeView(newView) {
    state.view = newView;
    render();
}

function setFilter(filterType) {
    state.filter = filterType;
    render();
}

function updateStatus(id, newStatus) {
    const orderIndex = state.orders.findIndex(o => o.id === id);
    if (orderIndex !== -1) {
        state.orders[orderIndex].status = newStatus;
        render();
    }
}

// Initialisation
document.addEventListener('DOMContentLoaded', () => {
    render();
});
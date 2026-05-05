// data.js

const initialState = {
    view: 'dashboard',
    filter: 'all',
    orders: [
        { id: 1, client: "Ahmed", items: "Pizza, Soda", total: 120, status: "pending", date: "2025-03-16" },
        { id: 2, client: "Sarah", items: "Burger, Frites", total: 85, status: "accepted", date: "2025-03-16" },
        { id: 3, client: "Mohamed", items: "Tacos", total: 95, status: "completed", date: "2025-03-15" },
        { id: 4, client: "Fatima", items: "Salade", total: 45, status: "rejected", date: "2025-03-15" },
        { id: 5, client: "Karim", items: "Pizza, Burger", total: 150, status: "pending", date: "2025-03-16" }
    ]
};

let state = { ...initialState };
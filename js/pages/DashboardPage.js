import { storage } from '../storage.js';
import { SummaryCard } from '../components/SummaryCards.js';
import { formatCurrency } from '../utils.js';

export function DashboardPage() {
    const div = document.createElement('div');
    div.innerHTML = `<h2>Dashboard</h2>`;

    const clients = storage.get('clients') || [];
    const invoices = storage.get('invoices') || [];

    const totalClients = clients.length;
    const totalInvoices = invoices.length;

    // Total Revenue dari invoice yang sudah dibayar
    const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) =>
            sum + inv.items.reduce((t, item) => t + item.qty * item.price, 0), 0);

    // Total Outstanding (unpaid + overdue)
    const totalOutstanding = invoices
        .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
        .reduce((sum, inv) =>
            sum + inv.items.reduce((t, item) => t + item.qty * item.price, 0), 0);

    const container = document.createElement('div');
    container.style = 'display: flex; gap: 1rem; flex-wrap: wrap;';

    container.appendChild(SummaryCard('Total Clients', totalClients));
    container.appendChild(SummaryCard('Total Invoices', totalInvoices));
    container.appendChild(SummaryCard('Total Revenue (Paid)', formatCurrency(totalRevenue)));
    container.appendChild(SummaryCard('Total Outstanding (Unpaid + Overdue)', formatCurrency(totalOutstanding)));

    div.appendChild(container);
    return div;
}

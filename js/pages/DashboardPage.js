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

    const today = new Date().toISOString().split('T')[0];
    const invoiceStatuses = { paid: 0, unpaid: 0, overdue: 0 };

    invoices.forEach(inv => {
        if (inv.status !== 'paid' && inv.dueDate < today) {
            invoiceStatuses.overdue++;
        } else {
            invoiceStatuses[inv.status]++;
        }
    });

    const totalRevenue = invoices
        .filter(inv => inv.status === 'paid')
        .reduce((sum, inv) => sum + inv.items.reduce((t, item) => t + item.qty * item.price, 0), 0);

    const totalOutstanding = invoices
        .filter(inv => inv.status === 'unpaid' || inv.status === 'overdue')
        .reduce((sum, inv) => sum + inv.items.reduce((t, item) => t + item.qty * item.price, 0), 0);

    // Summary Cards
    const summaryWrapper = document.createElement('div');
    summaryWrapper.style = 'display: flex; gap: 1rem; flex-wrap: wrap; margin-bottom: 2rem;';
    summaryWrapper.appendChild(SummaryCard('Total Clients', totalClients));
    summaryWrapper.appendChild(SummaryCard('Total Invoices', totalInvoices));
    summaryWrapper.appendChild(SummaryCard('Total Revenue (Paid)', formatCurrency(totalRevenue)));
    summaryWrapper.appendChild(SummaryCard('Outstanding (Unpaid + Overdue)', formatCurrency(totalOutstanding)));

    // Chart Pie
    const chartWrapper = document.createElement('div');
    chartWrapper.style = 'max-width: 400px; margin-top: 2rem;';
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 400;
    chartWrapper.appendChild(canvas);

    setTimeout(() => {
        const ctx = canvas.getContext('2d');
        const chartData = [
            invoiceStatuses.paid,
            invoiceStatuses.unpaid,
            invoiceStatuses.overdue
        ];
        const total = chartData.reduce((a, b) => a + b, 0);

        new window.Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['Paid', 'Unpaid', 'Overdue'],
                datasets: [{
                    data: chartData,
                    backgroundColor: ['#4caf50', '#ff9800', '#f44336'],
                }]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'bottom' },
                    title: {
                        display: true,
                        text: 'Invoice Status Distribution'
                    },
                    datalabels: {
                        formatter: (value, context) => {
                            const percentage = ((value / total) * 100).toFixed(1);
                            return `${value} (${percentage}%)`;
                        },
                        color: '#fff',
                        font: {
                            weight: 'bold',
                            size: 14
                        }
                    }
                }
            },
            plugins: [window.ChartDataLabels]
        });
    }, 0);

    div.appendChild(summaryWrapper);
    div.appendChild(chartWrapper);

    return div;
}

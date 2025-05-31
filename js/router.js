import { DashboardPage } from './pages/DashboardPage.js';
import { ClientsPage } from './pages/ClientsPages.js';
import { InvoicesPage } from './pages/InvoicesPage.js';
import { InvoiceDetailPage } from './pages/InvoiceDetailPage.js';

const routes = {
    '/': DashboardPage,
    '/clients': ClientsPage,
    '/invoices': InvoicesPage,
};

function parseRoute(hash) {
    const parts = hash.replace(/^#/, '').split('/').filter(Boolean); // Remove # and empty parts
    const path = '/' + (parts[0] || '');         // base path
    const param = parts[1] || null;
    const subParam = parts[2] || null;

    if (path === '/invoices' && param === 'edit' && subParam) {
        return { path: '/invoices/edit', id: subParam };
    }

    return { path, id: param };
}

export function inirouter() {
    window.addEventListener('hashchange', renderRoute);
    window.addEventListener('load', renderRoute); // Initial load
}

function renderRoute() {
    const { path, id } = parseRoute(location.hash || '#/');
    const content = document.getElementById('content');
    if (!content) return console.error('Missing #content container');

    content.innerHTML = '';

    if (path === '/invoices' && id) {
        // Detail page: #/invoices/:id
        content.appendChild(InvoiceDetailPage(id));
    }

    else if (routes[path]) {
        content.appendChild(routes[path]());
    } else {
        content.innerHTML = '<h2>404 - Page Not Found</h2>';
    }
}

export function Navbar(currentPath) {
  const nav = document.createElement('nav');
  nav.className = 'navbar';

  nav.innerHTML = `
    <div class="navbar-container no-print">
      <div class="navbar-brand">InvoiceHub</div>
      <ul class="navbar-links">
        <li><a href="#/" class="${currentPath === '/' ? 'active' : ''}">Dashboard</a></li>
        <li><a href="#/clients" class="${currentPath === '/clients' ? 'active' : ''}">Clients</a></li>
        <li><a href="#/invoices" class="${currentPath === '/invoices' ? 'active' : ''}">Invoices</a></li>
      </ul>
    </div>
  `;
  return nav;
}

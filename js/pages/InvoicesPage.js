import { storage } from '../storage.js';
import { formatCurrency, debounce } from '../utils.js';
import { createInvoiceModal } from '../components/ModalInvoice.js';

function createStatusBadge(status) {
  const span = document.createElement('span');
  span.textContent = status;
  span.style = `
    padding: 0.25rem 0.5rem;
    border-radius: 4px;
    color: white;
    font-size: 0.8rem;
    text-transform: capitalize;
    background-color: ${status === 'paid' ? 'green' : status === 'unpaid' ? 'orange' : 'red'};
  `;
  return span;
}

function createInvoiceRow(invoice, clients, onEdit, onDelete) {
  const client = clients.find(c => c.id === invoice.clientId);
  const total = invoice.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const tr = document.createElement('tr');
  tr.innerHTML = `
    <td>${invoice.invoiceNumber}</td>
    <td>${client?.name || '-'}</td>
    <td>${invoice.issuedDate}</td>
    <td>${invoice.dueDate}</td>
    <td class="status-cell"></td>
    <td>${formatCurrency(total)}</td>
    <td>
      <button class="edit-btn">✏️</button>
      <button class="detail-btn">🔍</button>
      <button class="delete-btn">🗑️</button>
    </td>
  `;
  tr.querySelector('.status-cell').appendChild(createStatusBadge(invoice.status));
  tr.querySelector('.edit-btn').onclick = () => onEdit(invoice.id);
  tr.querySelector('.delete-btn').onclick = () => onDelete(invoice.id);
  tr.querySelector('.detail-btn').onclick = () => {
    const idNumber = invoice.invoiceNumber.replace('INV-', '');
    location.hash = `#/invoices/${idNumber}`;
  };
  return tr;
}

export function InvoicesPage() {
  const div = document.createElement('div');
  div.innerHTML = `<h2>Invoices</h2>`;

  let invoices = storage.get('invoices') || [];
  const clients = storage.get('clients') || [];

  // One overlay untuk all modal/detail
  const overlay = document.createElement('div');
  overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0005;display:none;z-index:10;';
  document.body.appendChild(overlay);

  const modalInstance = createInvoiceModal(clients, updatedInvoice => {
    const index = invoices.findIndex(i => i.id === updatedInvoice.id);
    if (index >= 0) invoices[index] = updatedInvoice;
    else invoices.push(updatedInvoice);
    storage.set('invoices', invoices);
    render(searchInput.value);
  });

  document.body.append(modalInstance.modal, modalInstance.overlay);

  const deleteInvoice = id => {
    if (confirm('Delete this invoice?')) {
      invoices = invoices.filter(i => i.id !== id);
      storage.set('invoices', invoices);
      render(searchInput.value);
    }
  };

  const searchWrapper = document.createElement('div');
  searchWrapper.className = 'search-wrapper';
  searchWrapper.style = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;';

  const searchIcon = document.createElement('span');
  searchIcon.className = 'search-icon';
  searchIcon.textContent = '🔍';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search invoice number or client name...';
  searchInput.className = 'search-input';
  searchInput.style = 'flex: 1; padding: 0.5rem;';

  searchWrapper.append(searchIcon, searchInput);


  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add Invoice';
  addBtn.classList.add('add-invoice-btn');

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr><th>No</th><th>Invoice</th><th>Client</th><th>Issued</th><th>Due</th><th>Status</th><th>Total</th><th>Actions</th></tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  const filterWrapper = document.createElement('div');
  filterWrapper.style = 'display: flex; flex-wrap: wrap; gap: 1rem; margin-bottom: 1rem; align-items: center;';
  const statusFilter = document.createElement('select');
  statusFilter.innerHTML = `<option value="">All Status</option><option value="paid">Paid</option><option value="unpaid">Unpaid</option><option value="overdue">Overdue</option>`;
  const clientFilter = document.createElement('select');
  clientFilter.innerHTML = `<option value="">All Clients</option>` + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');
  const dueFrom = document.createElement('input');
  dueFrom.type = 'date';
  const dueTo = document.createElement('input');
  dueTo.type = 'date';
  filterWrapper.append(statusFilter, clientFilter, dueFrom, dueTo);
  div.prepend(filterWrapper);

  const render = (searchText = '') => {
    tbody.innerHTML = '';
    const today = new Date().toISOString().split('T')[0];
    invoices = invoices.map(i => {
      if (i.status !== 'paid' && i.dueDate < today) i.status = 'overdue';
      return i;
    });
    storage.set('invoices', invoices);

    let filtered = invoices;

    if (searchText.trim()) {
      filtered = filtered.filter(i => {
        const c = clients.find(c => c.id === i.clientId);
        return i.invoiceNumber.toLowerCase().includes(searchText.toLowerCase()) ||
          c?.name.toLowerCase().includes(searchText.toLowerCase());
      });
    }

    if (statusFilter.value) filtered = filtered.filter(i => i.status === statusFilter.value);
    if (clientFilter.value) filtered = filtered.filter(i => i.clientId === clientFilter.value);
    if (dueFrom.value) filtered = filtered.filter(i => i.dueDate >= dueFrom.value);
    if (dueTo.value) filtered = filtered.filter(i => i.dueDate <= dueTo.value);

    filtered.forEach((inv, idx) => {
      const row = createInvoiceRow(inv, clients, id => modalInstance.open(invoices.find(i => i.id === id)), deleteInvoice);
      const no = document.createElement('td');
      no.textContent = idx + 1;
      row.insertBefore(no, row.firstChild);
      tbody.appendChild(row);
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8">No invoices found.</td>`;
      tbody.appendChild(tr);
    }
  };

  searchInput.addEventListener('input', debounce(e => render(e.target.value), 300));
  statusFilter.addEventListener('change', () => render(searchInput.value));
  clientFilter.addEventListener('change', () => render(searchInput.value));
  dueFrom.addEventListener('change', () => render(searchInput.value));
  dueTo.addEventListener('change', () => render(searchInput.value));
  addBtn.onclick = () => modalInstance.open();

  overlay.onclick = () => {
    modalInstance.modal.style.display = 'none';
    overlay.style.display = 'none';
  };

  div.append(searchWrapper, addBtn);

  render();

  const tableWrapper = document.createElement('div');
  tableWrapper.style = `
  overflow-x: auto;
  width: 100%;
  max-width: 100%;
`;


  table.style = `
  width: max-content;
  min-width: 1000px;
  border-collapse: collapse;
`;
  table.style.borderCollapse = 'collapse';

  tableWrapper.appendChild(table);
  div.appendChild(tableWrapper);
  return div;
}

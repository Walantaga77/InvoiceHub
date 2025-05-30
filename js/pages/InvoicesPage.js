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
      <button class="edit-btn">Edit</button>
      <button class="detail-btn">Detail</button>
      <button class="delete-btn">Delete</button>
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

  const ITEMS_PER_PAGE = 10;
  let currentPage = 1;

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

  let lastDeletedInvoice = null;
  let undoTimeout = null;

  const showUndoToast = () => {
    const toast = document.createElement('div');
    toast.textContent = 'Invoice deleted. ';
    toast.style = `
    position: fixed;
    bottom: 1rem;
    left: 50%;
    transform: translateX(-50%);
    background: #333;
    color: white;
    padding: 0.75rem 1.25rem;
    border-radius: 5px;
    z-index: 9999;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    font-size: 0.9rem;
  `;

    const undoBtn = document.createElement('button');
    undoBtn.textContent = 'Undo';
    undoBtn.style = `
    background: #10b981;
    border: none;
    padding: 0.3rem 0.75rem;
    border-radius: 3px;
    color: white;
    cursor: pointer;
  `;

    undoBtn.onclick = () => {
      invoices.push(lastDeletedInvoice);
      storage.set('invoices', invoices);
      render(searchInput.value);
      clearTimeout(undoTimeout);
      toast.remove();
      lastDeletedInvoice = null;
    };

    toast.appendChild(undoBtn);
    document.body.appendChild(toast);

    undoTimeout = setTimeout(() => {
      toast.remove();
      lastDeletedInvoice = null;
    }, 5000);
  };

  const deleteInvoice = id => {
    const invoice = invoices.find(i => i.id === id);
    if (!invoice) return;

    if (confirm('Delete this invoice?')) {
      lastDeletedInvoice = invoice;
      invoices = invoices.filter(i => i.id !== id);
      storage.set('invoices', invoices);
      render(searchInput.value);
      showUndoToast();
    }
  };


  const addBtn = document.createElement('button');
  addBtn.textContent = '+ Add Invoice';
  addBtn.classList.add('add-invoice-btn');
  addBtn.style = 'margin-bottom: 1rem;';

  const searchWrapper = document.createElement('div');
  searchWrapper.style = 'display: flex; align-items: center; gap: 0.5rem; margin-bottom: 0.5rem;';

  const searchIcon = document.createElement('span');
  searchIcon.textContent = '🔍';

  const searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = 'Search invoice number or client name...';
  searchInput.style = 'flex: 1; padding: 0.5rem;';

  searchWrapper.append(searchIcon, searchInput);

  const filterWrapper = document.createElement('div');
  filterWrapper.style = 'display: flex; flex-wrap: wrap; gap: 0.5rem; margin-bottom: 1rem;';

  const statusFilter = document.createElement('select');
  statusFilter.innerHTML = `
    <option value="">All Status</option>
    <option value="paid">Paid</option>
    <option value="unpaid">Unpaid</option>
    <option value="overdue">Overdue</option>
  `;

  const clientFilter = document.createElement('select');
  clientFilter.innerHTML = `<option value="">All Clients</option>` + clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('');

  const dueFrom = document.createElement('input');
  dueFrom.type = 'date';
  const dueTo = document.createElement('input');
  dueTo.type = 'date';

  filterWrapper.append(statusFilter, clientFilter, dueFrom, dueTo);

  const table = document.createElement('table');
  table.innerHTML = `
    <thead>
      <tr>
        <th>No</th>
        <th>Invoice</th>
        <th>Client</th>
        <th>Issued</th>
        <th>Due</th>
        <th>Status</th>
        <th>Total</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;
  const tbody = table.querySelector('tbody');

  const tableWrapper = document.createElement('div');
  tableWrapper.style = 'overflow-x: auto; width: 100%; max-width: 100%; margin-top: 1rem;';
  tableWrapper.appendChild(table);

  table.style = 'width: 100%; border-collapse: collapse;';

  const pagination = document.createElement('div');
  pagination.style = 'margin-top: 1rem; display: flex; justify-content: center; gap: 1rem;';

  const prevBtn = document.createElement('button');
  prevBtn.textContent = '⟨ Prev';
  const nextBtn = document.createElement('button');
  nextBtn.textContent = 'Next ⟩';

  pagination.append(prevBtn, nextBtn);

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

    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    if (currentPage > totalPages) currentPage = totalPages || 1;

    const startIdx = (currentPage - 1) * ITEMS_PER_PAGE;
    const pageItems = filtered.slice(startIdx, startIdx + ITEMS_PER_PAGE);

    pageItems.forEach((inv, idx) => {
      const row = createInvoiceRow(inv, clients, id => modalInstance.open(invoices.find(i => i.id === id)), deleteInvoice);
      const no = document.createElement('td');
      no.textContent = startIdx + idx + 1;
      row.insertBefore(no, row.firstChild);

      row.querySelectorAll('td').forEach(td => {
        td.style.padding = '0.75rem';
        td.style.borderBottom = '1px solid #eee';
      });

      row.onmouseover = () => row.style.backgroundColor = '#f9f9f9';
      row.onmouseout = () => row.style.backgroundColor = '';

      tbody.appendChild(row);
    });

    if (filtered.length === 0) {
      const tr = document.createElement('tr');
      tr.innerHTML = `<td colspan="8" style="padding: 1rem; text-align: center;">No invoices found.</td>`;
      tbody.appendChild(tr);
    }

    table.querySelectorAll('th').forEach(th => {
      th.style.padding = '0.75rem';
      th.style.textAlign = 'left';
      th.style.backgroundColor = '#f0f0f0';
      th.style.borderBottom = '1px solid #ccc';
    });

    pagination.style.display = filtered.length > ITEMS_PER_PAGE ? 'flex' : 'none';
    prevBtn.disabled = currentPage === 1;
    nextBtn.disabled = currentPage === totalPages;
  };

  prevBtn.onclick = () => {
    if (currentPage > 1) {
      currentPage--;
      render(searchInput.value);
    }
  };

  nextBtn.onclick = () => {
    currentPage++;
    render(searchInput.value);
  };

  searchInput.addEventListener('input', debounce(e => {
    currentPage = 1;
    render(e.target.value);
  }, 300));
  statusFilter.addEventListener('change', () => { currentPage = 1; render(searchInput.value); });
  clientFilter.addEventListener('change', () => { currentPage = 1; render(searchInput.value); });
  dueFrom.addEventListener('change', () => { currentPage = 1; render(searchInput.value); });
  dueTo.addEventListener('change', () => { currentPage = 1; render(searchInput.value); });
  addBtn.onclick = () => modalInstance.open();

  overlay.onclick = () => {
    modalInstance.modal.style.display = 'none';
    overlay.style.display = 'none';
  };

  div.append(addBtn, searchWrapper, filterWrapper, tableWrapper, pagination);
  render();
  return div;
}

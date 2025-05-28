import { storage } from '../storage.js';
import { debounce } from '../utils.js';
import { showClientModal } from '../components/Modal.js';

let sortBy = null;
let sortAsc = true;

function createClientRow(client, index, onEdit, onDelete) {
    const tr = document.createElement('tr');
    tr.innerHTML = `
    <td data-label="No">${index + 1}</td>
    <td data-label="ID">${client.id}</td>
    <td data-label="Name">${client.name}</td>
    <td data-label="Email">${client.email}</td>
    <td data-label="Company">${client.company}</td>
    <td data-label="Phone">${client.phone}</td>
    <td data-label="Address">${client.address}</td>
    <td data-label="Actions">
      <button data-id="${client.id}" class="edit-btn">Edit</button>
      <button data-id="${client.id}" class="delete-btn">Delete</button>
    </td>
  `;
    // Event listeners tetap sama
    tr.querySelector('.edit-btn').addEventListener('click', () => onEdit(client.id));
    tr.querySelector('.delete-btn').addEventListener('click', () => onDelete(client.id));
    return tr;
}


export function ClientsPage() {
    const div = document.createElement('div');
    div.innerHTML = `<h2>Clients</h2>`;

    const searchWrapper = document.createElement('div');
    searchWrapper.className = 'search-wrapper';

    const searchIcon = document.createElement('span');
    searchIcon.className = 'search-icon';
    searchIcon.innerHTML = '🔍';

    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.placeholder = 'Search by name or email...';
    searchInput.className = 'search-input';

    searchWrapper.appendChild(searchIcon);
    searchWrapper.appendChild(searchInput);


    const btnContainer = document.createElement('div');
    btnContainer.style = 'margin-bottom: 1rem; display: flex; gap: 0.5rem;';

    const addBtn = document.createElement('button');
    addBtn.textContent = '+ Add Client';
    addBtn.classList.add('add-client-btn');

    const resetBtn = document.createElement('button');
    resetBtn.textContent = 'Reset Filter';
    resetBtn.classList.add('reset-filter-btn');

    btnContainer.appendChild(addBtn);
    btnContainer.appendChild(resetBtn);

    const table = document.createElement('table');
    table.classList.add('client-table');
    table.innerHTML = `
    <thead>
      <tr>
        <th data-key="index">No</th>
        <th data-key="id">ID</th>
        <th data-key="name">Name</th>
        <th data-key="email">Email</th>
        <th data-key="company">Company</th>
        <th data-key="phone">Phone</th>
        <th data-key="address">Address</th>
        <th>Actions</th>
      </tr>
    </thead>
    <tbody></tbody>
  `;

    const thead = table.querySelector('thead');
    const tbody = table.querySelector('tbody');
    let clients = storage.get('clients') || [];

    // Sort icon + logic
    thead.querySelectorAll('th[data-key]').forEach(th => {
        th.style.cursor = 'pointer';
        th.addEventListener('click', () => {
            const key = th.dataset.key;
            if (sortBy === key) {
                sortAsc = !sortAsc;
            } else {
                sortBy = key;
                sortAsc = true;
            }
            updateSortIcons();
            renderClients(searchInput.value);
        });
    });

    function updateSortIcons() {
        thead.querySelectorAll('th[data-key]').forEach(th => {
            const key = th.dataset.key;
            if (sortBy === key) {
                th.textContent = th.textContent.replace(/ 🔼| 🔽/g, '') + (sortAsc ? ' 🔼' : ' 🔽');
            } else {
                th.textContent = th.textContent.replace(/ 🔼| 🔽/g, '');
            }
        });
    }

    function renderClients(filter = '') {
        tbody.innerHTML = '';

        let filtered = clients.filter(c =>
            c.name.toLowerCase().includes(filter.toLowerCase()) ||
            c.email.toLowerCase().includes(filter.toLowerCase())
        );

        if (sortBy && sortBy !== 'index') {
            filtered.sort((a, b) => {
                const valA = a[sortBy]?.toLowerCase?.() || a[sortBy] || '';
                const valB = b[sortBy]?.toLowerCase?.() || b[sortBy] || '';
                return (valA > valB ? 1 : -1) * (sortAsc ? 1 : -1);
            });
        } else if (sortBy === 'index') {
            filtered = sortAsc ? filtered : [...filtered].reverse();
        }

        if (filtered.length === 0) {
            const tr = document.createElement('tr');
            tr.innerHTML = `<td colspan="8">No clients found.</td>`;
            tbody.appendChild(tr);
        } else {
            filtered.forEach((c, index) => tbody.appendChild(createClientRow(c, index, editClient, deleteClient)));
        }
    }

    function addClient() {
        showClientModal(null, (newClient) => {
            clients.push(newClient);
            storage.set('clients', clients);
            renderClients(searchInput.value);
        });
    }

    function editClient(id) {
        const client = clients.find(c => c.id === id);
        if (!client) return;
        showClientModal(client, (updatedClient) => {
            const index = clients.findIndex(c => c.id === id);
            if (index !== -1) {
                clients[index] = updatedClient;
                storage.set('clients', clients);
                renderClients(searchInput.value);
            }
        });
    }

    function deleteClient(id) {
        if (confirm('Are you sure you want to delete this client?')) {
            clients = clients.filter(c => c.id !== id);
            storage.set('clients', clients);
            renderClients(searchInput.value);
        }
    }

    const debouncedSearch = debounce((e) => {
        renderClients(e.target.value);
    }, 300);

    searchInput.addEventListener('input', debouncedSearch);
    addBtn.addEventListener('click', addClient);
    resetBtn.addEventListener('click', () => {
        searchInput.value = '';
        sortBy = null;
        sortAsc = true;
        updateSortIcons();
        renderClients('');
    });

    renderClients();
    div.appendChild(searchWrapper);
    div.appendChild(btnContainer);
    div.appendChild(table);

    return div;
}

import { generateUUID } from '../utils.js';
import { createItemRow } from './ItemRow.js';

export function createInvoiceModal(clients, onSave) {
    const overlay = document.createElement('div');
    overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:#0005;display:none;z-index:11;';

    const modal = document.createElement('div');
    modal.style = 'position:fixed;top:10%;left:50%;transform:translateX(-50%);background:white;padding:2rem;max-width:600px;width:90%;z-index:12;display:none;';
    modal.innerHTML = `
    <h3 id="modal-title">Add Invoice</h3>
    <form>
      <label>Client:</label>
      <select name="clientId" required>${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}</select>

      <label>Issued Date:</label>
      <input type="date" name="issuedDate" required>

      <label>Due Date:</label>
      <input type="date" name="dueDate" required>

      <label>Status:</label>
      <select name="status" required>
        <option value="paid">Paid</option>
        <option value="unpaid">Unpaid</option>
      </select>

      <label>Notes:</label>
      <textarea name="notes" rows="2"></textarea>

      <label>Items:</label>
      <div id="items-container"></div>
      <button type="button" id="add-item-btn">+ Add Item</button>

      <br><br>
      <button type="submit">Save</button>
      <button type="button" id="cancel-btn">Cancel</button>
    </form>
  `;

    let currentInvoice = null;

    const form = modal.querySelector('form');
    const itemsContainer = modal.querySelector('#items-container');
    const addItemBtn = modal.querySelector('#add-item-btn');

    addItemBtn.onclick = () => {
        itemsContainer.appendChild(createItemRow());
    };

    form.onsubmit = e => {
        e.preventDefault();
        const formData = new FormData(form);
        const items = [...itemsContainer.querySelectorAll('.item-row')].map(row => ({
            name: row.querySelector('.item-name').value.trim(),
            qty: parseInt(row.querySelector('.item-qty').value),
            price: parseFloat(row.querySelector('.item-price').value),
        })).filter(i => i.name && !isNaN(i.qty) && !isNaN(i.price));

        const invoice = {
            id: currentInvoice?.id || generateUUID(),
            invoiceNumber: currentInvoice?.invoiceNumber || `INV-${Date.now()}`,
            clientId: formData.get('clientId'),
            issuedDate: formData.get('issuedDate'),
            dueDate: formData.get('dueDate'),
            status: formData.get('status'),
            notes: formData.get('notes'),
            items
        };

        onSave(invoice);
        modal.style.display = overlay.style.display = 'none';
    };

    modal.querySelector('#cancel-btn').onclick = () => {
        modal.style.display = overlay.style.display = 'none';
    };

    function open(invoice = null) {
        currentInvoice = invoice;
        form.reset();
        modal.querySelector('#modal-title').textContent = invoice ? 'Edit Invoice' : 'Add Invoice';
        form.clientId.value = invoice?.clientId || clients[0]?.id;
        form.issuedDate.value = invoice?.issuedDate || '';
        form.dueDate.value = invoice?.dueDate || '';
        form.status.value = invoice?.status || 'unpaid';
        form.notes.value = invoice?.notes || '';
        itemsContainer.innerHTML = '';
        (invoice?.items || []).forEach(item => {
            itemsContainer.appendChild(createItemRow(item));
        });
        if (!invoice) itemsContainer.appendChild(createItemRow());
        modal.style.display = overlay.style.display = 'block';
    }

    return {
        modal,
        overlay,
        open,
    };
}

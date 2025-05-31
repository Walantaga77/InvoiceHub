import { generateUUID } from '../utils.js';
import { createItemRow } from './ItemRow.js';

export function createInvoiceModal(clients, onSave) {
  const overlay = document.createElement('div');
  overlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0,0,0,0.4);
    z-index: 11;
    display: none;
  `;

  const modal = document.createElement('div');
  modal.style = `
    position: fixed;
    top: 5%;
    left: 50%;
    transform: translateX(-50%);
    background: white;
    padding: 2rem;
    border-radius: 10px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.15);
    max-width: 600px;
    width: 90%;
    z-index: 12;
    display: none;
    font-family: sans-serif;
    max-height: 90vh;
    overflow-y: auto;  
  `;

  modal.innerHTML = `
    <h3 id="modal-title" style="text-align:center;margin-bottom:1rem;">Add Invoice</h3>
    <form style="display:flex;flex-direction:column;gap:1rem;">
      <label>
        Client:
        <select name="clientId" required style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:5px;">
          ${clients.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
        </select>
      </label>

      <div style="display:flex;gap:1rem;">
        <label style="flex:1;">
          Issued Date:
          <input type="date" name="issuedDate" required style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:5px;">
        </label>
        <label style="flex:1;">
          Due Date:
          <input type="date" name="dueDate" required style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:5px;">
        </label>
      </div>

      <label>
        Status:
        <select name="status" required style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:5px;">
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
        </select>
      </label>

      <label>
        Notes:
        <textarea name="notes" rows="2" style="width:100%;padding:0.5rem;border:1px solid #ccc;border-radius:5px;"></textarea>
      </label>

      <div>
        <label>Items:</label>
        <div id="items-container" style="margin-top:0.5rem;"></div>
        <button type="button" id="add-item-btn" style="
          margin-top:0.5rem;
          padding:0.5rem 1rem;
          border:none;
          background:#f3f4f6;
          color:#333;
          border-radius:5px;
          cursor:pointer;
        ">+ Add Item</button>
      </div>

      <div style="display:flex;justify-content:flex-end;gap:0.5rem;margin-top:1rem;">
        <button type="submit" style="
          background:#3b82f6;
          color:white;
          padding:0.5rem 1.25rem;
          border:none;
          border-radius:5px;
          cursor:pointer;
        ">Save</button>
        <button type="button" id="cancel-btn" style="
          background:#e5e7eb;
          color:#333;
          padding:0.5rem 1rem;
          border:none;
          border-radius:5px;
          cursor:pointer;
        ">Cancel</button>
      </div>
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
    overlay.style.display = 'block';
  }

  return {
    modal,
    overlay,
    open,
  };
}

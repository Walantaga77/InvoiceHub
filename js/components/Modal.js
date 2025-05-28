import { generateUUID } from '../utils.js';

let modalOverlay;

function createModal() {
  modalOverlay = document.createElement('div');
  modalOverlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const modal = document.createElement('div');
  modal.style = `
    background: white;
    padding: 2rem;
    border-radius: 8px;
    width: 90%;
    max-width: 400px;
    position: relative;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.style = `
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  `;
  closeBtn.addEventListener('click', () => {
    modalOverlay.remove();
  });

  modalOverlay.appendChild(modal);
  modal.appendChild(closeBtn);
  return modal;
}

export function showClientModal(clientData = null, onSubmit) {
  const modal = createModal();

  const title = document.createElement('h3');
  title.textContent = clientData ? 'Edit Client' : 'Add Client';

  const form = document.createElement('form');
  form.style = 'display: flex; flex-direction: column; gap: 0.5rem;';
  form.innerHTML = `
    <input type="text" name="name" placeholder="Name *" required />
    <input type="email" name="email" placeholder="Email *" required />
    <input type="text" name="company" placeholder="Company" />
    <input type="text" name="phone" placeholder="Phone *" required />
    <textarea name="address" placeholder="Address"></textarea>
    <div style="display: flex; justify-content: flex-end; gap: 0.5rem; margin-top: 1rem;">
        <button type="submit">${clientData ? 'Save' : 'Add'}</button>
        <button xtype="button" class="cancel-btn">Cancel</button>
    </div>
  `;

  if (clientData) {
    form.name.value = clientData.name || '';
    form.email.value = clientData.email || '';
    form.company.value = clientData.company || '';
    form.phone.value = clientData.phone || '';
    form.address.value = clientData.address || '';
  }

  // Submit event
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const newClient = {
      id: clientData?.id || generateUUID(),
      name: data.get('name').trim(),
      email: data.get('email').trim(),
      company: data.get('company').trim(),
      phone: data.get('phone').trim(),
      address: data.get('address').trim()
    };

    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Name, Email, and Phone are required.');
      return;
    }

    onSubmit(newClient);
    modalOverlay.remove();
  });

  // Cancel button event
  form.querySelector('.cancel-btn').addEventListener('click', () => {
    modalOverlay.remove();
  });

  modal.appendChild(title);
  modal.appendChild(form);
  document.body.appendChild(modalOverlay);
}

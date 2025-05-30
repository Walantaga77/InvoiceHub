import { generateUUID } from '../utils.js';

let modalOverlay;

function createModal() {
  modalOverlay = document.createElement('div');
  modalOverlay.style = `
    position: fixed;
    top: 0; left: 0;
    width: 100vw;
    height: 100vh;
    background-color: rgba(0,0,0,0.4);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
  `;

  const modal = document.createElement('div');
  modal.style = `
    background: #fff;
    padding: 2rem;
    border-radius: 10px;
    width: 90%;
    max-width: 420px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.1);
    position: relative;
    font-family: sans-serif;
  `;

  const closeBtn = document.createElement('button');
  closeBtn.textContent = '✖';
  closeBtn.style = `
    position: absolute;
    top: 1rem;
    right: 1rem;
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
    color: #666;
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
  title.style = `
    text-align: center;
    margin-bottom: 1rem;
    color: #333;
  `;

  const form = document.createElement('form');
  form.style = `
    display: flex;
    flex-direction: column;
    gap: 0.75rem;
  `;

  const createInput = (name, type, placeholder, required = false) => {
    const input = document.createElement(type === 'textarea' ? 'textarea' : 'input');
    input.name = name;
    input.placeholder = placeholder;
    input.required = required;
    input.style = `
      padding: 0.6rem 0.75rem;
      border: 1px solid #ccc;
      border-radius: 5px;
      font-size: 1rem;
      resize: vertical;
      transition: border-color 0.2s;
    `;
    input.onfocus = () => input.style.borderColor = '#3b82f6';
    input.onblur = () => input.style.borderColor = '#ccc';
    return input;
  };

  const nameInput = createInput('name', 'text', 'Name *', true);
  const emailInput = createInput('email', 'email', 'Email *', true);
  const companyInput = createInput('company', 'text', 'Company');
  const phoneInput = createInput('phone', 'text', 'Phone *', true);
  const addressInput = createInput('address', 'textarea', 'Address');

  if (clientData) {
    nameInput.value = clientData.name || '';
    emailInput.value = clientData.email || '';
    companyInput.value = clientData.company || '';
    phoneInput.value = clientData.phone || '';
    addressInput.value = clientData.address || '';
  }

  const buttonGroup = document.createElement('div');
  buttonGroup.style = `
    display: flex;
    justify-content: flex-end;
    gap: 0.5rem;
    margin-top: 1rem;
  `;

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.textContent = clientData ? 'Save' : 'Add';
  submitBtn.style = `
    background-color: #3b82f6;
    color: white;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 5px;
    cursor: pointer;
    font-weight: 500;
  `;

  const cancelBtn = document.createElement('button');
  cancelBtn.type = 'button';
  cancelBtn.textContent = 'Cancel';
  cancelBtn.style = `
    background-color: #e5e7eb;
    color: #333;
    border: none;
    padding: 0.6rem 1rem;
    border-radius: 5px;
    cursor: pointer;
  `;

  cancelBtn.addEventListener('click', () => {
    modalOverlay.remove();
  });

  form.append(nameInput, emailInput, companyInput, phoneInput, addressInput, buttonGroup);
  buttonGroup.append(cancelBtn, submitBtn);

  form.addEventListener('submit', (e) => {
    e.preventDefault();

    const newClient = {
      id: clientData?.id || generateUUID(),
      name: nameInput.value.trim(),
      email: emailInput.value.trim(),
      company: companyInput.value.trim(),
      phone: phoneInput.value.trim(),
      address: addressInput.value.trim(),
    };

    if (!newClient.name || !newClient.email || !newClient.phone) {
      alert('Name, Email, and Phone are required.');
      return;
    }

    onSubmit(newClient);
    modalOverlay.remove();
  });

  modal.append(title, form);
  document.body.appendChild(modalOverlay);
}

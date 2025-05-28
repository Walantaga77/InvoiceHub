export function createItemRow(item = {}) {
    const row = document.createElement('div');
    row.className = 'item-row';
    row.style = 'display: flex; gap: 0.5rem; margin-bottom: 0.5rem; align-items: center;';

    row.innerHTML = `
    <input class="item-name" type="text" placeholder="Item name" value="${item.name || ''}" required style="flex:2;">
    <input class="item-qty" type="number" min="1" value="${item.qty || 1}" required style="width:60px;">
    <input class="item-price" type="number" min="0" step="0.01" value="${item.price || 0}" required style="width:80px;">
    <button type="button" class="remove-item">❌</button>
  `;

    row.querySelector('.remove-item').onclick = () => {
        row.remove();
    };

    return row;
}

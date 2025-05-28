export function SummaryCard(title, value) {
  const card = document.createElement('div');
  card.className = 'summary-card';
  card.style = `
    flex: 1;
    min-width: 200px;
    background: white;
    padding: 1rem;
    border-radius: 0.5rem;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
  `;

  const h3 = document.createElement('h3');
  h3.textContent = title;
  h3.style = 'margin: 0 0 0.5rem 0; font-size: 1rem; color: #666;';

  const p = document.createElement('p');
  p.textContent = value;
  p.style = 'font-size: 1.5rem; font-weight: bold; margin: 0;';

  card.appendChild(h3);
  card.appendChild(p);
  return card;
}

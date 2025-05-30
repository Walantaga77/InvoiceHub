import { storage } from '../storage.js';
import { formatCurrency, numberToWords } from '../utils.js';

export function InvoiceDetailPage(id) {
  const invoices = storage.get('invoices') || [];
  const invoice = invoices.find(i => i.invoiceNumber.endsWith(id));
  const clients = storage.get('clients') || [];
  const client = clients.find(c => c.id === invoice?.clientId);

  const div = document.createElement('div');
  div.classList.add('invoice-page');

  if (!invoice) {
    div.innerHTML = `<h2>Invoice Not Found</h2><p>Data tidak tersedia.</p>`;
    return div;
  }

  const total = invoice.items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const terbilang = numberToWords(total);

  div.innerHTML = `
  <div class="no-print btn-group">
    <button onclick="history.back()">← Kembali</button>
    <button onclick="window.print()">🖨️ Print</button>
    <button id="export-pdf">📄 Export to PDF</button>
  </div>
    <div style="overflow-x:auto;">
      <div class="invoice-container" id="invoice-content">
          <div class="invoice-container" id="invoice-content">
            <div class="header">
              <div class="company-info">
                <strong>InvoiceHub</strong><br>
                Tirtasani Ruko H-6<br>
                Jl. Tirtasani, Kabupaten Malang,<br>
                Jawa Timur, 65152<br>
                Phone: (+62)82222222222 | Fax: (+62)81111111111
              </div>

              <div class="invoice-meta">
                <h2 class="title">INVOICE</h2>
                <table>
                  <tr><td><strong>Invoice No</strong></td><td>: ${invoice.invoiceNumber}</td></tr>
                  <tr><td><strong>Invoice Date</strong></td><td>: ${invoice.issuedDate}</td></tr>
                  <tr><td><strong>Due Date</strong></td><td>: ${invoice.dueDate}</td></tr>
                  <tr><td><strong>Status</strong></td><td>: ${invoice.status}</td></tr>
                  <tr><td><strong>Currency</strong></td><td>: IDR</td></tr>
                </table>
              </div>
            </div>

            <div class="client-info">
              <strong>Client:</strong> ${client?.name || '-'}<br>
              <strong>Phone:</strong> ${client?.phone || '-'}<br>
              <strong>Email:</strong> ${client?.email || '-'}
            </div>

            <table class="invoice-table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Description</th>
                  <th>Qty</th>
                  <th>Unit Price</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                ${invoice.items.map((item, i) => `
                  <tr>
                    <td>${i + 1}</td>
                    <td>${item.name}</td>
                    <td>${item.qty}</td>
                    <td>${formatCurrency(item.price)}</td>
                    <td>${formatCurrency(item.qty * item.price)}</td>
                  </tr>
                `).join('')}
              </tbody>
              <tfoot>
                <tr>
                  <td colspan="4"><strong>Total</strong></td>
                  <td><strong>${formatCurrency(total)}</strong></td>
                </tr>
              </tfoot>
            </table>

            <p><strong>In Words:</strong> ${terbilang} Rupiah</p>
            <p><strong>Remark:</strong> ${invoice.notes || '-'}</p>

            <div class="transfer-info">
              <strong>TRANSFER VIA:</strong><br>
              BCA - IDR<br>
              A/C: 67865688<br>
              A/N: INVOICE HUB
            </div>

            <div class="signature">
              <p>Sincerely,</p>
              <br><br><br>
              <strong>Walantaga</strong>
            </div>

            <p class="footer">PEMBAYARAN DENGAN CHEQUE DIANGGAP LUNAS APABILA SUDAH DAPAT DICAIRKAN</p>
          </div>
        </div>
      </div>    
  `;

  // Export to PDF
  setTimeout(() => {
    const exportBtn = div.querySelector('#export-pdf');
    exportBtn?.addEventListener('click', () => {
      const element = document.getElementById('invoice-content');
      const opt = {
        margin: [0.5, 0.5, 0.5, 0.5], // top, left, bottom, right in inches
        filename: `${invoice.invoiceNumber}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, scrollY: 0 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
      };
      window.html2pdf().set(opt).from(element).save();
    });
  }, 0);

  return div;
}

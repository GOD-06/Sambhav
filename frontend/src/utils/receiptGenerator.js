/**
 * Utility to generate and trigger a clean, printable/downloadable PDF-ready receipt.
 */
export function downloadReceipt(paymentData) {
  const receiptNumber = paymentData.receipt_number || `RCP-${String(paymentData.id || Date.now()).padStart(6, '0')}`;
  const paymentDate = paymentData.payment_date || new Date().toISOString().split('T')[0];
  const customerName = paymentData.customer_name || paymentData.customer_email || 'Valued Customer';
  const customerEmail = paymentData.customer_email || '';
  const invoiceNumber = paymentData.invoice_number || 'Direct Order';
  const planName = paymentData.plan_name || 'Software Subscription License';
  const amount = Number(paymentData.amount || 0).toFixed(2);
  const paymentMethod = (paymentData.payment_method_display || paymentData.payment_method || 'Credit Card').replace('_', ' ').toUpperCase();

  const printWindow = window.open('', '_blank', 'width=800,height=900');
  if (!printWindow) {
    alert('Please allow popups to download or print your payment receipt.');
    return;
  }

  const receiptHtml = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Receipt ${receiptNumber} - Subscription Management System</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif;
      color: #111827;
      background: #ffffff;
      margin: 0;
      padding: 40px;
    }
    .receipt-box {
      max-width: 680px;
      margin: auto;
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      padding: 36px;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
    }
    .header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      border-bottom: 2px solid #111827;
      padding-bottom: 24px;
      margin-bottom: 28px;
    }
    .brand-title {
      font-size: 20px;
      font-weight: 800;
      letter-spacing: -0.02em;
      color: #111827;
      margin: 0 0 4px 0;
    }
    .brand-sub {
      font-size: 12px;
      color: #6b7280;
      margin: 0;
    }
    .receipt-badge {
      text-align: right;
    }
    .receipt-title {
      font-size: 14px;
      font-weight: 700;
      color: #059669;
      text-transform: uppercase;
      letter-spacing: 0.08em;
      margin: 0 0 4px 0;
    }
    .receipt-num {
      font-family: monospace;
      font-size: 14px;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    .meta-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 20px;
      margin-bottom: 28px;
      font-size: 13px;
    }
    .meta-col p {
      margin: 3px 0;
    }
    .label {
      color: #6b7280;
      font-size: 11px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      font-weight: 600;
    }
    .value {
      font-weight: 600;
      color: #111827;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin-bottom: 28px;
    }
    th {
      background: #f9fafb;
      color: #4b5563;
      font-size: 11px;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.05em;
      padding: 10px 12px;
      border-bottom: 1px solid #e5e7eb;
      text-align: left;
    }
    td {
      padding: 12px;
      border-bottom: 1px solid #f3f4f6;
      font-size: 13px;
      color: #374151;
    }
    .text-right {
      text-align: right;
    }
    .totals-block {
      margin-left: auto;
      max-width: 260px;
      margin-bottom: 28px;
    }
    .totals-row {
      display: flex;
      justify-content: space-between;
      padding: 6px 0;
      font-size: 13px;
    }
    .totals-row.grand-total {
      border-top: 2px solid #111827;
      font-size: 16px;
      font-weight: 800;
      color: #111827;
      padding-top: 10px;
      margin-top: 6px;
    }
    .paid-stamp {
      display: inline-block;
      padding: 6px 14px;
      border: 2px solid #059669;
      color: #059669;
      font-weight: 800;
      font-size: 13px;
      letter-spacing: 0.1em;
      text-transform: uppercase;
      border-radius: 6px;
      transform: rotate(-3deg);
    }
    .footer {
      border-top: 1px solid #e5e7eb;
      padding-top: 20px;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
      color: #9ca3af;
    }
    .no-print {
      margin-top: 24px;
      text-align: center;
    }
    .btn-print {
      background: #111827;
      color: #ffffff;
      border: none;
      padding: 10px 24px;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
    }
    @media print {
      .no-print {
        display: none;
      }
      body {
        padding: 0;
      }
      .receipt-box {
        border: none;
        box-shadow: none;
        padding: 0;
      }
    }
  </style>
</head>
<body>
  <div class="receipt-box">
    <div class="header">
      <div>
        <h1 class="brand-title">Subscription Management System</h1>
        <p class="brand-sub">Subscription Management System Inc. | billing@subscriptionmanagement.com</p>
      </div>
      <div class="receipt-badge">
        <p class="receipt-title">Payment Receipt</p>
        <p class="receipt-num">${receiptNumber}</p>
      </div>
    </div>

    <div class="meta-grid">
      <div class="meta-col">
        <p class="label">Billed To</p>
        <p class="value">${customerName}</p>
        ${customerEmail ? `<p style="color: #4b5563;">${customerEmail}</p>` : ''}
      </div>
      <div class="meta-col" style="text-align: right;">
        <p class="label">Payment Date</p>
        <p class="value">${paymentDate}</p>
        <p class="label" style="margin-top: 8px;">Payment Method</p>
        <p class="value">${paymentMethod}</p>
      </div>
    </div>

    <table>
      <thead>
        <tr>
          <th>Description</th>
          <th>Reference</th>
          <th class="text-right">Amount</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>
            <strong>${planName}</strong>
            <div style="font-size: 11px; color: #6b7280;">Recurring License & Access Allocation</div>
          </td>
          <td>${invoiceNumber}</td>
          <td class="text-right" style="font-weight: 600;">$${amount}</td>
        </tr>
      </tbody>
    </table>

    <div class="totals-block">
      <div class="totals-row">
        <span style="color: #6b7280;">Subtotal:</span>
        <span style="font-weight: 600;">$${amount}</span>
      </div>
      <div class="totals-row">
        <span style="color: #6b7280;">Tax:</span>
        <span style="font-weight: 600;">$0.00</span>
      </div>
      <div class="totals-row grand-total">
        <span>Amount Paid:</span>
        <span>$${amount}</span>
      </div>
    </div>

    <div style="margin-bottom: 24px;">
      <span class="paid-stamp">Payment Confirmed</span>
    </div>

    <div class="footer">
      <span>Thank you for your business.</span>
      <span>Official Digital Transaction Record</span>
    </div>

    <div class="no-print">
      <button class="btn-print" onclick="window.print()">Print or Save as PDF</button>
    </div>
  </div>
</body>
</html>
  `;

  printWindow.document.write(receiptHtml);
  printWindow.document.close();
}


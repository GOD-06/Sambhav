import { useState, useEffect } from 'react';
import invoiceService from '../services/invoiceService';
import paymentService from '../services/paymentService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { downloadReceipt } from '../utils/receiptGenerator';
import { Printer, Eye, CreditCard, Download } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [payModalOpen, setPayModalOpen] = useState(false);
  const [submittingPayment, setSubmittingPayment] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('credit_card');

  const loadInvoices = () => {
    setLoading(true);
    invoiceService
      .getAll()
      .then((data) => setInvoices(data.results || data))
      .catch(() => toast.error('Failed to load invoices.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadInvoices();
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const handleOpenPayModal = (inv) => {
    setSelectedInvoice(inv);
    setPaymentAmount(inv.outstanding_amount || inv.total);
    setPayModalOpen(true);
  };

  const handleProcessInvoicePayment = async (e) => {
    e.preventDefault();
    if (!selectedInvoice) return;
    setSubmittingPayment(true);
    try {
      const res = await paymentService.create({
        invoice: selectedInvoice.id,
        amount: paymentAmount,
        payment_method: paymentMethod,
        payment_date: new Date().toISOString().split('T')[0],
        note: `Online payment for ${selectedInvoice.invoice_number}`,
      });
      toast.success('Invoice paid successfully.');
      setPayModalOpen(false);
      loadInvoices();

      // Offer immediate receipt download
      downloadReceipt({
        ...res,
        invoice_number: selectedInvoice.invoice_number,
        customer_name: selectedInvoice.customer_name || selectedInvoice.customer_email,
        customer_email: selectedInvoice.customer_email,
        amount: paymentAmount,
        payment_method: paymentMethod,
      });
    } catch (err) {
      toast.error('Payment processing failed.');
    } finally {
      setSubmittingPayment(false);
    }
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-mono font-medium text-[#A9B2FF]">{inv.invoice_number}</span>,
    },
    {
      header: 'Issue Date',
      accessor: (inv) => <span className="text-xs text-white/60 font-mono">{inv.issue_date}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-[#FFB37A] font-mono">{inv.due_date}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-mono font-medium text-white">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Balance Due',
      accessor: (inv) => (
        <span className={`text-xs font-mono font-medium ${Number(inv.outstanding_amount) > 0 ? 'text-[#FFB37A]' : 'text-emerald-400'}`}>
          ${Number(inv.outstanding_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Actions',
      accessor: (inv) => (
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setSelectedInvoice(inv)}
            className="p-1.5 text-white/60 hover:text-white hover:bg-white/[0.08] rounded-md text-xs flex items-center gap-1 transition cursor-pointer"
            title="View Invoice"
          >
            <Eye className="w-3.5 h-3.5" /> View
          </button>

          {inv.status !== 'paid' && inv.status !== 'cancelled' && (
            <button
              onClick={() => handleOpenPayModal(inv)}
              className="px-2.5 py-1 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-md text-xs flex items-center gap-1 transition cursor-pointer shadow-sm"
            >
              <CreditCard className="w-3.5 h-3.5" /> Pay Now
            </button>
          )}

          {inv.status === 'paid' && (
            <button
              onClick={() =>
                downloadReceipt({
                  invoice_number: inv.invoice_number,
                  customer_name: inv.customer_name || inv.customer_email,
                  customer_email: inv.customer_email,
                  amount: inv.total,
                  payment_date: inv.issue_date,
                  payment_method: 'online',
                })
              }
              className="px-2.5 py-1 bg-white/[0.06] hover:bg-white/[0.12] text-[#E8FF1F] border border-white/[0.12] rounded-md text-xs font-mono flex items-center gap-1 transition cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" /> Receipt
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Invoices"
        description="Billing statements, settlement status, and downloadable receipts"
      />

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={invoices} emptyMessage="No invoices found." />
        )}
      </div>

      {/* Invoice Details Modal */}
      {selectedInvoice && !payModalOpen && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b border-white/[0.08] pb-3">
              <div>
                <h3 className="text-sm font-bold text-white">Subscription Management System Inc.</h3>
                <p className="text-xs text-white/50">billing@subscriptionmanagement.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-mono font-bold text-[#A9B2FF] block">{selectedInvoice.invoice_number}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-white/[0.02] p-3 rounded-xl border border-white/[0.08] font-mono">
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider font-sans">Issue Date</span>
                <span className="text-white/80">{selectedInvoice.issue_date}</span>
              </div>
              <div>
                <span className="text-white/40 block text-[11px] uppercase tracking-wider font-sans">Due Date</span>
                <span className="text-[#FFB37A]">{selectedInvoice.due_date}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-white/70 mb-2 uppercase tracking-wider">Items:</h4>
              <div className="border border-white/[0.08] rounded-xl divide-y divide-white/[0.04] text-xs">
                {selectedInvoice.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-white">{line.description || line.product_name}</p>
                      <p className="text-white/40 text-[11px] font-mono">Qty: {line.quantity} * ${line.unit_price}</p>
                    </div>
                    <span className="font-mono font-semibold text-white">${Number(line.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-white/[0.08] pt-3 font-mono">
              <div className="flex justify-between text-white/60">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-white/60">
                <span>Tax:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-white text-sm border-t border-white/[0.08] pt-2">
                <span>Total:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-400 font-semibold">
                <span>Paid:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-[#FFB37A] font-bold border-t border-white/[0.08] pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handlePrint}
                className="flex-1 py-2 bg-white/[0.06] hover:bg-white/[0.1] text-white border border-white/[0.12] rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" /> Print Invoice
              </button>

              {selectedInvoice.status !== 'paid' && selectedInvoice.status !== 'cancelled' ? (
                <button
                  onClick={() => setPayModalOpen(true)}
                  className="flex-1 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer shadow-sm"
                >
                  <CreditCard className="w-3.5 h-3.5" /> Pay Balance
                </button>
              ) : (
                <button
                  onClick={() =>
                    downloadReceipt({
                      invoice_number: selectedInvoice.invoice_number,
                      customer_name: selectedInvoice.customer_name || selectedInvoice.customer_email,
                      customer_email: selectedInvoice.customer_email,
                      amount: selectedInvoice.total,
                      payment_date: selectedInvoice.issue_date,
                      payment_method: 'online',
                    })
                  }
                  className="flex-1 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" /> Download Receipt
                </button>
              )}
            </div>
          </div>
        </Modal>
      )}

      {/* Pay Invoice Modal */}
      {payModalOpen && selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setPayModalOpen(false)}
          title={`Pay Invoice: ${selectedInvoice.invoice_number}`}
        >
          <form onSubmit={handleProcessInvoicePayment} className="space-y-4">
            <div className="bg-white/[0.02] border border-white/[0.08] p-3 rounded-xl flex justify-between items-center">
              <div>
                <span className="text-[11px] text-white/50 block font-mono">Invoice Total</span>
                <span className="text-sm font-semibold text-white">${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="text-right">
                <span className="text-[11px] text-[#FFB37A] block font-mono">Balance Due</span>
                <span className="text-base font-mono font-bold text-[#E8FF1F]">
                  ${Number(selectedInvoice.outstanding_amount || selectedInvoice.total).toFixed(2)}
                </span>
              </div>
            </div>

            <FormField label="Payment Amount ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white font-mono outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Payment Method" required>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              >
                <option value="credit_card">Credit Card (Simulated Instant)</option>
                <option value="bank_transfer">Bank Wire Transfer</option>
                <option value="cash">Instant Net Banking</option>
              </select>
            </FormField>

            <div className="flex justify-end gap-2 pt-3 border-t border-white/[0.08]">
              <button
                type="button"
                onClick={() => setPayModalOpen(false)}
                className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submittingPayment}
                className="px-4 py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black font-semibold rounded-lg text-xs disabled:opacity-50 transition cursor-pointer shadow-sm"
              >
                {submittingPayment ? 'Settling...' : `Confirm Payment of $${Number(paymentAmount).toFixed(2)}`}
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}

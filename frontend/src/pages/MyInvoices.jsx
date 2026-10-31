import { useState, useEffect } from 'react';
import invoiceService from '../services/invoiceService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { Printer, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    invoiceService
      .getAll()
      .then((data) => setInvoices(data.results || data))
      .catch(() => toast.error('Failed to load invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-blue-700">{inv.invoice_number}</span>,
    },
    {
      header: 'Issue Date',
      accessor: (inv) => <span className="text-xs text-slate-600">{inv.issue_date}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => <span className="text-xs text-slate-700 font-medium">{inv.due_date}</span>,
    },
    {
      header: 'Total',
      accessor: (inv) => <span className="font-semibold text-slate-900">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Balance Due',
      accessor: (inv) => (
        <span className={`text-xs font-semibold ${Number(inv.outstanding_amount) > 0 ? 'text-amber-700' : 'text-emerald-700'}`}>
          ${Number(inv.outstanding_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (inv) => (
        <button
          onClick={() => setSelectedInvoice(inv)}
          className="p-1 text-blue-700 hover:bg-blue-50 rounded text-xs flex items-center gap-1 font-medium"
        >
          <Eye className="w-3.5 h-3.5" /> View
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="My Invoices"
        description="Billing statements and balances"
      />

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={invoices} emptyMessage="No invoices found." />
        )}
      </div>

      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
        >
          <div className="space-y-3">
            <div className="flex justify-between items-start border-b border-slate-200 pb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Brightloop Software Inc.</h3>
                <p className="text-xs text-slate-500">billing@brightloop.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-700 block">{selectedInvoice.invoice_number}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50 p-2.5 rounded border border-slate-200">
              <div>
                <span className="text-slate-400 block text-[11px]">Issue Date</span>
                <span className="font-semibold text-slate-800">{selectedInvoice.issue_date}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Due Date</span>
                <span className="font-semibold text-rose-700">{selectedInvoice.due_date}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-slate-700 mb-1.5">Items:</h4>
              <div className="border border-slate-200 rounded divide-y text-xs">
                {selectedInvoice.lines?.map((line) => (
                  <div key={line.id} className="p-2 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-slate-800">{line.description || line.product_name}</p>
                      <p className="text-slate-400 text-[11px]">Qty: {line.quantity} × ${line.unit_price}</p>
                    </div>
                    <span className="font-semibold text-slate-900">${Number(line.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t border-slate-200 pt-2">
              <div className="flex justify-between text-slate-600">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Tax:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 text-sm border-t border-slate-100 pt-1">
                <span>Total:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-emerald-700 font-semibold">
                <span>Paid:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-700 font-bold border-t border-slate-100 pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Invoice
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

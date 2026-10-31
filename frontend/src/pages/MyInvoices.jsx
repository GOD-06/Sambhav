import { useState, useEffect } from 'react';
import invoiceService from '../services/invoiceService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import StatusBadge from '../components/StatusBadge';
import Modal from '../components/Modal';
import LoadingSpinner from '../components/LoadingSpinner';
import { FileText, Printer, Eye, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MyInvoices() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedInvoice, setSelectedInvoice] = useState(null);

  useEffect(() => {
    invoiceService
      .getAll()
      .then((data) => setInvoices(data.results || data))
      .catch(() => toast.error('Failed to load your invoices.'))
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = () => {
    window.print();
  };

  const columns = [
    {
      header: 'Invoice #',
      accessor: (inv) => <span className="font-semibold text-blue-600">{inv.invoice_number}</span>,
    },
    {
      header: 'Issue Date',
      accessor: (inv) => <span className="text-xs text-gray-600">{inv.issue_date}</span>,
    },
    {
      header: 'Due Date',
      accessor: (inv) => (
        <span className="text-xs text-gray-700 flex items-center gap-1 font-medium">
          <Calendar className="w-3.5 h-3.5 text-gray-400" />
          {inv.due_date}
        </span>
      ),
    },
    {
      header: 'Total Amount',
      accessor: (inv) => <span className="font-bold text-gray-900">${Number(inv.total).toFixed(2)}</span>,
    },
    {
      header: 'Status',
      accessor: (inv) => <StatusBadge status={inv.status} />,
    },
    {
      header: 'Balance Due',
      accessor: (inv) => (
        <span className={`text-xs font-semibold ${Number(inv.outstanding_amount) > 0 ? 'text-amber-600' : 'text-green-600'}`}>
          ${Number(inv.outstanding_amount || 0).toFixed(2)}
        </span>
      ),
    },
    {
      header: 'Details',
      accessor: (inv) => (
        <button
          onClick={() => setSelectedInvoice(inv)}
          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs flex items-center gap-1 font-medium"
        >
          <Eye className="w-3.5 h-3.5" /> View / Print
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="My Invoices"
        description="Access and download billing statements, review payment history and outstanding balances"
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={invoices} emptyMessage="No invoices found on your account." />
        )}
      </div>

      {selectedInvoice && (
        <Modal
          isOpen={true}
          onClose={() => setSelectedInvoice(null)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
        >
          <div className="space-y-4">
            <div className="flex justify-between items-start border-b pb-4">
              <div>
                <h3 className="text-base font-bold text-gray-900">Brightloop Software Inc.</h3>
                <p className="text-xs text-gray-500">billing@brightloop.com</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-bold text-blue-600 block">{selectedInvoice.invoice_number}</span>
                <StatusBadge status={selectedInvoice.status} />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs bg-gray-50 p-3 rounded-xl border border-gray-200">
              <div>
                <span className="text-gray-400 block">Issue Date:</span>
                <span className="font-semibold text-gray-800">{selectedInvoice.issue_date}</span>
              </div>
              <div>
                <span className="text-gray-400 block">Due Date:</span>
                <span className="font-semibold text-red-600">{selectedInvoice.due_date}</span>
              </div>
            </div>

            <div>
              <h4 className="text-xs font-semibold text-gray-700 mb-2">Itemized Products:</h4>
              <div className="border rounded-xl divide-y text-xs">
                {selectedInvoice.lines?.map((line) => (
                  <div key={line.id} className="p-2.5 flex justify-between items-center">
                    <div>
                      <p className="font-medium text-gray-800">{line.description || line.product_name}</p>
                      <p className="text-gray-400 text-[11px]">
                        Qty: {line.quantity} × ${line.unit_price}
                      </p>
                    </div>
                    <span className="font-semibold text-gray-900">${Number(line.line_total).toFixed(2)}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="text-right space-y-1 text-xs border-t pt-3">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal:</span>
                <span>${Number(selectedInvoice.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Taxes:</span>
                <span>${Number(selectedInvoice.tax_total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between font-bold text-gray-900 text-sm border-t pt-1">
                <span>Total:</span>
                <span>${Number(selectedInvoice.total).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-green-700 font-semibold">
                <span>Amount Paid:</span>
                <span>${Number(selectedInvoice.paid_amount || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-red-600 font-bold border-t pt-1">
                <span>Balance Due:</span>
                <span>${Number(selectedInvoice.outstanding_amount || 0).toFixed(2)}</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5"
            >
              <Printer className="w-3.5 h-3.5" /> Print Invoice Copy
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}

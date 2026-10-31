const statusConfig = {
  // General
  active: { bg: 'bg-green-100', text: 'text-green-800', label: 'Active' },
  inactive: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Inactive' },
  
  // Subscription statuses
  draft: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'Draft' },
  pending: { bg: 'bg-yellow-100', text: 'text-yellow-800', label: 'Pending' },
  paused: { bg: 'bg-orange-100', text: 'text-orange-800', label: 'Paused' },
  closed: { bg: 'bg-red-100', text: 'text-red-800', label: 'Closed' },
  cancelled: { bg: 'bg-red-100', text: 'text-red-800', label: 'Cancelled' },
  expired: { bg: 'bg-gray-100', text: 'text-gray-600', label: 'Expired' },
  
  // Invoice statuses
  confirmed: { bg: 'bg-blue-100', text: 'text-blue-800', label: 'Confirmed' },
  sent: { bg: 'bg-indigo-100', text: 'text-indigo-800', label: 'Sent' },
  paid: { bg: 'bg-green-100', text: 'text-green-800', label: 'Paid' },
  partially_paid: { bg: 'bg-teal-100', text: 'text-teal-800', label: 'Partially Paid' },
  overdue: { bg: 'bg-red-100', text: 'text-red-800', label: 'Overdue' },
  
  // Quotation statuses
  accepted: { bg: 'bg-green-100', text: 'text-green-800', label: 'Accepted' },
  rejected: { bg: 'bg-red-100', text: 'text-red-800', label: 'Rejected' },
  
  // Boolean
  true: { bg: 'bg-green-100', text: 'text-green-800', label: 'Yes' },
  false: { bg: 'bg-gray-100', text: 'text-gray-800', label: 'No' },
};

export default function StatusBadge({ status, className = '' }) {
  const key = String(status).toLowerCase().replace(/ /g, '_');
  const config = statusConfig[key] || { bg: 'bg-gray-100', text: 'text-gray-800', label: status };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.bg} ${config.text} ${className}`}>
      {config.label}
    </span>
  );
}

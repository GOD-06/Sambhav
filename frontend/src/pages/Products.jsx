import { useState, useEffect } from 'react';
import productService from '../services/productService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Package, Plus, Layers, Edit, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const { role } = useAuth();
  const isAdmin = role === 'admin';

  const [productForm, setProductForm] = useState({
    name: '',
    product_type: 'Software',
    sales_price: '',
    cost_price: '',
    notes: '',
  });

  const [variantForm, setVariantForm] = useState({
    name: '',
    price_adjustment: '0.00',
  });

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productService.getAll();
      setProducts(data.results || data);
    } catch (err) {
      toast.error('Failed to load products.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleCreateProduct = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await productService.create(productForm);
      toast.success('Product created successfully.');
      setIsProductModalOpen(false);
      setProductForm({ name: '', product_type: 'Software', sales_price: '', cost_price: '', notes: '' });
      loadProducts();
    } catch (err) {
      toast.error('Error creating product.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleCreateVariant = async (e) => {
    e.preventDefault();
    if (!selectedProduct) return;
    setSubmitting(true);
    try {
      await productService.createVariant({
        product: selectedProduct.id,
        name: variantForm.name,
        price_adjustment: variantForm.price_adjustment,
      });
      toast.success('Variant added successfully.');
      setVariantForm({ name: '', price_adjustment: '0.00' });
      // reload product details
      const updated = await productService.getById(selectedProduct.id);
      setSelectedProduct(updated);
      loadProducts();
    } catch (err) {
      toast.error('Error adding variant.');
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      header: 'Product Name',
      accessor: (p) => (
        <div>
          <div className="font-semibold text-gray-900">{p.name}</div>
          {p.notes && <div className="text-xs text-gray-500 line-clamp-1">{p.notes}</div>}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (p) => (
        <span className="px-2.5 py-1 text-xs rounded-full bg-blue-50 text-blue-700 font-medium">
          {p.product_type}
        </span>
      ),
    },
    {
      header: 'Sales Price',
      accessor: (p) => <span className="font-semibold text-gray-900">${Number(p.sales_price).toFixed(2)}</span>,
    },
    {
      header: 'Cost Price',
      accessor: (p) => <span className="text-gray-500 text-xs">${Number(p.cost_price).toFixed(2)}</span>,
    },
    {
      header: 'Variants',
      accessor: (p) => (
        <button
          onClick={() => {
            setSelectedProduct(p);
            setIsVariantModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-800 bg-blue-50/80 px-2.5 py-1 rounded-lg"
        >
          <Layers className="w-3.5 h-3.5" />
          {p.variants?.length || 0} Variants
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Products & Catalogs"
        description="Configure software packages, add-ons, and priced variant combinations"
        action={
          isAdmin
            ? {
                label: 'New Product',
                icon: Plus,
                onClick: () => setIsProductModalOpen(true),
              }
            : null
        }
      />

      <div className="bg-white rounded-2xl border border-gray-200/80 shadow-sm p-4">
        {loading ? (
          <div className="py-20 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={products} emptyMessage="No products configured yet." />
        )}
      </div>

      {/* Add Product Modal */}
      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Add New Product">
        <form onSubmit={handleCreateProduct} className="space-y-4">
          <FormField label="Product Name" required>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              placeholder="e.g. Brightloop ERP"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <FormField label="Product Type" required>
            <select
              value={productForm.product_type}
              onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="Software">Software Application</option>
              <option value="Add-on">Add-on Module</option>
              <option value="Service">Consulting / Support</option>
            </select>
          </FormField>

          <div className="grid grid-cols-2 gap-3">
            <FormField label="Sales Price ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.sales_price}
                onChange={(e) => setProductForm({ ...productForm, sales_price: e.target.value })}
                placeholder="499.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>

            <FormField label="Cost Price ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.cost_price}
                onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                placeholder="100.00"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
              />
            </FormField>
          </div>

          <FormField label="Notes / Description">
            <textarea
              rows={3}
              value={productForm.notes}
              onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
              placeholder="Features, licensing details, deployment instructions..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-blue-600"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create Product'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Manage Variants Modal */}
      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={`Variants for ${selectedProduct?.name || 'Product'}`}
      >
        <div className="space-y-4">
          <div className="border rounded-xl p-3 bg-gray-50">
            <h4 className="text-xs font-semibold text-gray-700 mb-2">Existing Variants:</h4>
            {selectedProduct?.variants?.length === 0 ? (
              <p className="text-xs text-gray-400">No variants created yet.</p>
            ) : (
              <div className="space-y-2">
                {selectedProduct?.variants?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-white p-2.5 rounded-lg border border-gray-200 text-xs">
                    <div>
                      <span className="font-medium text-gray-900">{v.name}</span>
                      <span className="text-gray-400 ml-2">
                        Adjustment: {Number(v.price_adjustment) >= 0 ? `+$${v.price_adjustment}` : `-$${Math.abs(v.price_adjustment)}`}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-600">
                      ${(Number(selectedProduct.sales_price) + Number(v.price_adjustment)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <form onSubmit={handleCreateVariant} className="border-t pt-4 space-y-3">
              <h4 className="text-xs font-semibold text-gray-700">Add New Variant:</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Variant Name" required>
                  <input
                    type="text"
                    required
                    value={variantForm.name}
                    onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                    placeholder="e.g. Odoo Brand Edition"
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </FormField>
                <FormField label="Price Adjustment ($)" required help="e.g. +560.00">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm({ ...variantForm, price_adjustment: e.target.value })}
                    className="w-full px-3 py-1.5 border border-gray-300 rounded-lg text-xs outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-medium"
              >
                {submitting ? 'Adding...' : 'Add Variant'}
              </button>
            </form>
          )}
        </div>
      </Modal>
    </div>
  );
}

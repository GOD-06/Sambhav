import { useState, useEffect } from 'react';
import productService from '../services/productService';
import PageHeader from '../components/PageHeader';
import DataTable from '../components/DataTable';
import Modal from '../components/Modal';
import FormField from '../components/FormField';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../context/AuthContext';
import { Plus, Layers } from 'lucide-react';
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
      toast.success('Product created.');
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
      toast.success('Variant added.');
      setVariantForm({ name: '', price_adjustment: '0.00' });
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
          <div className="font-semibold text-slate-900">{p.name}</div>
          {p.notes && <div className="text-xs text-slate-500 line-clamp-1">{p.notes}</div>}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (p) => (
        <span className="px-2 py-0.5 text-xs rounded bg-slate-100 text-slate-700 font-medium">
          {p.product_type}
        </span>
      ),
    },
    {
      header: 'Sales Price',
      accessor: (p) => <span className="font-semibold text-slate-900">${Number(p.sales_price).toFixed(2)}</span>,
    },
    {
      header: 'Cost Price',
      accessor: (p) => <span className="text-slate-500 text-xs">${Number(p.cost_price).toFixed(2)}</span>,
    },
    {
      header: 'Variants',
      accessor: (p) => (
        <button
          onClick={() => {
            setSelectedProduct(p);
            setIsVariantModalOpen(true);
          }}
          className="inline-flex items-center gap-1 text-xs font-medium text-blue-700 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded border border-blue-200"
        >
          <Layers className="w-3.5 h-3.5" />
          {p.variants?.length || 0} Variants
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <PageHeader
        title="Products"
        description="Software products and variant pricing rules"
        action={
          isAdmin
            ? {
                label: 'Add Product',
                icon: Plus,
                onClick: () => setIsProductModalOpen(true),
              }
            : null
        }
      />

      <div className="bg-white rounded-lg border border-slate-200 p-4 shadow-sm">
        {loading ? (
          <div className="py-12 flex justify-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : (
          <DataTable columns={columns} data={products} emptyMessage="No products configured." />
        )}
      </div>

      <Modal isOpen={isProductModalOpen} onClose={() => setIsProductModalOpen(false)} title="Add Product">
        <form onSubmit={handleCreateProduct} className="space-y-3">
          <FormField label="Product Name" required>
            <input
              type="text"
              required
              value={productForm.name}
              onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <FormField label="Product Type" required>
            <select
              value={productForm.product_type}
              onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            >
              <option value="Software">Software</option>
              <option value="Add-on">Add-on</option>
              <option value="Service">Service</option>
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
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>

            <FormField label="Cost Price ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.cost_price}
                onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              rows={2}
              value={productForm.notes}
              onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
              className="w-full px-2.5 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-3 py-1.5 border border-slate-300 rounded text-xs text-slate-700 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3 py-1.5 bg-blue-700 text-white rounded text-xs font-medium hover:bg-blue-800 disabled:opacity-50"
            >
              {submitting ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </Modal>

      <Modal
        isOpen={isVariantModalOpen}
        onClose={() => setIsVariantModalOpen(false)}
        title={`Variants: ${selectedProduct?.name || ''}`}
      >
        <div className="space-y-3">
          <div className="border border-slate-200 rounded p-3 bg-slate-50">
            <h4 className="text-xs font-semibold text-slate-700 mb-2">Configured Variants:</h4>
            {selectedProduct?.variants?.length === 0 ? (
              <p className="text-xs text-slate-400">No variants created.</p>
            ) : (
              <div className="space-y-1.5">
                {selectedProduct?.variants?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-white p-2 rounded border border-slate-200 text-xs">
                    <div>
                      <span className="font-medium text-slate-900">{v.name}</span>
                      <span className="text-slate-400 ml-2">
                        Adjustment: {Number(v.price_adjustment) >= 0 ? `+$${v.price_adjustment}` : `-$${Math.abs(v.price_adjustment)}`}
                      </span>
                    </div>
                    <span className="font-semibold text-blue-700">
                      ${(Number(selectedProduct.sales_price) + Number(v.price_adjustment)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <form onSubmit={handleCreateVariant} className="border-t border-slate-200 pt-3 space-y-2">
              <h4 className="text-xs font-semibold text-slate-700">Add Variant:</h4>
              <div className="grid grid-cols-2 gap-2">
                <FormField label="Variant Name" required>
                  <input
                    type="text"
                    required
                    value={variantForm.name}
                    onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
                  />
                </FormField>
                <FormField label="Price Adjustment ($)" required help="e.g. 560.00">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm({ ...variantForm, price_adjustment: e.target.value })}
                    className="w-full px-2 py-1.5 border border-slate-300 rounded text-xs outline-none focus:border-blue-700"
                  />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded text-xs font-medium"
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

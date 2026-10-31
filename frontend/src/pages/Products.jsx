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
          <div className="font-semibold text-white">{p.name}</div>
          {p.notes && <div className="text-xs text-white/50 line-clamp-1">{p.notes}</div>}
        </div>
      ),
    },
    {
      header: 'Type',
      accessor: (p) => (
        <span className="px-2 py-0.5 text-xs rounded-md bg-white/[0.06] border border-white/[0.1] text-white/80 font-mono">
          {p.product_type}
        </span>
      ),
    },
    {
      header: 'Sales Price',
      accessor: (p) => <span className="font-mono font-medium text-white">${Number(p.sales_price).toFixed(2)}</span>,
    },
    {
      header: 'Cost Price',
      accessor: (p) => <span className="font-mono text-white/50 text-xs">${Number(p.cost_price).toFixed(2)}</span>,
    },
    {
      header: 'Variants',
      accessor: (p) => (
        <button
          onClick={() => {
            setSelectedProduct(p);
            setIsVariantModalOpen(true);
          }}
          className="inline-flex items-center gap-1.5 text-xs font-mono font-medium text-[#E8FF1F] bg-[#E8FF1F]/10 px-2.5 py-1 rounded-lg border border-[#E8FF1F]/20 hover:bg-[#E8FF1F]/20 transition cursor-pointer"
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

      <div className="bg-white/[0.03] rounded-2xl border border-white/[0.08] p-5">
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
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <FormField label="Product Type" required>
            <select
              value={productForm.product_type}
              onChange={(e) => setProductForm({ ...productForm, product_type: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
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
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>

            <FormField label="Cost Price ($)" required>
              <input
                type="number"
                step="0.01"
                required
                value={productForm.cost_price}
                onChange={(e) => setProductForm({ ...productForm, cost_price: e.target.value })}
                className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
              />
            </FormField>
          </div>

          <FormField label="Notes">
            <textarea
              rows={2}
              value={productForm.notes}
              onChange={(e) => setProductForm({ ...productForm, notes: e.target.value })}
              className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
            />
          </FormField>

          <div className="flex justify-end gap-2 pt-4 border-t border-white/[0.08]">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-3.5 py-1.5 border border-white/[0.12] bg-white/[0.06] rounded-lg text-xs text-white/70 hover:bg-white/[0.1] hover:text-white transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-3.5 py-1.5 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold disabled:opacity-50 transition cursor-pointer"
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
        <div className="space-y-4">
          <div className="border border-white/[0.08] rounded-xl p-3.5 bg-white/[0.02]">
            <h4 className="text-xs font-semibold text-white/70 mb-2">Configured Variants:</h4>
            {selectedProduct?.variants?.length === 0 ? (
              <p className="text-xs text-white/40">No variants created.</p>
            ) : (
              <div className="space-y-2">
                {selectedProduct?.variants?.map((v) => (
                  <div key={v.id} className="flex items-center justify-between bg-white/[0.04] p-2.5 rounded-lg border border-white/[0.08] text-xs">
                    <div>
                      <span className="font-medium text-white">{v.name}</span>
                      <span className="text-white/40 ml-2 font-mono">
                        Adjustment: {Number(v.price_adjustment) >= 0 ? `+$${v.price_adjustment}` : `-$${Math.abs(v.price_adjustment)}`}
                      </span>
                    </div>
                    <span className="font-semibold font-mono text-[#E8FF1F]">
                      ${(Number(selectedProduct.sales_price) + Number(v.price_adjustment)).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {isAdmin && (
            <form onSubmit={handleCreateVariant} className="border-t border-white/[0.08] pt-3.5 space-y-3">
              <h4 className="text-xs font-semibold text-white/70">Add Variant:</h4>
              <div className="grid grid-cols-2 gap-3">
                <FormField label="Variant Name" required>
                  <input
                    type="text"
                    required
                    value={variantForm.name}
                    onChange={(e) => setVariantForm({ ...variantForm, name: e.target.value })}
                    className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
                  />
                </FormField>
                <FormField label="Price Adjustment ($)" required help="e.g. 560.00">
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={variantForm.price_adjustment}
                    onChange={(e) => setVariantForm({ ...variantForm, price_adjustment: e.target.value })}
                    className="w-full px-3 py-2 border border-white/[0.12] bg-white/[0.05] rounded-lg text-xs text-white outline-none focus:border-[#E8FF1F]"
                  />
                </FormField>
              </div>
              <button
                type="submit"
                disabled={submitting}
                className="w-full py-2 bg-[#E8FF1F] hover:bg-[#d8ed17] text-black rounded-lg text-xs font-semibold cursor-pointer transition shadow-sm"
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

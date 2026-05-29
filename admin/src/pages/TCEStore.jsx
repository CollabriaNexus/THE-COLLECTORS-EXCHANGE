import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Plus, Loader2, X, ShieldCheck, Gem, Edit3, Eye } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTCEProducts, useCreateProduct } from '../hooks/api/useProducts';

const CATEGORIES = ['Timepieces', 'Collectibles', 'Antiques', 'Toys & Pop Culture', 'Jewelry'];
const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];

const TCEStore = () => {
    const { data, isLoading } = useTCEProducts();
    const createProduct = useCreateProduct();
    const [showForm, setShowForm] = useState(false);
    const [descPreview, setDescPreview] = useState(false);
    const descRef = useRef(null);
    const [form, setForm] = useState({
        title: '', category: CATEGORIES[0], description: '', condition: 'Excellent',
        price: '', image: '', keywords: '', brand: '',
    });

    const insertMarkdown = (before, after = '') => {
        const textarea = descRef.current;
        if (!textarea) return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const selected = textarea.value.substring(start, end);
        const newText = textarea.value.substring(0, start) + before + selected + after + textarea.value.substring(end);
        setForm({ ...form, description: newText });
        setTimeout(() => {
            textarea.focus();
            textarea.selectionStart = start + before.length;
            textarea.selectionEnd = start + before.length + selected.length;
        }, 0);
    };

    const toolbarItems = [
        { label: 'B', action: () => insertMarkdown('**', '**'), title: 'Bold' },
        { label: 'I', action: () => insertMarkdown('*', '*'), title: 'Italic' },
        { label: 'H', action: () => insertMarkdown('## ', ''), title: 'Heading' },
        { label: '•', action: () => insertMarkdown('- ', ''), title: 'Bullet List' },
        { label: '1.', action: () => insertMarkdown('1. ', ''), title: 'Numbered List' },
        { label: '🔗', action: () => insertMarkdown('[', '](url)'), title: 'Link' },
        { label: '❝', action: () => insertMarkdown('> ', ''), title: 'Quote' },
    ];

    const products = data?.products || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createProduct.mutateAsync({
                ...form,
                price: parseFloat(form.price),
                keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
            });
            setForm({ title: '', category: CATEGORIES[0], description: '', condition: 'Excellent', price: '', image: '', keywords: '', brand: '' });
            setShowForm(false);
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to create product');
        }
    };

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-serif font-bold text-heritage-charcoal flex items-center gap-3">
                        <Crown className="text-luxury-gold" size={28} /> TCE Store
                    </h2>
                    <p className="text-sm text-gray-500 mt-1">Products listed by The Collectors Exchange — auto-verified, auto-published</p>
                </div>
                <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-md hover:bg-luxury-gold/90 transition-colors font-medium text-sm">
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="bg-white border border-gray-200 p-6 mb-6 space-y-4">
                    <h3 className="text-lg font-serif font-semibold">New TCE Listing</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Title *</label>
                            <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Category *</label>
                            <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm bg-white">
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Price *</label>
                            <input required type="number" min="1" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Condition *</label>
                            <select required value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm bg-white">
                                {CONDITIONS.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Description *</label>
                            <div className="border border-gray-200 rounded">
                                <div className="flex items-center border-b border-gray-200">
                                    <button type="button" onClick={() => setDescPreview(false)} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-medium transition-colors ${!descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
                                        <Edit3 size={12} className="inline mr-1" />Write
                                    </button>
                                    <button type="button" onClick={() => setDescPreview(true)} className={`px-3 py-1.5 text-xs uppercase tracking-widest font-medium transition-colors ${descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
                                        <Eye size={12} className="inline mr-1" />Preview
                                    </button>
                                    {!descPreview && (
                                        <div className="flex items-center gap-0.5 ml-auto px-2 border-l border-gray-200">
                                            {toolbarItems.map(item => (
                                                <button key={item.label} type="button" onClick={item.action} title={item.title} className="w-6 h-6 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors font-bold">
                                                    {item.label}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>
                                {descPreview ? (
                                    <div className="p-3 min-h-[100px] prose prose-sm max-w-none text-sm">
                                        {form.description ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description}</ReactMarkdown> : <p className="text-gray-400 italic">Nothing to preview</p>}
                                    </div>
                                ) : (
                                    <textarea ref={descRef} required rows={4} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your item... Supports Markdown (use the toolbar above for formatting)" className="w-full p-3 border-0 focus:outline-none focus:ring-0 leading-relaxed resize-y text-sm rounded-b" />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Image URL</label>
                            <input value={form.image} onChange={e => setForm({...form, image: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Brand</label>
                            <input value={form.brand} onChange={e => setForm({...form, brand: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm" />
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1">Keywords (comma separated)</label>
                            <input value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} className="w-full p-3 border border-gray-200 rounded text-sm" />
                        </div>
                    </div>
                    <button type="submit" disabled={createProduct.isPending} className="flex items-center gap-2 px-6 py-3 bg-heritage-charcoal text-white rounded-md hover:bg-heritage-dark transition-colors text-sm font-medium">
                        {createProduct.isPending && <Loader2 size={16} className="animate-spin" />}
                        {createProduct.isPending ? 'Creating...' : 'Create Product'}
                    </button>
                </form>
            )}

            {isLoading ? (
                <div className="flex justify-center py-20"><Loader2 size={32} className="animate-spin text-luxury-gold" /></div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-white border border-gray-200">
                    <Crown size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 text-lg font-serif">No TCE Store products yet</p>
                    <p className="text-gray-400 text-sm mt-2">Click "Add Product" to create your first listing.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                    {products.map(product => (
                        <Link key={product.id} to={`/products/${product.id}`} className="bg-white border border-gray-200 hover:shadow-md transition-shadow group">
                            <div className="relative aspect-square bg-gray-50 overflow-hidden">
                                {product.image ? (
                                    <img src={product.image} alt={product.title} className="object-cover w-full h-full group-hover:scale-105 transition-transform" />
                                ) : (
                                    <div className="absolute inset-0 flex items-center justify-center text-gray-300"><Gem size={40} strokeWidth={1} /></div>
                                )}
                                <div className="absolute top-2 left-2 bg-green-600 text-white text-[10px] px-2 py-0.5 rounded flex items-center gap-1">
                                    <ShieldCheck size={10} /> Verified
                                </div>
                            </div>
                            <div className="p-3">
                                <span className="text-[10px] text-gray-500 uppercase tracking-wider">{product.category}</span>
                                <h3 className="font-serif text-sm font-medium text-heritage-charcoal line-clamp-1 mt-0.5">{product.title}</h3>
                                <p className="text-luxury-gold font-sans text-sm font-medium mt-1">₹{product.price?.toLocaleString()}</p>
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TCEStore;
import React, { useState, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Crown, Plus, Loader2, X, ShieldCheck, Gem, Edit3, Eye, Image as ImageIcon, Tag, Upload, Trash2, Info } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTCEProducts, useCreateProduct, useEditProduct } from '../hooks/api/useProducts';
import { uploadProductImage } from '../utils/storage';

const CATEGORIES = ['Timepieces', 'Collectibles', 'Antiques', 'Toys & Pop Culture', 'Jewelry'];
const CONDITIONS = ['Mint', 'Excellent', 'Good', 'Fair', 'Poor'];

const TCEStore = () => {
    const { data, isLoading } = useTCEProducts();
    const createProduct = useCreateProduct();
    const editProduct = useEditProduct();
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [descPreview, setDescPreview] = useState(false);
    const [imageUploading, setImageUploading] = useState(false);
    const descRef = useRef(null);
    const [form, setForm] = useState({
        title: '', category: CATEGORIES[0], description: '', condition: 'Excellent',
        price: '', imageUrls: [''], keywords: '',
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

    const handleImageUrlChange = (index, value) => {
        const newUrls = [...form.imageUrls];
        newUrls[index] = value;
        setForm({ ...form, imageUrls: newUrls });
    };

    const addImageField = () => {
        if (form.imageUrls.length < 10) {
            setForm({ ...form, imageUrls: [...form.imageUrls, ''] });
        }
    };

    const removeImageField = (index) => {
        const newUrls = form.imageUrls.filter((_, i) => i !== index);
        setForm({ ...form, imageUrls: newUrls });
    };

    const handleFileUpload = async (index, file) => {
        if (!file) return;
        setImageUploading(true);
        try {
            const url = await uploadProductImage(file);
            handleImageUrlChange(index, url);
        } catch (err) {
            console.error('Upload failed:', err);
            alert('Failed to upload image. Please try again or use a URL directly.');
        } finally {
            setImageUploading(false);
        }
    };

    const products = data?.products || [];

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validImages = form.imageUrls.filter(url => url.trim() !== '');
        if (validImages.length < 1) {
            alert('Please provide at least one image.');
            return;
        }
        const payload = {
            title: form.title,
            category: form.category,
            description: form.description,
            condition: form.condition,
            price: parseFloat(form.price),
            image: validImages[0],
            images: validImages,
            keywords: form.keywords.split(',').map(k => k.trim()).filter(Boolean),
        };
        try {
            if (editingId) {
                await editProduct.mutateAsync({ id: editingId, ...payload });
            } else {
                await createProduct.mutateAsync(payload);
            }
            setForm({ title: '', category: CATEGORIES[0], description: '', condition: 'Excellent', price: '', imageUrls: [''], keywords: '' });
            setDescPreview(false);
            setShowForm(false);
            setEditingId(null);
        } catch (err) {
            alert(err?.response?.data?.error || 'Failed to save product');
        }
    };

    const startEdit = (product) => {
        setForm({
            title: product.title,
            category: product.category,
            description: product.description,
            condition: product.condition,
            price: product.price?.toString() || '',
            imageUrls: product.images?.length ? [...product.images] : [product.image || ''],
            keywords: product.keywords?.join(', ') || '',
        });
        setEditingId(product.id);
        setDescPreview(false);
        setShowForm(true);
    };

    const cancelForm = () => {
        setShowForm(false);
        setEditingId(null);
        setForm({ title: '', category: CATEGORIES[0], description: '', condition: 'Excellent', price: '', imageUrls: [''], keywords: '' });
        setDescPreview(false);
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
                <button onClick={() => showForm ? cancelForm() : setShowForm(true)} className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-black rounded-md hover:bg-luxury-gold/90 transition-colors font-medium text-sm">
                    {showForm ? <X size={18} /> : <Plus size={18} />}
                    {showForm ? 'Cancel' : 'Add Product'}
                </button>
            </div>

            {showForm && (
                <div className="bg-white border border-gray-100 shadow-sm mb-6">
                    <div className="p-10">
                        <div className="mb-8 pb-8 border-b border-gray-100">
                            <h3 className="text-3xl font-serif mb-2 text-heritage-charcoal">{editingId ? 'Edit TCE Listing' : 'New TCE Listing'}</h3>
                            <p className="text-gray-500 font-light text-sm">
                                {editingId ? 'Update product details below.' : 'Products are auto-verified and auto-published upon creation.'}
                            </p>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-8">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="col-span-1 md:col-span-2">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Item Title <span className="text-luxury-gold">*</span>
                                    </label>
                                    <input type="text" required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder="e.g., 1950s Hans Wegner Papa Bear Chair" className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold font-serif text-lg" />
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Primary Category <span className="text-luxury-gold">*</span>
                                    </label>
                                    <select required value={form.category} onChange={e => setForm({...form, category: e.target.value})} className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold bg-white">
                                        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Listing Price (USD) <span className="text-luxury-gold">*</span>
                                    </label>
                                    <input type="number" required min="1" value={form.price} onChange={e => setForm({...form, price: e.target.value})} className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                                </div>
                            </div>

                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                    Provenance & Description <span className="text-luxury-gold">*</span>
                                </label>
                                <div className="border border-gray-200">
                                    <div className="flex items-center border-b border-gray-200">
                                        <button type="button" onClick={() => setDescPreview(false)} className={`px-4 py-2 text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${!descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
                                            <Edit3 size={12} /> Write
                                        </button>
                                        <button type="button" onClick={() => setDescPreview(true)} className={`px-4 py-2 text-xs uppercase tracking-widest font-medium flex items-center gap-1.5 transition-colors ${descPreview ? 'bg-luxury-gold text-black' : 'text-gray-500 hover:text-gray-800'}`}>
                                            <Eye size={12} /> Preview
                                        </button>
                                        {!descPreview && (
                                            <div className="flex items-center gap-0.5 ml-auto px-2 border-l border-gray-200">
                                                {toolbarItems.map(item => (
                                                    <button key={item.label} type="button" onClick={item.action} title={item.title} className="w-7 h-7 flex items-center justify-center text-xs text-gray-600 hover:bg-gray-100 rounded transition-colors font-bold">
                                                        {item.label}
                                                    </button>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                    {descPreview ? (
                                        <div className="p-4 min-h-[150px] prose prose-sm max-w-none">
                                            {form.description ? <ReactMarkdown remarkPlugins={[remarkGfm]}>{form.description}</ReactMarkdown> : <p className="text-gray-400 italic">Nothing to preview</p>}
                                        </div>
                                    ) : (
                                        <textarea ref={descRef} required rows={8} value={form.description} onChange={e => setForm({...form, description: e.target.value})} placeholder="Describe your item... Supports Markdown (use the toolbar above for formatting)" className="w-full p-4 border-0 focus:outline-none focus:ring-0 leading-relaxed resize-y" />
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Condition Grade <span className="text-luxury-gold">*</span>
                                    </label>
                                    <select required value={form.condition} onChange={e => setForm({...form, condition: e.target.value})} className="w-full p-4 border border-gray-200 focus:outline-none focus:border-luxury-gold bg-white">
                                        {CONDITIONS.map(cond => <option key={cond} value={cond}>{cond}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">
                                        Keywords / Tags <span className="text-luxury-gold">*</span>
                                    </label>
                                    <div className="relative">
                                        <input type="text" required value={form.keywords} onChange={e => setForm({...form, keywords: e.target.value})} placeholder="Separate with commas (e.g., vintage, gold, 1980s)" className="w-full p-4 pl-10 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                                        <Tag size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 border border-gray-100 rounded-sm">
                                <div className="flex items-center justify-between mb-4">
                                    <label className="block text-xs font-bold uppercase tracking-widest text-gray-600">
                                        Image Gallery <span className="text-luxury-gold">*</span>
                                    </label>
                                    <span className="text-xs text-gray-500">{form.imageUrls.filter(u => u).length} / 10 Images</span>
                                </div>

                                <div className="space-y-4">
                                    {form.imageUrls.map((url, index) => (
                                        <div key={index} className="flex gap-4 items-center">
                                            <div className="w-8 text-xs text-gray-400 font-mono text-center">
                                                {index === 0 ? 'MAIN' : `#${index + 1}`}
                                            </div>
                                            {url && (
                                                <div className="w-12 h-12 flex-shrink-0 bg-gray-100 rounded overflow-hidden">
                                                    <img src={url} alt="" className="w-full h-full object-cover" onError={(e) => { e.target.style.display = 'none' }} />
                                                </div>
                                            )}
                                            <div className="flex-grow relative">
                                                <input type="url" placeholder={index === 0 ? "Primary image URL..." : "Additional image URL..."} value={url} onChange={(e) => handleImageUrlChange(index, e.target.value)} className="w-full p-3 pl-10 border border-gray-200 focus:outline-none focus:border-luxury-gold text-sm" />
                                                <ImageIcon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                            </div>
                                            <label className="cursor-pointer p-2 text-gray-400 hover:text-luxury-gold transition-colors" title="Upload file">
                                                <Upload size={16} />
                                                <input type="file" accept="image/*" className="hidden" disabled={imageUploading} onChange={(e) => { const file = e.target.files?.[0]; if (file) handleFileUpload(index, file); e.target.value = ''; }} />
                                            </label>
                                            {form.imageUrls.length > 1 && (
                                                <button type="button" onClick={() => removeImageField(index)} className="text-gray-400 hover:text-red-500 p-2"><Trash2 size={16} /></button>
                                            )}
                                        </div>
                                    ))}
                                </div>

                                {form.imageUrls.length < 10 && (
                                    <button type="button" onClick={addImageField} className="mt-4 flex items-center gap-2 text-sm text-luxury-gold font-semibold hover:underline">
                                        <Plus size={16} /> Add Another Image
                                    </button>
                                )}

                                <div className="mt-4 flex items-start gap-2 text-xs text-gray-400 bg-white p-3 border border-gray-100">
                                    <Info size={14} className="mt-0.5 flex-shrink-0" />
                                    <p>Upload images directly or paste image URLs. The first image will be the primary detailed view and card thumbnail. {imageUploading && <span className="text-luxury-gold font-medium">Uploading...</span>}</p>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-gray-100 flex justify-end">
                                <button type="submit" disabled={createProduct.isPending || editProduct.isPending} className="bg-heritage-charcoal text-white px-12 py-4 text-sm uppercase tracking-widest hover:bg-heritage-dark transition-colors shadow-lg flex items-center justify-center gap-2">
                                    {(createProduct.isPending || editProduct.isPending) && <Loader2 size={16} className="animate-spin" />}
                                    {createProduct.isPending || editProduct.isPending ? 'Saving...' : editingId ? 'Update Product' : 'Create Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
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
                        <div key={product.id} className="bg-white border border-gray-200 hover:shadow-md transition-shadow group relative">
                            <Link to={`/products/${product.id}`}>
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
                            <button type="button" onClick={(e) => { e.preventDefault(); startEdit(product); }} className="absolute top-2 right-2 p-1.5 bg-white/90 rounded text-gray-400 hover:text-luxury-gold transition-colors shadow-sm opacity-0 group-hover:opacity-100" title="Edit product">
                                <Edit3 size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TCEStore;

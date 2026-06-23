import React, { useState, useRef } from 'react';
import { useGalleryItems, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem } from '../hooks/api/useGallery';
import { Plus, Edit3, Trash2, X, Loader2, Image as ImageIcon, Upload, Search, MapPin, Clock, Landmark, Palette } from 'lucide-react';
import { uploadGalleryImage } from '../utils/storage';
import { useConfirm } from '../components/ConfirmDialog';

const emptyForm = {
    title: '', teaser: '', description: '', images: '',
    origin: '', timePeriod: '', institution: '', significance: '', theme: '',
};

const THEMES = [
    'Indian Heritage', 'World Heritage', 'Iconic Private Collections',
    'Unusual & Bizarre', 'Timeless Objects', 'Other'
];

function GalleryManager() {
    const { data: items = [], isLoading } = useGalleryItems();
    const createMutation = useCreateGalleryItem();
    const updateMutation = useUpdateGalleryItem();
    const deleteMutation = useDeleteGalleryItem();

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);
    const [imageUploading, setImageUploading] = useState(false);
    const confirm = useConfirm();
    const [search, setSearch] = useState('');
    const [filterTheme, setFilterTheme] = useState('all');
    const fileInputRef = useRef(null);

    const filtered = items.filter(item => {
        if (filterTheme !== 'all' && item.theme !== filterTheme) return false;
        if (search && !item.title.toLowerCase().includes(search.toLowerCase()) && !item.origin?.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const handleImageUpload = async (e) => {
        const files = Array.from(e.target.files);
        if (files.length === 0) return;
        setImageUploading(true);
        try {
            const urls = await Promise.all(files.map(file => uploadGalleryImage(file)));
            const existing = form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [];
            setForm({ ...form, images: [...existing, ...urls].join(', ') });
        } catch (err) { console.error('Upload failed:', err);
        } finally {
            setImageUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    const removeImageUrl = (index) => {
        const urls = form.images.split(',').map(s => s.trim()).filter(Boolean);
        urls.splice(index, 1);
        setForm({ ...form, images: urls.join(', ') });
    };

    const openCreate = () => { setEditing(null); setForm(emptyForm); setShowForm(true); };

    const openEdit = (item) => {
        setEditing(item.id);
        setForm({
            title: item.title || '', teaser: item.teaser || '', description: item.description || '',
            images: (item.images || []).join(', '), origin: item.origin || '', timePeriod: item.timePeriod || '',
            institution: item.institution || '', significance: item.significance || '', theme: item.theme || '',
        });
        setShowForm(true);
    };

    const closeForm = () => { setShowForm(false); setEditing(null); setForm(emptyForm); };

    const handleChange = (e) => { setForm({ ...form, [e.target.name]: e.target.value }); };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = { ...form, images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [] };
        try {
            if (editing) await updateMutation.mutateAsync({ id: editing, ...payload });
            else await createMutation.mutateAsync(payload);
            closeForm();
        } catch (err) { console.error(err); }
    };

    const handleDelete = async (id) => {
        const confirmed = await confirm('Delete this gallery item?');
        if (!confirmed) return;
        try { await deleteMutation.mutateAsync(id); } catch (err) { console.error(err); }
    };

    if (isLoading) return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-luxury-gold" size={48} /></div>;

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Gallery</h2>
                    <p className="text-gray-500 mt-1">Curate museum-style archival items.</p>
                </div>
                <button onClick={openCreate} className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-white rounded-lg hover:bg-heritage-brown transition-colors shadow-sm">
                    <Plus size={18} /> Add Item
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                </div>
                <select value={filterTheme} onChange={e => setFilterTheme(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none">
                    <option value="all">All Themes</option>
                    {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                </select>
                <span className="text-sm text-gray-400 ml-auto">{filtered.length} item{filtered.length !== 1 ? 's' : ''}</span>
            </div>

            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-8">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
                        <div className="flex items-center justify-between p-6 border-b sticky top-0 bg-white z-10">
                            <h3 className="text-xl font-serif font-bold">{editing ? 'Edit Item' : 'New Gallery Item'}</h3>
                            <button onClick={closeForm} className="p-2 hover:bg-gray-100 rounded-lg transition-colors"><X size={18} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Title <span className="text-red-400">*</span></label>
                                <input name="title" value={form.title} onChange={handleChange} required placeholder="Item title" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Teaser <span className="text-red-400">*</span></label>
                                <input name="teaser" value={form.teaser} onChange={handleChange} required placeholder="Short description for cards" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Description <span className="text-red-400">*</span></label>
                                <textarea name="description" value={form.description} onChange={handleChange} required rows={4} placeholder="Full archival description..." className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Images</label>
                                <div className="flex gap-2 mb-2">
                                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageUpload} className="hidden" />
                                    <button type="button" onClick={() => fileInputRef.current?.click()} disabled={imageUploading}
                                        className="flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-dashed border-gray-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold/5 transition-colors disabled:opacity-50">
                                        <Upload size={16} /> {imageUploading ? 'Uploading...' : 'Upload Images'}
                                    </button>
                                </div>
                                <input name="images" value={form.images} onChange={handleChange} placeholder="Or paste image URLs (comma-separated)" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                                {form.images && (
                                    <div className="flex flex-wrap gap-2 mt-3">
                                        {form.images.split(',').map(s => s.trim()).filter(Boolean).map((url, i) => (
                                            <div key={i} className="relative group">
                                                <img src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" onError={e => { e.target.style.display = 'none' }} />
                                                <button type="button" onClick={() => removeImageUrl(i)} className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"><X size={11} /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Origin <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <MapPin size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="origin" value={form.origin} onChange={handleChange} required placeholder="e.g. India, France" className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Time Period <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Clock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="timePeriod" value={form.timePeriod} onChange={handleChange} required placeholder="e.g. 18th Century" className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Institution <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Landmark size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <input name="institution" value={form.institution} onChange={handleChange} required placeholder="e.g. British Museum" className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Theme <span className="text-red-400">*</span></label>
                                    <div className="relative">
                                        <Palette size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                        <select name="theme" value={form.theme} onChange={handleChange} required className="w-full pl-9 pr-3.5 py-2.5 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none appearance-none bg-white">
                                            <option value="">Select theme...</option>
                                            {THEMES.map(t => <option key={t} value={t}>{t}</option>)}
                                        </select>
                                    </div>
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">Significance <span className="text-red-400">*</span></label>
                                <textarea name="significance" value={form.significance} onChange={handleChange} required rows={2} placeholder="Why is this item important?" className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={closeForm} className="px-5 py-2.5 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-5 py-2.5 text-sm bg-luxury-gold text-white rounded-lg hover:bg-heritage-brown disabled:opacity-50 transition-colors shadow-sm">
                                    {isPending ? 'Saving...' : editing ? 'Update Item' : 'Create Item'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {filtered.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-gray-100">
                    <ImageIcon size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-serif text-lg">{search || filterTheme !== 'all' ? 'No items match your filters.' : 'No gallery items yet.'}</p>
                    <p className="text-gray-400 text-sm mt-1">{search || filterTheme !== 'all' ? 'Try adjusting your search or filter.' : 'Click "Add Item" to curate one.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {filtered.map((item) => (
                        <div key={item.id} className="bg-white rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-md transition-all overflow-hidden group">
                            {item.images?.[0] ? (
                                <div className="relative h-48 overflow-hidden">
                                    <img src={item.images[0]} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
                                </div>
                            ) : (
                                <div className="h-48 bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center text-gray-200">
                                    <ImageIcon size={48} />
                                </div>
                            )}
                            <div className="p-5">
                                <h3 className="font-serif font-bold text-heritage-charcoal mb-1.5 line-clamp-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-3 line-clamp-2">{item.teaser}</p>
                                <div className="flex flex-wrap gap-1.5 mb-4">
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded"><MapPin size={10} /> {item.origin}</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-gray-50 text-gray-500 px-2 py-0.5 rounded"><Clock size={10} /> {item.timePeriod}</span>
                                    <span className="inline-flex items-center gap-1 text-[11px] bg-luxury-gold/10 text-luxury-gold px-2 py-0.5 rounded font-medium">{item.theme}</span>
                                </div>
                                <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => openEdit(item)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"><Edit3 size={13} /> Edit</button>
                                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 border border-red-100 text-red-600 rounded-lg hover:bg-red-50 transition-colors"><Trash2 size={13} /> Delete</button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export default GalleryManager;

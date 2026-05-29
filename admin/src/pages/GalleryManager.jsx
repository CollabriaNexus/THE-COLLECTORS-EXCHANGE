import React, { useState } from 'react';
import { useGalleryItems, useCreateGalleryItem, useUpdateGalleryItem, useDeleteGalleryItem } from '../hooks/api/useGallery';
import { Plus, Edit3, Trash2, X, Loader2, Image as ImageIcon } from 'lucide-react';

const emptyForm = {
    title: '',
    teaser: '',
    description: '',
    images: '',
    origin: '',
    timePeriod: '',
    institution: '',
    significance: '',
    theme: '',
};

function GalleryManager() {
    const { data: items = [], isLoading } = useGalleryItems();
    const createMutation = useCreateGalleryItem();
    const updateMutation = useUpdateGalleryItem();
    const deleteMutation = useDeleteGalleryItem();

    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(emptyForm);

    const openCreate = () => {
        setEditing(null);
        setForm(emptyForm);
        setShowForm(true);
    };

    const openEdit = (item) => {
        setEditing(item.id);
        setForm({
            title: item.title || '',
            teaser: item.teaser || '',
            description: item.description || '',
            images: (item.images || []).join(', '),
            origin: item.origin || '',
            timePeriod: item.timePeriod || '',
            institution: item.institution || '',
            significance: item.significance || '',
            theme: item.theme || '',
        });
        setShowForm(true);
    };

    const closeForm = () => {
        setShowForm(false);
        setEditing(null);
        setForm(emptyForm);
    };

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const payload = {
            ...form,
            images: form.images ? form.images.split(',').map(s => s.trim()).filter(Boolean) : [],
        };
        try {
            if (editing) {
                await updateMutation.mutateAsync({ id: editing, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            closeForm();
        } catch (err) {
            console.error('Failed to save gallery item:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this gallery item?')) return;
        try {
            await deleteMutation.mutateAsync(id);
        } catch (err) {
            console.error('Failed to delete:', err);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <Loader2 className="animate-spin text-luxury-gold" size={48} />
            </div>
        );
    }

    const isPending = createMutation.isPending || updateMutation.isPending;

    return (
        <div>
            <div className="flex justify-between items-center mb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Gallery Manager</h2>
                    <p className="text-gray-600 mt-1">Manage museum-style gallery items</p>
                </div>
                <button
                    onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 bg-luxury-gold text-white rounded-md hover:bg-heritage-brown transition-colors"
                >
                    <Plus size={18} /> Add Item
                </button>
            </div>

            {/* Form Modal */}
            {showForm && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-start justify-center pt-12">
                    <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl max-h-[85vh] overflow-y-auto mx-4">
                        <div className="flex justify-between items-center p-6 border-b">
                            <h3 className="text-xl font-serif font-bold">{editing ? 'Edit Gallery Item' : 'New Gallery Item'}</h3>
                            <button onClick={closeForm} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                                <input name="title" value={form.title} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Teaser</label>
                                <input name="teaser" value={form.teaser} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                <textarea name="description" value={form.description} onChange={handleChange} required rows={3} className="w-full border rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Images (comma-separated URLs)</label>
                                <input name="images" value={form.images} onChange={handleChange} placeholder="https://..." className="w-full border rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Origin</label>
                                    <input name="origin" value={form.origin} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Time Period</label>
                                    <input name="timePeriod" value={form.timePeriod} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Institution</label>
                                    <input name="institution" value={form.institution} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Theme</label>
                                    <input name="theme" value={form.theme} onChange={handleChange} required className="w-full border rounded-md px-3 py-2 text-sm" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Significance</label>
                                <textarea name="significance" value={form.significance} onChange={handleChange} required rows={2} className="w-full border rounded-md px-3 py-2 text-sm" />
                            </div>
                            <div className="flex justify-end gap-3 pt-4 border-t">
                                <button type="button" onClick={closeForm} className="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">Cancel</button>
                                <button type="submit" disabled={isPending} className="px-4 py-2 text-sm bg-luxury-gold text-white rounded-md hover:bg-heritage-brown disabled:opacity-50">
                                    {isPending ? 'Saving...' : editing ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Gallery Items Grid */}
            {items.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-lg border border-gray-200">
                    <ImageIcon size={48} className="mx-auto text-gray-300 mb-4" />
                    <p className="text-gray-500 font-serif text-lg">No gallery items yet.</p>
                    <p className="text-gray-400 text-sm mt-2">Click "Add Item" to create one.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {items.map((item) => (
                        <div key={item.id} className="bg-white rounded-lg shadow-heritage overflow-hidden border border-gray-100">
                            {item.images?.[0] ? (
                                <img src={item.images[0]} alt={item.title} className="w-full h-48 object-cover" />
                            ) : (
                                <div className="w-full h-48 bg-gray-100 flex items-center justify-center text-gray-300"><ImageIcon size={48} /></div>
                            )}
                            <div className="p-4">
                                <h3 className="font-serif font-bold text-heritage-charcoal mb-1">{item.title}</h3>
                                <p className="text-sm text-gray-500 mb-2">{item.teaser}</p>
                                <div className="flex flex-wrap gap-2 mb-3">
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.origin}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.timePeriod}</span>
                                    <span className="text-xs bg-gray-100 px-2 py-1 rounded">{item.theme}</span>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEdit(item)} className="flex items-center gap-1 text-sm px-3 py-1.5 border rounded-md hover:bg-gray-50">
                                        <Edit3 size={14} /> Edit
                                    </button>
                                    <button onClick={() => handleDelete(item.id)} className="flex items-center gap-1 text-sm px-3 py-1.5 border border-red-200 text-red-600 rounded-md hover:bg-red-50">
                                        <Trash2 size={14} /> Delete
                                    </button>
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
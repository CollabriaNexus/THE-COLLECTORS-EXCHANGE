import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import ImageExtension from '@tiptap/extension-image';
import LinkExtension from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import CharacterCount from '@tiptap/extension-character-count';
import { useCreateBlogPost, useUpdateBlogPost, useBlogPosts } from '../hooks/api/useBlog';
import { uploadBlogImage } from '../utils/storage';
import {
    Bold, Italic, Heading2, Heading3, List, ListOrdered,
    Quote, Code, Image, Link, Undo2, Redo2, Loader2, X, Upload, ChevronDown
} from 'lucide-react';

const CATEGORIES = [
    'Horology', 'Gemology', 'Collecting', 'Limited Editions',
    'TCE Originals', 'Culture & History', 'News & Updates'
];

const emptyForm = {
    title: '', slug: '', excerpt: '', content: '',
    coverImage: '', author: '', authorAvatar: '', category: '',
    tags: '', status: 'DRAFT', featured: false,
    metaTitle: '', metaDescription: '',
};

const toSlug = (str) => str.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_]+/g, '-').replace(/^-+|-+$/g, '') || '';

function BlogEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditing = !!id;

    const { data: allPosts = [] } = useBlogPosts({});
    const createMutation = useCreateBlogPost();
    const updateMutation = useUpdateBlogPost();

    const existingPost = isEditing ? allPosts.find(p => p.id === id) : null;

    const [form, setForm] = useState(emptyForm);
    const [coverUploading, setCoverUploading] = useState(false);
    const [contentImageUploading, setContentImageUploading] = useState(false);
    const [showSeo, setShowSeo] = useState(false);
    const [showLinkModal, setShowLinkModal] = useState(false);
    const [linkUrl, setLinkUrl] = useState('');
    const [saving, setSaving] = useState(false);
    const coverInputRef = useRef(null);

    useEffect(() => {
        if (existingPost) {
            setForm({
                title: existingPost.title || '',
                slug: existingPost.slug || '',
                excerpt: existingPost.excerpt || '',
                content: existingPost.content || '',
                coverImage: existingPost.coverImage || '',
                author: existingPost.author || '',
                authorAvatar: existingPost.authorAvatar || '',
                category: existingPost.category || '',
                tags: (existingPost.tags || []).join(', '),
                status: existingPost.status || 'DRAFT',
                featured: existingPost.featured || false,
                metaTitle: existingPost.metaTitle || '',
                metaDescription: existingPost.metaDescription || '',
            });
        }
    }, [existingPost]);

    const editor = useEditor({
        extensions: [
            StarterKit.configure({
                heading: { levels: [2, 3, 4] },
            }),
            ImageExtension.configure({ inline: false }),
            LinkExtension.configure({ openOnClick: false }),
            Placeholder.configure({ placeholder: 'Start writing your article...' }),
            CharacterCount.configure({ limit: 100000 }),
        ],
        content: existingPost?.content || '',
        editorProps: {
            attributes: {
                class: 'prose prose-lg max-w-none focus:outline-none min-h-[400px] px-6 py-5',
            },
        },
    });

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'title' && !isEditing ? { slug: toSlug(value) } : {}),
        }));
    };

    const handleCoverUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        setCoverUploading(true);
        try {
            const url = await uploadBlogImage(file);
            setForm(prev => ({ ...prev, coverImage: url }));
        } catch (err) { console.error(err); }
        finally { setCoverUploading(false); if (coverInputRef.current) coverInputRef.current.value = ''; }
    };

    const insertImage = useCallback(async () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = async () => {
            const file = input.files?.[0];
            if (!file) return;
            setContentImageUploading(true);
            try {
                const url = await uploadBlogImage(file);
                editor?.chain().focus().setImage({ src: url }).run();
            } catch (err) { console.error(err); }
            finally { setContentImageUploading(false); }
        };
        input.click();
    }, [editor]);

    const addLink = () => {
        if (linkUrl) {
            editor?.chain().focus().setLink({ href: linkUrl }).run();
            setLinkUrl('');
            setShowLinkModal(false);
        }
    };

    const handleSubmit = async (publishStatus) => {
        if (!editor) return;
        const content = editor.getHTML();
        const readingTime = Math.max(1, Math.ceil(content.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length / 200));

        const payload = {
            ...form,
            content,
            tags: form.tags ? form.tags.split(',').map(t => t.trim()).filter(Boolean) : [],
            status: publishStatus || form.status,
            readingTime,
        };
        if (!payload.slug) payload.slug = toSlug(payload.title);

        setSaving(true);
        try {
            if (isEditing) {
                await updateMutation.mutateAsync({ id, ...payload });
            } else {
                await createMutation.mutateAsync(payload);
            }
            navigate('/blog');
        } catch (err) { console.error(err); }
        finally { setSaving(false); }
    };

    const isPending = saving || createMutation.isPending || updateMutation.isPending;

    if (isEditing && !existingPost && allPosts.length > 0) {
        return <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-luxury-gold" size={48} /></div>;
    }

    if (!editor) return null;

    const ToolbarButton = ({ onClick, active, children, title }) => (
        <button type="button" onClick={onClick}
            className={`p-2 rounded transition-colors ${active ? 'bg-luxury-gold/20 text-luxury-gold' : 'text-gray-500 hover:bg-gray-100 hover:text-gray-700'}`}
            title={title}>{children}</button>
    );

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">{isEditing ? 'Edit Post' : 'New Post'}</h2>
                    <p className="text-gray-500 mt-1">{isEditing ? 'Update your article.' : 'Write a new archival article.'}</p>
                </div>
                <div className="flex gap-2">
                    <button onClick={() => navigate('/blog')} className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">Cancel</button>
                    {form.status !== 'PUBLISHED' && (
                        <button onClick={() => handleSubmit('PUBLISHED')} disabled={isPending}
                            className="px-5 py-2 text-sm bg-luxury-gold text-white rounded-lg hover:bg-heritage-brown disabled:opacity-50 transition-colors shadow-sm">
                            {isPending ? 'Publishing...' : 'Publish'}
                        </button>
                    )}
                    <button onClick={() => handleSubmit(form.status === 'PUBLISHED' ? 'PUBLISHED' : 'DRAFT')} disabled={isPending}
                        className="px-5 py-2 text-sm bg-black text-white rounded-lg hover:bg-heritage-charcoal disabled:opacity-50 transition-colors shadow-sm">
                        {isPending ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Draft'}
                    </button>
                </div>
            </div>

            <div className="space-y-5">
                {/* Title */}
                <div>
                    <input name="title" value={form.title} onChange={handleChange} required placeholder="Article Title"
                        className="w-full text-3xl font-serif font-bold border-0 border-b-2 border-gray-100 pb-3 focus:border-luxury-gold focus:ring-0 outline-none placeholder:text-gray-200" />
                </div>

                {/* Slug + Author + Category row */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Slug</label>
                        <input name="slug" value={form.slug} onChange={handleChange} placeholder="article-slug"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Author</label>
                        <input name="author" value={form.author} onChange={handleChange} placeholder="Author name"
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Category</label>
                        <select name="category" value={form.category} onChange={handleChange}
                            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none bg-white">
                            <option value="">Select category...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                {/* Excerpt */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Excerpt</label>
                    <textarea name="excerpt" value={form.excerpt} onChange={handleChange} rows={2} placeholder="Short description for cards and previews..."
                        className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                </div>

                {/* Cover Image */}
                <div>
                    <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Cover Image</label>
                    <div className="flex gap-3 items-start">
                        <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} className="hidden" />
                        <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
                            className="flex items-center gap-2 px-4 py-2.5 text-sm border-2 border-dashed border-gray-200 rounded-lg hover:border-luxury-gold hover:bg-luxury-gold/5 transition-colors disabled:opacity-50">
                            <Upload size={16} /> {coverUploading ? 'Uploading...' : 'Upload Cover'}
                        </button>
                        <input name="coverImage" value={form.coverImage} onChange={handleChange} placeholder="Or paste image URL"
                            className="flex-1 border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                    </div>
                    {form.coverImage && (
                        <div className="relative mt-3 inline-block group">
                            <img src={form.coverImage} alt="" className="h-32 rounded-lg border object-cover" />
                            <button type="button" onClick={() => setForm(prev => ({ ...prev, coverImage: '' }))}
                                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow"><X size={11} /></button>
                        </div>
                    )}
                </div>

                {/* Tags + Featured */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Tags (comma-separated)</label>
                        <input name="tags" value={form.tags} onChange={handleChange} placeholder="tag1, tag2, tag3"
                            className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                    </div>
                    <div className="flex items-end pb-2.5">
                        <label className="flex items-center gap-3 cursor-pointer">
                            <input type="checkbox" name="featured" checked={form.featured} onChange={handleChange}
                                className="w-4 h-4 rounded border-gray-300 text-luxury-gold focus:ring-luxury-gold/30" />
                            <span className="text-sm font-medium text-gray-700">Featured post (shows as spotlight)</span>
                        </label>
                    </div>
                </div>

                {/* TipTap Editor */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <div className="flex items-center gap-0.5 px-3 py-2 border-b border-gray-100 bg-gray-50/50 flex-wrap">
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBold().run()} active={editor.isActive('bold')} title="Bold"><Bold size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleItalic().run()} active={editor.isActive('italic')} title="Italic"><Italic size={16} /></ToolbarButton>
                        <span className="w-px h-6 bg-gray-200 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()} active={editor.isActive('heading', { level: 2 })} title="Heading 2"><Heading2 size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()} active={editor.isActive('heading', { level: 3 })} title="Heading 3"><Heading3 size={16} /></ToolbarButton>
                        <span className="w-px h-6 bg-gray-200 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBulletList().run()} active={editor.isActive('bulletList')} title="Bullet List"><List size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleOrderedList().run()} active={editor.isActive('orderedList')} title="Ordered List"><ListOrdered size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleBlockquote().run()} active={editor.isActive('blockquote')} title="Blockquote"><Quote size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().toggleCodeBlock().run()} active={editor.isActive('codeBlock')} title="Code Block"><Code size={16} /></ToolbarButton>
                        <span className="w-px h-6 bg-gray-200 mx-1" />
                        <ToolbarButton onClick={insertImage} title="Insert Image"><Image size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => {
                            const prevUrl = editor.getAttributes('link').href || '';
                            setLinkUrl(prevUrl);
                            setShowLinkModal(true);
                        }} active={editor.isActive('link')} title="Link"><Link size={16} /></ToolbarButton>
                        <span className="w-px h-6 bg-gray-200 mx-1" />
                        <ToolbarButton onClick={() => editor.chain().focus().undo().run()} title="Undo"><Undo2 size={16} /></ToolbarButton>
                        <ToolbarButton onClick={() => editor.chain().focus().redo().run()} title="Redo"><Redo2 size={16} /></ToolbarButton>
                        <span className="ml-auto text-xs text-gray-400">{editor.storage.characterCount?.characters?.() || 0} chars</span>
                        {contentImageUploading && <Loader2 size={14} className="animate-spin text-luxury-gold ml-2" />}
                    </div>
                    <EditorContent editor={editor} />
                </div>

                {/* Link Modal */}
                {showLinkModal && (
                    <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
                        <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4">
                            <h3 className="font-serif font-bold text-lg mb-4">{editor.getAttributes('link').href ? 'Edit Link' : 'Add Link'}</h3>
                            <input value={linkUrl} onChange={e => setLinkUrl(e.target.value)} placeholder="https://..." autoFocus
                                className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none mb-4" />
                            <div className="flex justify-end gap-2">
                                <button type="button" onClick={() => { editor.chain().focus().unsetLink().run(); setShowLinkModal(false); }}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Remove</button>
                                <button type="button" onClick={() => setShowLinkModal(false)}
                                    className="px-4 py-2 text-sm border border-gray-200 rounded-lg hover:bg-gray-50">Cancel</button>
                                <button type="button" onClick={addLink}
                                    className="px-4 py-2 text-sm bg-luxury-gold text-white rounded-lg hover:bg-heritage-brown">Apply</button>
                            </div>
                        </div>
                    </div>
                )}

                {/* SEO Section */}
                <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                    <button type="button" onClick={() => setShowSeo(!showSeo)}
                        className="flex items-center justify-between w-full px-6 py-4 text-left">
                        <span className="text-sm font-medium text-gray-700">SEO Settings</span>
                        <ChevronDown size={16} className={`text-gray-400 transition-transform ${showSeo ? 'rotate-180' : ''}`} />
                    </button>
                    {showSeo && (
                        <div className="px-6 pb-4 space-y-4 border-t border-gray-100 pt-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Meta Title</label>
                                <input name="metaTitle" value={form.metaTitle} onChange={handleChange} placeholder="SEO title (defaults to article title)"
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-medium text-gray-500 mb-1 uppercase tracking-wider">Meta Description</label>
                                <textarea name="metaDescription" value={form.metaDescription} onChange={handleChange} rows={2} placeholder="SEO description (defaults to excerpt)"
                                    className="w-full border border-gray-200 rounded-lg px-3.5 py-2.5 text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default BlogEditor;

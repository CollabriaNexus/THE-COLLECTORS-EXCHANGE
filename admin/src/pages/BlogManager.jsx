import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useBlogPosts, useUpdateBlogStatus, useDeleteBlogPost } from '../hooks/api/useBlog';
import { Plus, Loader2, Search, FileText, Edit3, Trash2, Eye, EyeOff, Archive } from 'lucide-react';
import { useConfirm } from '../components/ConfirmDialog';

const CATEGORIES = [
    'Horology', 'Gemology', 'Collecting', 'Limited Editions',
    'TCE Originals', 'Culture & History', 'News & Updates'
];

function BlogManager() {
    const navigate = useNavigate();
    const confirm = useConfirm();
    const [statusFilter, setStatusFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [search, setSearch] = useState('');

    const { data: posts = [], isLoading } = useBlogPosts({ status: statusFilter, category: categoryFilter, search });
    const updateStatus = useUpdateBlogStatus();
    const deletePost = useDeleteBlogPost();

    const handleDelete = async (id) => {
        const confirmed = await confirm('Delete this post permanently?');
        if (!confirmed) return;
        try { await deletePost.mutateAsync(id); } catch (err) { console.error(err); }
    };

    const handleStatusToggle = async (id, currentStatus) => {
        const nextStatus = currentStatus === 'PUBLISHED' ? 'DRAFT' : 'PUBLISHED';
        try { await updateStatus.mutateAsync({ id, status: nextStatus }); } catch (err) { console.error(err); }
    };

    return (
        <div>
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Blog / Archive</h2>
                    <p className="text-gray-500 mt-1">Manage journal posts and archival articles.</p>
                </div>
                <button onClick={() => navigate('/blog/new')} className="flex items-center gap-2 px-5 py-2.5 bg-luxury-gold text-white rounded-lg hover:bg-heritage-brown transition-colors shadow-sm">
                    <Plus size={18} /> New Post
                </button>
            </div>

            <div className="flex flex-wrap items-center gap-3 mb-6">
                <div className="relative flex-1 max-w-sm">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search posts..." className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                </div>
                <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none bg-white">
                    <option value="">All Status</option>
                    <option value="DRAFT">Draft</option>
                    <option value="PUBLISHED">Published</option>
                    <option value="ARCHIVED">Archived</option>
                </select>
                <select value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)} className="px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none bg-white">
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <span className="text-sm text-gray-400 ml-auto">{posts.length} post{posts.length !== 1 ? 's' : ''}</span>
            </div>

            {isLoading ? (
                <div className="flex items-center justify-center py-24"><Loader2 className="animate-spin text-luxury-gold" size={48} /></div>
            ) : posts.length === 0 ? (
                <div className="text-center py-24 bg-white rounded-xl border border-gray-100">
                    <FileText size={48} className="mx-auto text-gray-200 mb-4" />
                    <p className="text-gray-500 font-serif text-lg">{search || statusFilter || categoryFilter ? 'No posts match your filters.' : 'No posts yet.'}</p>
                    <p className="text-gray-400 text-sm mt-1">{search || statusFilter || categoryFilter ? 'Try adjusting your filters.' : 'Click "New Post" to write one.'}</p>
                </div>
            ) : (
                <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-gray-100 bg-gray-50/50">
                                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium">Title</th>
                                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium hidden md:table-cell">Category</th>
                                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium hidden sm:table-cell">Status</th>
                                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium hidden lg:table-cell">Author</th>
                                <th className="text-left px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium hidden lg:table-cell">Date</th>
                                <th className="text-right px-5 py-3.5 text-xs uppercase tracking-widest text-gray-500 font-medium">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {posts.map(post => (
                                <tr key={post.id} className="border-b border-gray-50 hover:bg-gray-50/50 transition-colors">
                                    <td className="px-5 py-4">
                                        <div className="flex items-center gap-3">
                                            {post.coverImage ? (
                                                <img src={post.coverImage} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
                                            ) : (
                                                <div className="w-10 h-10 rounded bg-gray-100 flex items-center justify-center flex-shrink-0"><FileText size={16} className="text-gray-300" /></div>
                                            )}
                                            <div className="min-w-0">
                                                <p className="font-medium text-heritage-charcoal truncate">{post.title}</p>
                                                <p className="text-xs text-gray-400 truncate">{post.excerpt}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-5 py-4 hidden md:table-cell">
                                        <span className="inline-block text-xs px-2 py-0.5 rounded bg-luxury-gold/10 text-luxury-gold font-medium">{post.category}</span>
                                    </td>
                                    <td className="px-5 py-4 hidden sm:table-cell">
                                        <span className={`inline-flex items-center gap-1 text-xs px-2 py-0.5 rounded font-medium ${
                                            post.status === 'PUBLISHED' ? 'bg-green-50 text-green-600' :
                                            post.status === 'ARCHIVED' ? 'bg-gray-50 text-gray-500' :
                                            'bg-amber-50 text-amber-600'
                                        }`}>
                                            {post.status === 'PUBLISHED' && <Eye size={12} />}
                                            {post.status === 'DRAFT' && <EyeOff size={12} />}
                                            {post.status === 'ARCHIVED' && <Archive size={12} />}
                                            {post.status}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 hidden lg:table-cell"><span className="text-sm text-gray-500">{post.author}</span></td>
                                    <td className="px-5 py-4 hidden lg:table-cell">
                                        <span className="text-sm text-gray-400">
                                            {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : new Date(post.createdAt).toLocaleDateString()}
                                        </span>
                                    </td>
                                    <td className="px-5 py-4 text-right">
                                        <div className="flex items-center justify-end gap-1">
                                            <button onClick={() => handleStatusToggle(post.id, post.status)}
                                                disabled={post.status === 'ARCHIVED'}
                                                className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors disabled:opacity-30"
                                                title={post.status === 'PUBLISHED' ? 'Unpublish' : 'Publish'}>
                                                {post.status === 'PUBLISHED' ? <EyeOff size={16} /> : <Eye size={16} />}
                                            </button>
                                            <button onClick={() => navigate(`/blog/${post.id}/edit`)} className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Edit">
                                                <Edit3 size={16} />
                                            </button>
                                            <button onClick={() => handleDelete(post.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Delete">
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default BlogManager;

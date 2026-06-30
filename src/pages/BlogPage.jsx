import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';
import { usePublishedBlogs } from '../hooks/api/useBlog';
import { BookOpen, Clock, User, Search, Loader2, ArrowRight, Tag } from 'lucide-react';

const scrollHideCss = `
    .scrollbar-hide::-webkit-scrollbar { display: none; }
`;

const CATEGORIES = [
    'All', 'Horology', 'Gemology', 'Collecting', 'Limited Editions',
    'TCE Originals', 'Culture & History', 'News & Updates'
];

const BlogCard = ({ post }) => (
    <Link to={`/archive/${post.slug}`}
        className="group bg-white rounded-sm border border-gray-100 hover:border-luxury-gold/30 hover:shadow-lg transition-all duration-500 overflow-hidden flex flex-col">
        {post.coverImage ? (
            <div className="relative h-48 sm:h-56 overflow-hidden">
                <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>
        ) : (
            <div className="h-48 sm:h-56 bg-gradient-to-br from-heritage-cream to-gray-50 flex items-center justify-center">
                <BookOpen size={48} className="text-gray-200" />
            </div>
        )}
        <div className="p-5 sm:p-6 flex flex-col flex-1">
            <div className="flex items-center gap-2 mb-3">
                <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-luxury-gold bg-luxury-gold/5 px-2.5 py-1 rounded-sm">{post.category}</span>
                {post.featured && (
                    <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-heritage-charcoal bg-heritage-charcoal/5 px-2.5 py-1 rounded-sm">Featured</span>
                )}
            </div>
            <h3 className="font-serif text-lg font-bold text-heritage-charcoal group-hover:text-luxury-gold transition-colors duration-300 mb-2 line-clamp-2">{post.title}</h3>
            <p className="text-sm text-gray-500 leading-relaxed mb-4 line-clamp-2 flex-1">{post.excerpt}</p>
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                    {post.readingTime && (
                        <span className="flex items-center gap-1"><Clock size={12} /> {post.readingTime} min read</span>
                    )}
                </div>
                <span className="text-xs text-luxury-gold font-medium group-hover:translate-x-1 transition-transform duration-300 flex items-center gap-1">
                    Read <ArrowRight size={12} />
                </span>
            </div>
        </div>
    </Link>
);

function BlogPage() {
    const [category, setCategory] = useState('');
    const [search, setSearch] = useState('');
    const [debouncedSearch, setDebouncedSearch] = useState('');

    useEffect(() => {
        const t = setTimeout(() => setDebouncedSearch(search), 300);
        return () => clearTimeout(t);
    }, [search]);

    const { data, isLoading } = usePublishedBlogs({
        category: category || undefined,
        search: debouncedSearch || undefined,
        limit: '24',
    });

    const posts = data?.posts || [];
    const featured = posts.filter(p => p.featured);
    const regular = posts.filter(p => !p.featured);

    const displayFeatured = !category && !debouncedSearch;

    return (
        <div className="min-h-screen bg-white">
            <style>{scrollHideCss}</style>
            <SEO
                title="The Archive"
                description="Explore The Collectors Exchange Archive — curated articles on horology, gemology, collecting, and the stories behind rare artifacts."
                canonical="/archive"
            />

            {/* Hero */}
            <section className="relative py-20 sm:py-28 px-6 bg-heritage-charcoal overflow-hidden">
                <div className="absolute inset-0">
                    <img src="https://images.unsplash.com/photo-1507842217343-583bb7270b66?auto=format&fit=crop&q=80&w=1600" alt="" className="w-full h-full object-cover opacity-40" />
                    <div className="absolute inset-0 bg-gradient-to-t from-heritage-charcoal via-heritage-charcoal/70 to-heritage-charcoal/60" />
                </div>
                <div className="container mx-auto max-w-4xl relative z-10 text-center">
                    <div className="flex items-center justify-center gap-4 mb-6">
                        <div className="h-px w-12 bg-luxury-gold/50"></div>
                        <BookOpen size={20} className="text-luxury-gold/70" strokeWidth={1} />
                        <div className="h-px w-12 bg-luxury-gold/50"></div>
                    </div>
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-serif text-white leading-tight mb-4 tracking-tight">
                        The Archive
                    </h1>
                    <p className="text-lg text-white/60 font-light max-w-2xl mx-auto leading-relaxed">
                        Stories behind the artifacts. Curated insights on horology, gemology, collecting, and the art of preservation.
                    </p>
                </div>
            </section>

            {/* Filters */}
            <section className="sticky top-0 bg-white/95 backdrop-blur border-b border-gray-100 z-30">
                <div className="container mx-auto px-6 py-3 sm:py-4">
                    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                        <div className="overflow-x-auto scrollbar-hide -mx-6 px-6 sm:mx-0 sm:px-0 flex-1" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                            <div className="flex gap-1.5 min-w-max sm:min-w-0">
                                {CATEGORIES.map(c => (
                                    <button key={c} onClick={() => setCategory(c === 'All' ? '' : c)}
                                        className={`text-[11px] uppercase tracking-[0.15em] font-semibold px-4 py-2 rounded-full border transition-all duration-300 whitespace-nowrap ${
                                            (c === 'All' && !category) || category === c
                                                ? 'bg-heritage-charcoal text-white border-heritage-charcoal'
                                                : 'text-gray-400 border-gray-200 hover:text-heritage-charcoal hover:border-gray-300'
                                        }`}>
                                        {c === 'All' ? 'All Articles' : c}
                                    </button>
                                ))}
                            </div>
                        </div>
                        <div className="relative w-full sm:w-56">
                            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-300" />
                            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search articles..."
                                className="w-full pl-9 pr-4 py-2.5 sm:py-2 border border-gray-200 rounded-full text-sm focus:ring-2 focus:ring-luxury-gold/20 focus:border-luxury-gold outline-none" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Content */}
            <section className="py-12 sm:py-16 px-6">
                <div className="container mx-auto max-w-6xl">
                    {isLoading ? (
                        <div className="flex flex-col items-center justify-center py-32">
                            <Loader2 className="animate-spin text-luxury-gold/40 mb-4" size={40} />
                            <p className="text-gray-400 font-serif italic">Opening the archive...</p>
                        </div>
                    ) : posts.length === 0 ? (
                        <div className="text-center py-24">
                            <BookOpen size={56} className="mx-auto text-gray-200 mb-4" strokeWidth={1} />
                            <p className="text-xl font-serif text-gray-400 mb-2">No articles found</p>
                            <p className="text-sm text-gray-400">
                                {search || category ? 'Try adjusting your search or filter.' : 'New articles will appear here.'}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Featured Spotlight */}
                            {displayFeatured && featured.length > 0 && (
                                <div className="mb-16">
                                    <div className="flex items-center gap-3 mb-8">
                                        <Tag size={16} className="text-luxury-gold" />
                                        <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-heritage-charcoal">Featured Story</h2>
                                        <div className="h-px flex-1 bg-gray-100" />
                                    </div>
                                    {featured.slice(0, 1).map(post => (
                                        <Link key={post.id} to={`/archive/${post.slug}`}
                                            className="group block bg-gradient-to-r from-heritage-charcoal to-[#2a2520] rounded-sm overflow-hidden">
                                            <div className="grid md:grid-cols-2 min-h-[300px]">
                                                {post.coverImage ? (
                                                    <div className="relative h-64 md:h-auto overflow-hidden">
                                                        <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                                    </div>
                                                ) : (
                                                    <div className="h-64 md:h-auto bg-heritage-brown/30 flex items-center justify-center">
                                                        <BookOpen size={64} className="text-white/20" />
                                                    </div>
                                                )}
                                                <div className="p-8 sm:p-12 flex flex-col justify-center">
                                                    <span className="text-[10px] uppercase tracking-[0.25em] font-bold text-luxury-gold mb-3">{post.category}</span>
                                                    <h3 className="text-2xl sm:text-3xl font-serif text-white leading-tight mb-4 group-hover:text-luxury-gold transition-colors">{post.title}</h3>
                                                    <p className="text-white/60 text-sm leading-relaxed mb-6 line-clamp-3">{post.excerpt}</p>
                                                    <div className="flex items-center gap-3 text-xs text-white/40">
                                                        <span className="flex items-center gap-1"><User size={12} /> {post.author}</span>
                                                        {post.readingTime && <span className="flex items-center gap-1"><Clock size={12} /> {post.readingTime} min read</span>}
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            )}

                            {/* Grid */}
                            {regular.length > 0 && (
                                <>
                                    {displayFeatured && featured.length > 0 && (
                                        <div className="flex items-center gap-3 mb-8">
                                            <div className="h-px flex-1 bg-gray-100" />
                                            <h2 className="text-sm uppercase tracking-[0.2em] font-bold text-gray-400">More Articles</h2>
                                            <div className="h-px flex-1 bg-gray-100" />
                                        </div>
                                    )}
                                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
                                        {regular.map(post => <BlogCard key={post.id} post={post} />)}
                                    </div>
                                </>
                            )}

                            {/* If only featured matches */}
                            {regular.length === 0 && featured.length > 0 && displayFeatured && (
                                <div className="text-center py-12">
                                    <p className="text-gray-400">More articles coming soon.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </section>
        </div>
    );
}

export default BlogPage;

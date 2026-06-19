import React, { useState } from 'react';
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import SEO from '../components/SEO';
import apiClient from '../hooks/api/apiClient';

const cards = [
    {
        icon: Mail,
        title: 'Email',
        content: (
            <a href="mailto:support@thecollectorsexchange.in" className="text-sm text-gray-600 hover:text-luxury-gold transition-colors break-words">
support@thecollectorsexchange.in
            </a>
        ),
    },
    {
        icon: Clock,
        title: 'Response Time',
        content: <p className="text-sm text-gray-600">Typically within 24–48 hours</p>,
    },
    {
        icon: MessageSquare,
        title: 'Partnerships',
        content: (
            <a href="mailto:support@thecollectorsexchange.in" className="text-sm text-gray-600 hover:text-luxury-gold transition-colors break-words">
                support@thecollectorsexchange.in
            </a>
        ),
    },
];

const Contact = () => {
    const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
    const [sending, setSending] = useState(false);
    const [sent, setSent] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await apiClient.post('/contact', form);
            setSent(true);
        } catch {
            const mailto = `mailto:support@thecollectorsexchange.in?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
            window.location.href = mailto;
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-secondary-bg flex items-center justify-center px-4">
                <SEO title="Contact Us" description="Get in touch with The Collectors Exchange team. Email us at support@thecollectorsexchange.in for inquiries about buying, selling, or partnerships." canonical="/contact" />
                <div className="text-center max-w-md mx-auto p-6 sm:p-12">
                    <CheckCircle size={48} className="mx-auto text-green-500 mb-6 sm:w-16 sm:h-16" />
                    <h1 className="text-2xl sm:text-3xl font-serif mb-4">Message Sent</h1>
                    <p className="text-gray-500 mb-8 text-sm sm:text-base">Thank you for reaching out. Our team will respond within 24–48 hours.</p>
                    <a href="/" className="text-luxury-gold hover:underline font-medium">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-secondary-bg flex items-center">
            <SEO title="Contact Us" />
            <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 md:py-24">
                <div className="text-center mb-10 sm:mb-14 md:mb-16">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif mb-3 sm:mb-4">Contact Us</h1>
                    <p className="text-gray-500 text-base sm:text-lg font-light max-w-2xl mx-auto px-2">Have a question or need assistance? We're here to help.</p>
                </div>

                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8 mb-12 sm:mb-16 max-w-5xl mx-auto">
                    {cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={i}
                                className="bg-white rounded-lg p-6 sm:p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col items-center justify-center min-h-[180px] sm:min-h-[220px]"
                            >
                                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-4 sm:mb-5 shrink-0">
                                    <Icon size={22} className="text-luxury-gold sm:w-7 sm:h-7" />
                                </div>
                                <h3 className="font-serif text-base sm:text-lg font-medium mb-2">{card.title}</h3>
                                <div className="max-w-full">{card.content}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-lg p-6 sm:p-8 md:p-12 shadow-sm border border-gray-100 max-w-3xl mx-auto">
                    <h2 className="text-xl sm:text-2xl font-serif mb-6 sm:mb-8 text-center">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-6">
                        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2">Name</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded text-sm sm:text-base" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2">Email</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded text-sm sm:text-base" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2">Subject</label>
                            <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded text-sm sm:text-base" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-1.5 sm:mb-2">Message</label>
                            <textarea required rows={5} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full p-3 sm:p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors leading-relaxed rounded text-sm sm:text-base" />
                        </div>
                        <button type="submit" disabled={sending}
                            className="bg-black text-white px-8 sm:px-10 py-3 sm:py-4 text-xs sm:text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 w-full sm:w-auto sm:mx-auto rounded">
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </section>
    );
};

export default Contact;

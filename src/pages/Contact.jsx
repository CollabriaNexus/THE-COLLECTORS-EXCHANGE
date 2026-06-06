import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Clock, Send, Loader2, CheckCircle } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';

const cards = [
    {
        icon: Mail,
        title: 'Email',
        content: (
            <a href="mailto:support@collectorsexchange.in" className="text-sm text-gray-600 hover:text-luxury-gold transition-colors break-words">
                support@collectorsexchange.in
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
            <a href="mailto:partnerships@thecollectors.exchange" className="text-sm text-gray-600 hover:text-luxury-gold transition-colors break-words">
                partnerships@thecollectors.exchange
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
            const mailto = `mailto:support@collectorsexchange.in?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
            window.location.href = mailto;
        } finally {
            setSending(false);
        }
    };

    if (sent) {
        return (
            <div className="min-h-screen bg-secondary-bg flex items-center justify-center">
                <Helmet><title>Contact Us — The Collectors Exchange</title></Helmet>
                <div className="text-center max-w-md mx-auto p-12">
                    <CheckCircle size={64} className="mx-auto text-green-500 mb-6" />
                    <h1 className="text-3xl font-serif mb-4">Message Sent</h1>
                    <p className="text-gray-500 mb-8">Thank you for reaching out. Our team will respond within 24–48 hours.</p>
                    <a href="" className="text-luxury-gold hover:underline font-medium">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen bg-secondary-bg flex items-center">
            <Helmet><title>Contact Us — The Collectors Exchange</title></Helmet>
            <div className="w-full container mx-auto px-4 sm:px-6 lg:px-8 py-16 md:py-24">
                <div className="text-center mb-14 md:mb-16">
                    <h1 className="text-4xl md:text-5xl font-serif mb-4">Contact Us</h1>
                    <p className="text-gray-500 text-lg font-light max-w-2xl mx-auto">Have a question or need assistance? We're here to help.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-6 lg:gap-8 mb-16 max-w-5xl mx-auto">
                    {cards.map((card, i) => {
                        const Icon = card.icon;
                        return (
                            <div
                                key={i}
                                className="bg-white rounded-lg p-8 text-center shadow-sm hover:shadow-md transition-shadow duration-300 border border-gray-100 flex flex-col items-center justify-center min-h-[220px]"
                            >
                                <div className="w-14 h-14 rounded-full bg-luxury-gold/10 flex items-center justify-center mb-5 shrink-0">
                                    <Icon size={28} className="text-luxury-gold" />
                                </div>
                                <h3 className="font-serif text-lg font-medium mb-2">{card.title}</h3>
                                <div className="max-w-full">{card.content}</div>
                            </div>
                        );
                    })}
                </div>

                <div className="bg-white rounded-lg p-8 md:p-12 shadow-sm border border-gray-100 max-w-3xl mx-auto">
                    <h2 className="text-2xl font-serif mb-8 text-center">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                            <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors rounded" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                            <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold transition-colors leading-relaxed rounded" />
                        </div>
                        <button type="submit" disabled={sending}
                            className="bg-black text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2 w-full md:w-auto md:mx-auto rounded">
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

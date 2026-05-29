import React, { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Mail, MessageSquare, Send, Loader2, CheckCircle } from 'lucide-react';
import apiClient from '../hooks/api/apiClient';

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
            // Fall back to mailto
            const mailto = `mailto:support@collectorsexchange.com?subject=${encodeURIComponent(form.subject)}&body=${encodeURIComponent(`From: ${form.name} (${form.email})\n\n${form.message}`)}`;
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
                    <a href="/THE-COLLECTORS-EXCHANGE" className="text-luxury-gold hover:underline font-medium">Return Home</a>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary-bg">
            <Helmet><title>Contact Us — The Collectors Exchange</title></Helmet>
            <div className="container mx-auto py-20 px-6 max-w-2xl">
                <div className="text-center mb-12">
                    <h1 className="text-4xl font-serif mb-4">Contact Us</h1>
                    <p className="text-gray-500 font-light">Have a question or need assistance? We're here to help.</p>
                </div>

                <div className="grid md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white p-6 text-center shadow-sm border border-gray-100">
                        <Mail size={28} className="mx-auto text-luxury-gold mb-3" />
                        <h3 className="font-serif font-medium mb-2">Email</h3>
                        <a href="mailto:support@collectorsexchange.com" className="text-sm text-gray-600 hover:text-luxury-gold">support@collectorsexchange.com</a>
                    </div>
                    <div className="bg-white p-6 text-center shadow-sm border border-gray-100">
                        <MessageSquare size={28} className="mx-auto text-luxury-gold mb-3" />
                        <h3 className="font-serif font-medium mb-2">Response Time</h3>
                        <p className="text-sm text-gray-600">Typically within 24–48 hours</p>
                    </div>
                    <div className="bg-white p-6 text-center shadow-sm border border-gray-100">
                        <Mail size={28} className="mx-auto text-luxury-gold mb-3" />
                        <h3 className="font-serif font-medium mb-2">Partnerships</h3>
                        <a href="mailto:partnerships@thecollectors.exchange" className="text-sm text-gray-600 hover:text-luxury-gold">partnerships@thecollectors.exchange</a>
                    </div>
                </div>

                <div className="bg-white p-10 shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-serif mb-6">Send us a message</h2>
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Name</label>
                                <input type="text" required value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Email</label>
                                <input type="email" required value={form.email} onChange={e => setForm({ ...form, email: e.target.value })}
                                    className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Subject</label>
                            <input type="text" required value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold" />
                        </div>
                        <div>
                            <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">Message</label>
                            <textarea required rows={6} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })}
                                className="w-full p-4 bg-gray-50 border border-gray-200 focus:outline-none focus:border-luxury-gold leading-relaxed" />
                        </div>
                        <button type="submit" disabled={sending}
                            className="bg-black text-white px-10 py-4 text-sm uppercase tracking-widest hover:bg-luxury-gold transition-colors flex items-center justify-center gap-2">
                            {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                            Send Message
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Contact;

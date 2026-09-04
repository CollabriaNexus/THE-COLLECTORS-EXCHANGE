import React, { useState, useMemo } from 'react';
import {
  Search,
  Mail,
  ArrowLeft,
  CheckCircle,
  Send,
  Eye,
  Funnel,
  Clock,
  Inbox,
  FileCheck,
  Reply,
  Loader2,
  User as UserIcon,
} from 'lucide-react';
import {
  useContactMessages,
  useContactMessageDetail,
  useUpdateContactMessage,
} from '../hooks/api/useVendors';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatusBadge from '../components/ui/StatusBadge';
import ErrorState from '../components/ui/ErrorState';
import { getErrorMessage } from '../utils/apiError';

const STATUS_FILTERS = [
  { key: 'ALL', label: 'All', Icon: Inbox },
  { key: 'UNREAD', label: 'Unread', Icon: Mail },
  { key: 'READ', label: 'Read', Icon: FileCheck },
];

const statusBadgeForMessage = (msg) => {
  if (msg?.status === 'REPLIED') {
    return <StatusBadge status="Approved" overrideLabel="REPLIED" />;
  }
  if (msg?.read) return <StatusBadge status="Pending" overrideLabel="READ" />;
  return <StatusBadge status="Under_Review" overrideLabel="UNREAD" />;
};

function ContactMessages() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedId, setSelectedId] = useState(null);

  const queryFilters = useMemo(() => {
    const f = {};
    if (search.trim()) f.search = search.trim();
    if (statusFilter !== 'ALL') f.status = statusFilter;
    return f;
  }, [search, statusFilter]);

  const {
    data: inbox,
    isLoading,
    isError,
    error: inboxError,
    refetch,
    isFetching,
  } = useContactMessages(queryFilters);
  const {
    data: detail,
    isLoading: detailLoading,
    isError: detailIsError,
    error: detailError,
  } = useContactMessageDetail(selectedId);
  const updateMutation = useUpdateContactMessage();

  const [replyText, setReplyText] = useState('');
  const [sending, setSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const rows = inbox?.data ?? [];
  const total = inbox?.total ?? rows.length;

  const handleMarkAsRead = async (id, isRead) => {
    setErrorMsg('');
    try {
      await updateMutation.mutateAsync({ id, read: isRead });
    } catch (err) {
      // Was a bare `catch {}` — a failed read/unread toggle looked identical to
      // a successful one, so the operator had no idea the flag never changed.
      setErrorMsg(
        getErrorMessage(err, `Could not mark this message as ${isRead ? 'read' : 'unread'}.`),
      );
    }
  };

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedId) return;
    setSending(true);
    setErrorMsg('');
    try {
      await updateMutation.mutateAsync({
        id: selectedId,
        replyText: replyText.trim(),
      });
      setSuccessMsg('Reply saved. Wire up email delivery (SMTP/SES) for live sends.');
      setReplyText('');
      setTimeout(() => setSuccessMsg(''), 6000);
    } catch (err) {
      // A failure used to be written into successMsg, i.e. rendered inside the
      // GREEN success banner — "Failed to send reply." styled as a success.
      setErrorMsg(
        getErrorMessage(err, 'Failed to save the reply. Your draft is still in the box below.'),
      );
    } finally {
      setSending(false);
    }
  };

  // Master detail layout
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-serif font-bold text-heritage-charcoal">Contact Messages</h2>
          <p className="text-gray-600 mt-2">
            View, filter and reply to website contact form submissions
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <Inbox size={14} className="text-heritage-charcoal" />
            <span className="font-medium">Total: {isLoading ? '...' : total}</span>
          </div>
        </div>
      </div>

      {successMsg && (
        <div
          role="status"
          className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-md text-sm"
        >
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div
          role="alert"
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md text-sm"
        >
          {errorMsg}
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-lg shadow-heritage p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex gap-2 items-center">
          <Funnel size={18} className="text-gray-400" />
          {STATUS_FILTERS.map(({ key, label, Icon }) => {
            const active = statusFilter === key;
            return (
              <button
                key={key}
                onClick={() => setStatusFilter(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs uppercase tracking-widest font-bold transition-colors ${
                  active
                    ? 'bg-luxury-gold text-white shadow'
                    : 'text-gray-600 bg-gray-50 hover:bg-gray-100'
                }`}
              >
                <Icon size={12} />
                {label}
              </button>
            );
          })}
        </div>
        <div className="relative w-full md:w-96">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none"
            placeholder="Search by name, email, subject, message..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Master / Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2 bg-white rounded-lg shadow-heritage overflow-hidden">
          {isLoading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : isError ? (
            <ErrorState
              error={inboxError}
              title="Could not load the inbox"
              onRetry={refetch}
              isRetrying={isFetching}
            />
          ) : rows.length === 0 ? (
            <div className="text-center py-20 bg-gray-50">
              <Mail className="mx-auto text-gray-300 mb-4" size={48} />
              <h3 className="text-lg font-medium text-gray-900">No messages found</h3>
              <p className="text-gray-500 text-sm mt-1">
                {search || statusFilter !== 'ALL'
                  ? 'Try clearing filters'
                  : 'Contact form submissions will appear here.'}
              </p>
            </div>
          ) : (
            <ul className="divide-y divide-gray-100 max-h-[70vh] overflow-y-auto">
              {rows.map((msg) => {
                const selected = selectedId === msg.id;
                return (
                  <li
                    key={msg.id}
                    onClick={() => setSelectedId(msg.id)}
                    className={`cursor-pointer p-4 transition-colors ${
                      selected
                        ? 'bg-luxury-gold/10 border-l-4 border-l-luxury-gold'
                        : 'hover:bg-gray-50 border-l-4 border-l-transparent'
                    } ${msg.read ? '' : 'bg-gradient-to-r from-amber-50/60 to-transparent'}`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <p className="font-medium text-heritage-charcoal text-sm truncate">
                        {msg.name}{' '}
                        {!msg.read && (
                          <span className="ml-1 inline-block w-2 h-2 rounded-full bg-rose-500 align-middle" />
                        )}
                      </p>
                      <span className="shrink-0 text-xs text-gray-500">
                        {new Date(msg.createdAt).toLocaleDateString('en-IN')}
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 mb-1 truncate">
                      <UserIcon size={10} className="inline mr-1 opacity-60" />
                      {msg.email}
                    </p>
                    <p className="text-xs text-gray-700 font-semibold truncate">{msg.subject}</p>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">{msg.message}</p>
                    <div className="mt-2">{statusBadgeForMessage(msg)}</div>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="lg:col-span-3 bg-white rounded-lg shadow-heritage p-6 min-h-[500px]">
          {!selectedId ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <Eye size={48} className="mb-3 opacity-60" />
              <p className="text-sm">Select a message from the list to preview & reply</p>
            </div>
          ) : detailLoading ? (
            <div className="py-20 flex items-center justify-center">
              <LoadingSpinner />
            </div>
          ) : detailIsError ? (
            <ErrorState error={detailError} title="Could not load this message" />
          ) : !detail ? (
            <div className="py-20 text-center text-gray-500">Message not found</div>
          ) : (
            <div className="flex flex-col h-full">
              <div className="mb-6 pb-6 border-b border-gray-100 space-y-3">
                <div className="flex items-start justify-between">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="lg:hidden text-xs text-gray-600 flex items-center gap-1 hover:text-luxury-gold mb-3"
                  >
                    <ArrowLeft size={14} /> Back to list
                  </button>
                  <div className="ml-auto flex items-center gap-2">
                    {statusBadgeForMessage(detail)}
                    {detail.repliedAt && (
                      <span className="text-xs text-gray-500 flex items-center gap-1">
                        <Clock size={10} />
                        Replied {new Date(detail.repliedAt).toLocaleString('en-IN')}
                      </span>
                    )}
                  </div>
                </div>
                <h3 className="text-xl font-serif font-bold text-heritage-charcoal">
                  {detail.subject}
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">From</p>
                    <p className="font-medium text-heritage-charcoal">{detail.name}</p>
                    <a
                      href={`mailto:${detail.email}`}
                      className="text-xs text-luxury-gold hover:underline"
                    >
                      {detail.email}
                    </a>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Received</p>
                    <p className="font-medium text-heritage-charcoal">
                      {new Date(detail.createdAt).toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs uppercase tracking-wider mb-1">Actions</p>
                    <div className="flex gap-2 flex-wrap">
                      <button
                        onClick={() => handleMarkAsRead(detail.id, true)}
                        disabled={detail.read}
                        className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 flex items-center gap-1 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        <CheckCircle size={12} /> Mark Read
                      </button>
                      <button
                        onClick={() => handleMarkAsRead(detail.id, false)}
                        disabled={!detail.read}
                        className="px-2.5 py-1 text-xs rounded-md border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
                      >
                        Mark Unread
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Original message */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg border border-gray-100">
                <p className="whitespace-pre-wrap text-sm text-heritage-charcoal leading-relaxed">
                  {detail.message}
                </p>
              </div>

              {/* Previous reply (if any) */}
              {detail.replyText && (
                <div className="mb-6 p-4 bg-luxury-gold/5 rounded-lg border border-luxury-gold/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Reply size={14} className="text-luxury-gold" />
                    <p className="text-xs uppercase tracking-widest text-luxury-gold font-bold">
                      Previous Reply
                    </p>
                    <span className="text-xs text-gray-500 ml-auto">
                      by {detail.repliedBy || 'admin'}
                    </span>
                  </div>
                  <p className="whitespace-pre-wrap text-sm text-heritage-charcoal">
                    {detail.replyText}
                  </p>
                </div>
              )}

              {/* Reply area */}
              <div className="mt-auto border-t border-gray-100 pt-4">
                <label className="text-xs uppercase tracking-widest text-gray-500 font-bold mb-2 block">
                  <Send size={12} className="inline mr-1" />
                  Reply
                </label>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  rows={5}
                  placeholder={`Dear ${detail.name},\n\nThank you for reaching out...`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-luxury-gold focus:border-transparent outline-none text-sm resize-y"
                />
                <div className="flex items-center justify-between mt-3">
                  <p className="text-xs text-gray-500">
                    Tip: Click send to persist the reply. Integrate an SMTP provider (Zoho/SES) to
                    email the reply live.
                  </p>
                  <button
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending || updateMutation.isPending}
                    className="flex items-center gap-2 px-4 py-2 bg-black text-white text-xs uppercase tracking-widest hover:bg-luxury-gold transition-colors disabled:opacity-40 disabled:cursor-not-allowed rounded-md"
                  >
                    {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    {sending ? 'Sending...' : 'Send Reply'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ContactMessages;

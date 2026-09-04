import React, { useCallback, useEffect, useState } from 'react';
import { FileText, Image as ImageIcon, Loader2, AlertTriangle } from 'lucide-react';
import {
  isLegacyPublicKycUrl,
  isPdfKycDocument,
  needsSignedKycUrl,
  resolveKycDocumentUrl,
} from '../utils/kycDocuments';

const DOC_URL_FIELDS = ['aadhaarDoc', 'panDoc', 'gstDoc', 'incorporationDoc'];
const AGREEMENT_FIELDS = ['agreementAccepted', 'agreementSignedByName', 'agreementSignedAt'];
const SKIP_FIELDS = ['_', 'adminNotes', 'rejectionReason'];

/**
 * Renders one stored KYC document reference.
 *
 * ANY reference into the `kyc-documents` bucket now needs signing - a private
 * storage path AND a legacy public URL alike, since a public URL into a private
 * bucket 403s. Both go through `resolveDocUrl` (loading / error / retry states
 * below). Only a URL pointing outside that bucket still resolves synchronously,
 * which is why an external image keeps rendering with no request at all.
 */
function KycDocumentPreview({ label, reference, resolveDocUrl }) {
  const needsSigning = needsSignedKycUrl(reference);
  const directUrl = !needsSigning && isLegacyPublicKycUrl(reference) ? reference.trim() : null;

  const [url, setUrl] = useState(directUrl);
  const [status, setStatus] = useState(directUrl ? 'ready' : 'idle');

  const load = useCallback(async () => {
    if (!needsSigning || typeof resolveDocUrl !== 'function') return;
    setStatus('loading');
    try {
      const resolved = await resolveKycDocumentUrl(reference, resolveDocUrl);
      if (!resolved) throw new Error('No URL returned');
      setUrl(resolved);
      setStatus('ready');
    } catch {
      setUrl(null);
      setStatus('error');
    }
  }, [needsSigning, reference, resolveDocUrl]);

  useEffect(() => {
    load();
  }, [load]);

  const isPdf = isPdfKycDocument(reference);

  return (
    <div className="border border-gray-200 rounded-md overflow-hidden bg-white">
      <div className="p-3 bg-gray-50 border-b border-gray-200">
        <span className="text-xs font-semibold uppercase tracking-wider text-gray-600">
          {label}
        </span>
      </div>
      <div className="p-3">
        {status === 'ready' && url ? (
          isPdf ? (
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-luxury-gold hover:underline text-sm"
            >
              <FileText size={20} /> View PDF Document
            </a>
          ) : (
            <a href={url} target="_blank" rel="noopener noreferrer">
              <img
                src={url}
                alt={label}
                className="max-h-40 w-full object-contain bg-gray-50 rounded border border-gray-100"
                onError={(e) => {
                  e.target.style.display = 'none';
                }}
              />
            </a>
          )
        ) : status === 'loading' ? (
          <span className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 size={16} className="animate-spin" /> Preparing secure link...
          </span>
        ) : status === 'error' ? (
          <div className="space-y-2">
            <span className="flex items-center gap-2 text-sm text-red-600">
              <AlertTriangle size={16} /> Could not open document
            </span>
            <button
              type="button"
              onClick={load}
              className="text-xs text-luxury-gold hover:underline"
            >
              Try again
            </button>
          </div>
        ) : (
          <span className="text-sm text-gray-500">
            Stored privately — open from the KYC review screen
          </span>
        )}
      </div>
    </div>
  );
}

/**
 * @param {object} props
 * @param {object} props.kycData
 * @param {(path: string) => Promise<string>} [props.resolveDocUrl] resolver that
 *   exchanges a private storage path for a short-lived signed URL. Built with
 *   `createKycDocumentResolver(userId, apiClient)`. Without it only legacy
 *   public-URL references can be displayed.
 */
function KYCDataDisplay({ kycData, resolveDocUrl }) {
  if (!kycData || typeof kycData !== 'object') {
    return <p className="text-gray-500">No KYC data available</p>;
  }

  if (Object.keys(kycData).length === 0) {
    return <p className="text-gray-500">No KYC data submitted</p>;
  }

  return (
    <div className="space-y-6">
      {/* Document Previews */}
      {DOC_URL_FIELDS.some((f) => kycData[f]) && (
        <div>
          <h4 className="text-sm font-bold text-heritage-charcoal uppercase tracking-wider mb-3">
            Uploaded Documents
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {DOC_URL_FIELDS.map((field) => {
              const reference = kycData[field];
              if (!reference) return null;
              const label = field
                .replace('Doc', '')
                .replace(/([A-Z])/g, ' $1')
                .trim();
              return (
                <KycDocumentPreview
                  key={field}
                  label={label}
                  reference={reference}
                  resolveDocUrl={resolveDocUrl}
                />
              );
            })}
          </div>
        </div>
      )}

      {/* Agreement Status */}
      {kycData.agreementAccepted && (
        <div className="bg-green-50 border border-green-200 rounded-md p-4">
          <h4 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-2">
            Seller Agreement
          </h4>
          <div className="space-y-1 text-sm text-green-700">
            <p>
              Signed by: <strong>{kycData.agreementSignedByName || 'Unknown'}</strong>
            </p>
            {kycData.agreementSignedAt && (
              <p>Signed on: {new Date(kycData.agreementSignedAt).toLocaleString()}</p>
            )}
          </div>
        </div>
      )}

      {/* Other KYC Fields */}
      <div className="space-y-4">
        {Object.entries(kycData).map(([key, value]) => {
          if (
            SKIP_FIELDS.some((s) => key.startsWith(s)) ||
            DOC_URL_FIELDS.includes(key) ||
            AGREEMENT_FIELDS.includes(key)
          ) {
            return null;
          }

          return (
            <div key={key} className="border-b border-gray-200 pb-3">
              <dt className="text-sm font-semibold text-heritage-dark capitalize mb-1">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </dt>
              <dd className="text-sm text-gray-700">
                {/* Only an external URL is still directly openable; a
                                    KYC-bucket URL here would be a dead 403 link now
                                    that the bucket is private, so it renders as text. */}
                {isLegacyPublicKycUrl(value) && !needsSignedKycUrl(value) ? (
                  <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-luxury-gold hover:underline flex items-center gap-1"
                  >
                    <ImageIcon size={14} /> View Document
                  </a>
                ) : typeof value === 'object' ? (
                  JSON.stringify(value, null, 2)
                ) : (
                  String(value)
                )}
              </dd>
            </div>
          );
        })}
      </div>

      {/* Admin Notes */}
      {kycData.adminNotes && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mt-4">
          <dt className="text-sm font-semibold text-blue-800 mb-2">Admin Notes</dt>
          <dd className="text-sm text-blue-700">{kycData.adminNotes}</dd>
        </div>
      )}

      {/* Rejection Reason */}
      {kycData.rejectionReason && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mt-4">
          <dt className="text-sm font-semibold text-red-800 mb-2">Rejection Reason</dt>
          <dd className="text-sm text-red-700">{kycData.rejectionReason}</dd>
        </div>
      )}
    </div>
  );
}

export default KYCDataDisplay;

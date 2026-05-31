import React from 'react';
import { Upload, ImageIcon } from 'lucide-react';

const DocUploadField = ({ label, placeholder, value, docUrl, docType, uploading, onValueChange, onFileUpload, hideTextInput }) => (
    <div className="mb-6 last:mb-0">
        <label className="block text-xs font-bold uppercase tracking-widest text-gray-500 mb-2">{label}</label>
        <div className="flex gap-3 items-start">
            <div className="flex-grow space-y-2">
                {placeholder && !hideTextInput && (
                    <input
                        type="text"
                        placeholder={placeholder}
                        value={value || ''}
                        onChange={(e) => onValueChange(e.target.value)}
                        className="w-full p-4 border border-gray-300 focus:outline-none focus:border-luxury-gold"
                    />
                )}
                <div className="flex gap-2 items-center">
                    <label className={`flex items-center gap-2 px-4 py-3 border border-dashed border-gray-300 cursor-pointer hover:border-luxury-gold transition-colors text-sm ${uploading ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Upload size={16} className="text-gray-400" />
                        <span className="text-gray-500">{uploading ? 'Uploading...' : docUrl ? 'Replace Scan' : 'Upload Scanned Copy'}</span>
                        <input type="file" accept="image/*,application/pdf" className="hidden"
                            disabled={uploading}
                            onChange={(e) => {
                                const file = e.target.files?.[0];
                                if (file) onFileUpload(file);
                                e.target.value = '';
                            }}
                        />
                    </label>
                    {docUrl && (
                        <a href={docUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-luxury-gold hover:underline flex items-center gap-1">
                            <ImageIcon size={14} /> View
                        </a>
                    )}
                </div>
            </div>
        </div>
    </div>
);

export default DocUploadField;

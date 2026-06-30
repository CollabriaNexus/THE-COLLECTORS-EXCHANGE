import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
    plugins: [react()],
    server: {
        port: 5174,
    },
    build: {
        rollupOptions: {
            output: {
                manualChunks: {
                    tiptap: ['@tiptap/react', '@tiptap/starter-kit', '@tiptap/extension-image', '@tiptap/extension-link', '@tiptap/extension-placeholder', '@tiptap/extension-character-count'],
                },
            },
        },
    },
});

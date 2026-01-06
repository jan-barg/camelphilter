import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';
import basicSsl from '@vitejs/plugin-basic-ssl';

export default defineConfig(({ mode }) => ({
	plugins: [
		tailwindcss(),
		sveltekit(),
		// Add SSL plugin only in https mode
		...(mode === 'https' ? [basicSsl()] : [])
	],
	test: {
		include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/tests/e2e/**/*'],
		environment: 'jsdom',
		globals: true
	}
}));

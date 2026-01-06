import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit()],
	test: {
		include: ['src/tests/unit/**/*.{test,spec}.{js,ts}'],
		exclude: ['src/tests/e2e/**/*'],
		environment: 'jsdom',
		globals: true
	}
});

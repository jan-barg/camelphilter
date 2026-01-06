/**
 * Filter Store
 * Manages the currently selected filter.
 */

import { writable, derived, type Readable } from 'svelte/store';
import { filters, type FilterDefinition, type FilterFunction } from '$lib/engine/filters';

/**
 * Currently selected filter definition.
 * Defaults to 'None' (identity filter).
 */
export const currentFilter = writable<FilterDefinition>(filters[0]);

/**
 * Derived store: just the filter function for easy access.
 */
export const currentFilterFn: Readable<FilterFunction> = derived(
	currentFilter,
	($filter) => $filter.apply
);

/**
 * Set the current filter by name.
 */
export function setFilterByName(name: string): void {
	const filter = filters.find((f) => f.name === name);
	if (filter) {
		currentFilter.set(filter);
	}
}

/**
 * Set the current filter by index.
 */
export function setFilterByIndex(index: number): void {
	if (index >= 0 && index < filters.length) {
		currentFilter.set(filters[index]);
	}
}

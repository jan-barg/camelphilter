<script lang="ts">
	import { slide } from 'svelte/transition';
	import { cubicOut } from 'svelte/easing';
	import { CircleOff, Sun, Tv, Grid3x3, Type, ChevronDown } from 'lucide-svelte';
	import { filters, type FilterDefinition } from '$lib/engine/filters';
	import { currentFilter } from '$lib/stores/filter';

	type LucideIcon = typeof CircleOff;

	let isOpen = $state(false);

	const iconMap: Record<string, LucideIcon> = {
		'circle-off': CircleOff,
		sun: Sun,
		tv: Tv,
		'grid-3x3': Grid3x3,
		type: Type
	};

	function getIcon(iconName: string): LucideIcon {
		return iconMap[iconName] ?? CircleOff;
	}

	function handleSelect(filter: FilterDefinition) {
		currentFilter.set(filter);
		isOpen = false;
	}

	function handleToggle() {
		isOpen = !isOpen;
	}

	function handleKeydown(event: KeyboardEvent) {
		if (event.key === 'Escape') {
			isOpen = false;
		}
	}

	// Derive current icon component
	let CurrentIcon = $derived(getIcon($currentFilter.icon));
</script>

{#snippet filterIcon(iconName: string)}
	{@const Icon = getIcon(iconName)}
	<Icon size={20} />
{/snippet}

<svelte:window onkeydown={handleKeydown} />

<div class="flex flex-col" data-testid="filter-dropdown">
	<!-- Trigger Button -->
	<button
		onclick={handleToggle}
		class="glass-panel flex items-center gap-3 px-4 py-3 rounded-liquid cursor-pointer
			hover:bg-white/40 transition-colors min-w-[180px]"
		aria-expanded={isOpen}
		aria-haspopup="listbox"
	>
		<span class="text-indigo-velvet">
			<CurrentIcon size={20} />
		</span>
		<span class="flex-1 text-left font-medium text-dark-amethyst">{$currentFilter.name}</span>
		<span
			class="text-lavender-purple transition-transform duration-200"
			class:rotate-180={isOpen}
		>
			<ChevronDown size={18} />
		</span>
	</button>

	<!-- Dropdown Menu (flows in document, pushes content down) -->
	{#if isOpen}
		<div
			class="mt-2 glass-panel rounded-liquid overflow-hidden"
			role="listbox"
			transition:slide={{ duration: 200, easing: cubicOut }}
		>
			{#each filters as filter}
				<button
					onclick={() => handleSelect(filter)}
					class="w-full flex items-center gap-3 px-4 py-3 text-left
						hover:bg-royal-violet/20 transition-colors cursor-pointer
						{$currentFilter.name === filter.name ? 'bg-royal-violet/10' : ''}"
					role="option"
					aria-selected={$currentFilter.name === filter.name}
				>
					<span class="text-indigo-velvet">
						{@render filterIcon(filter.icon)}
					</span>
					<span class="font-medium text-dark-amethyst">{filter.name}</span>
					{#if $currentFilter.name === filter.name}
						<span class="ml-auto text-pumpkin-spice text-sm">Active</span>
					{/if}
				</button>
			{/each}
		</div>
	{/if}
</div>

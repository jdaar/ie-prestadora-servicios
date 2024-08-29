<script lang="ts">
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
	import { Option } from "effect";

	type FieldOption = {
		value: string,
		label: string
	}

	let { options, label = "Unnamed column", selected = $bindable(Option.none()) } = $props() as {
		label: string,
		options: Array<FieldOption>,
		selected: Option.Option<string>
	};
 

	let unparsedValue = $state<string | undefined>(undefined)
  $effect(() => {selected = Option.fromNullable(unparsedValue)})
</script>
 
<ContextMenu.Root>
  <ContextMenu.Trigger class="unselectable">
		<slot />
  </ContextMenu.Trigger>
  <ContextMenu.Content class="w-64">
    <ContextMenu.RadioGroup bind:value={unparsedValue}>
		<ContextMenu.Item on:click={() => {unparsedValue = undefined}}>{label}<ContextMenu.Shortcut>Clear</ContextMenu.Shortcut></ContextMenu.Item>
      <ContextMenu.Separator />
			{#each options as option}
				<ContextMenu.RadioItem value={option.value}>{option.label}</ContextMenu.RadioItem>
			{/each}
    </ContextMenu.RadioGroup>
  </ContextMenu.Content>
</ContextMenu.Root>

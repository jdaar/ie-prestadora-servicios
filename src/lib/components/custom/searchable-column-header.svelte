<script lang="ts">
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
	import { Option } from "effect";
	import { Input } from "../ui/input";

	let { label = "Unnamed column", selected = $bindable(Option.none()) } = $props() as {
		label: string,
		selected: Option.Option<string>
	};
 

	let unparsedValue = $state<string | undefined>(undefined)
  $effect(() => {selected = Option.fromNullable(unparsedValue)})
</script>
 
<ContextMenu.Root>
  <ContextMenu.Trigger class="w-full unselectable">
		<slot />
  </ContextMenu.Trigger>
  <ContextMenu.Content class="w-64">
		<ContextMenu.Item on:click={() => {unparsedValue = undefined}}>{label}<ContextMenu.Shortcut>Clear</ContextMenu.Shortcut></ContextMenu.Item>
		<ContextMenu.Separator />
			<Input bind:value={unparsedValue}></Input>
  </ContextMenu.Content>
</ContextMenu.Root>

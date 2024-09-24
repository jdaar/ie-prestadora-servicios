<script lang="ts">
	import { connectedUser } from "@/application/state";
	import { buttonVariants } from "@/components/ui/button";
	import { Option } from "effect";

</script>

<main class="flex flex-col items-center justify-center w-full mt-5">
	{#if Option.isSome($connectedUser)}
		<div class="flex flex-col gap-5 items-center justify-center">
			<h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
				Modulos
			</h2>
			<div class="flex flex-col gap-2">
				<a href="/person" class={buttonVariants({variant: 'secondary'})}>Gestionar personas</a>
				<a href="/client" class={buttonVariants({variant: 'secondary'})}>Gestionar clientes</a>
			</div>
		</div>
	{/if}
</main>

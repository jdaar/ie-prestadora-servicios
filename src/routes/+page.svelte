<script lang="ts">
	import { connectedUser } from "@/application/state";
	import { buttonVariants } from "@/components/ui/button";
	import { Option } from "effect";

</script>

<main class="flex flex-col items-center justify-center w-full mt-5">
	{#if Option.isSome($connectedUser)}
		<div class="flex flex-col items-center justify-center">
			<h1 class="scroll-m-20 text-2xl font-extrabold tracking-tight lg:text-3xl w-fit">
				Bienvenido {$connectedUser.value.email}
			</h1>
			<p class="leading-7 [&:not(:first-child)]:mt-6 w-fit mb-5">
				Que quieres hacer el dia de hoy?
			</p>
			<div class="flex flex-col gap-2">
				<a href="/person" class={buttonVariants({variant: 'link'})}>Gestionar personas</a>
				<a href="/person" class={buttonVariants({variant: 'link'})}>Gestionar clientes</a>
			</div>
		</div>
	{/if}
</main>

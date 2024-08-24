<script lang="ts">
	import { concretize } from "@/application/application";
	import { Button, buttonVariants } from "@/components/ui/button";
	import { UserLogout } from "@/domain/use-cases/user-logout";
	import type { SupabaseClient } from "@supabase/supabase-js";
	import { Option } from "effect";
	import { connectedUser } from "@/application/state";

	let { client } = $props() as {
		client: SupabaseClient
	};

	const logoutCallback = () => concretize(client, UserLogout)
		.then(() => {$connectedUser = Option.none()});
</script>

<nav class="justify-between align-center p-5 w-full flex">
	<h4 class="scroll-m-20 text-xl text-center align-middle font-semibold tracking-tight">
		<a href="/">
			IE Prestadora de servicios
		</a>
	</h4>
	<section class="flex gap-5 justify-center items-center">
		{#if Option.isSome($connectedUser)}	
			<div class="flex gap-5 items-center">
				<a href="/person" class={buttonVariants({variant: 'link'})}>Personas</a>
				<Button variant="secondary" on:click={logoutCallback}>Cerrar sesion</Button>
			</div>
		{:else}
			<div class="flex gap-5">
				<a href="/login" class={buttonVariants({variant: 'secondary'})}>Iniciar sesion</a>
			</div>
		{/if}
	</section>
</nav>

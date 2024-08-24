<script lang="ts">
	import { concretize } from "@/application/application";
	import { Button } from "@/components/ui/button";
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
		IE Prestadora de servicios
	</h4>
	<section class="flex gap-5 justify-center items-center">
		{#if Option.isSome($connectedUser)}	
			<small class="text-sm font-medium leading-none">
				{$connectedUser.value.email}
			</small>
			<Button on:click={logoutCallback}>Cerrar sesion</Button>
		{:else}
			<small class="text-sm font-medium leading-none">
				Usuario anonimo
			</small>
		{/if}
	</section>
</nav>

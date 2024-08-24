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

<nav class="justify-between p-5 w-full flex">
	<h1>IE Prestadora de servicios</h1>
	<section class="flex gap-5 justify-center items-center">
		{#if Option.isSome($connectedUser)}	
			<h1>{$connectedUser.value.email}</h1>
		{/if}
		<Button on:click={logoutCallback}>Log out</Button>
	</section>
</nav>

<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { concretize } from '@/application/application';
	import { UserLogin } from '@/domain/use-cases/user-login'
	import { UserSignUp } from '@/domain/use-cases/user-signup'
	import { UserLogout } from '@/domain/use-cases/user-logout'
	import { Effect, Option } from "effect";
	import { ConfigGatewayAdapter, ConfigGatewayLive } from "@/driven-adapters/config";
	import { GetConnectedUserDetails } from "@/domain/use-cases/get-connected-user-details"
	import { createClient } from "@supabase/supabase-js";
	import type { User } from "@/domain/models/user"

	let email = $state("")
	let password = $state("")
	let isLoggedIn = $state(false);
	let user = $state<Option.Option<Promise<User>>>(Option.none())

	const client = Effect.runSync(
		Effect.gen(function *(_) {
			const configGateway = yield *_(ConfigGatewayAdapter);
			return createClient(
				configGateway.supabaseClient,
				configGateway.supabaseSecret,
				{}
			)
		}).pipe(
			Effect.provide(ConfigGatewayLive)
		)
	)
	const signInCallback = () => concretize(client, UserLogin(email, password))
		.then(() => {isLoggedIn = true})
	const signUpCallback = () => concretize(client, UserSignUp(email, password));
	const logoutCallback = () => concretize(client, UserLogout)
		.then(() => {isLoggedIn = false});

	$effect(() => {
		isLoggedIn;
		user = Option.some(concretize(client, GetConnectedUserDetails))
	})
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="IE Prestadora de servicios" />
</svelte:head>

<section>
	{#if Option.isSome(user)}	
		{#await user.value}
			<h1>Retrieving email</h1>
		{:then value}
			<h1>{value.email}</h1>
		{/await}
	{/if}
	<input type="text" bind:value={email} />
	<input type="password" bind:value={password} />
	<Button on:click={signInCallback}>Sign in</Button>
	<Button on:click={signUpCallback}>Sign up</Button>
	<Button on:click={logoutCallback}>Log out</Button>
</section>

<style>
</style>

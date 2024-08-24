<script lang="ts">
	import { concretize } from '@/application/application';
	import { UserLogin } from '@/domain/use-cases/user-login'
	import Button from '@/components/ui/button/button.svelte';
	import Navbar from '@/components/custom/navbar.svelte';
	import { connectedUser } from '@/application/state.js';
	import { GetConnectedUser } from '@/domain/use-cases/get-connected-user.js';
	import { Option } from 'effect';

	const { data } = $props();
	const client = data.client;

	let email = $state("")
	let password = $state("")

	const signInCallback = () => concretize(client, UserLogin(email, password))
		.then(() => {
			concretize(client, GetConnectedUser)
				.then((user) => {$connectedUser = Option.some(user)})
		});
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="IE Prestadora de servicios" />
</svelte:head>

<Navbar {client} />
<section>
	<input type="text" bind:value={email} />
	<input type="password" bind:value={password} />
	<Button on:click={signInCallback}>Sign in</Button>
</section>

<style>
</style>

<script lang="ts">
	import { concretize } from '@/application/application';
	import { UserLogin } from '@/domain/use-cases/user-login'
	import Button from '@/components/ui/button/button.svelte';
	import Input from '@/components/ui/input/input.svelte';
	import { Card, CardTitle, CardContent, CardHeader } from '@/components/ui/card/index.js';
	import { connectedUser } from '@/application/state.js';
	import { GetConnectedUser } from '@/domain/use-cases/get-connected-user.js';
	import { Option } from 'effect';
	import { toast } from 'svelte-sonner';
	import { Label } from '@/components/ui/label/index.js';
	import { goto } from '$app/navigation';

	const { data } = $props();
	const client = data.client;

	let email = $state("")
	let password = $state("")

	const signInCallback = () => concretize(client, UserLogin(email, password))
		.then(() => {
			concretize(client, GetConnectedUser)
				.then((user) => {$connectedUser = Option.some(user); goto('/')})
			password = "";
		})
		.catch(() => {
			toast.error("No se pudo iniciar sesion")
		})
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="IE Prestadora de servicios" />
</svelte:head>

<main class="w-full mt-10 flex justify-center">
	{#if Option.isNone($connectedUser)}
		<Card class="w-1/2">
			<CardHeader>
				<CardTitle>Iniciar sesion</CardTitle>
			</CardHeader>
			<CardContent>
				<form on:submit|preventDefault={signInCallback} class="flex flex-col gap-5">
					<fieldset class="flex flex-col gap-2.5">
						<Label for="email">Correo</Label>
						<Input id="email" name="email" type="text" bind:value={email} />
					</fieldset>
					<fieldset class="flex flex-col gap-2.5">
						<Label for="password">Contraseña</Label>
						<Input id="password" name="password" type="password" bind:value={password} />
					</fieldset>
					<Button type="submit">Iniciar sesion</Button>
				</form>
			</CardContent>
		</Card>
	{/if}
</main>

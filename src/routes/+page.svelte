<script>
	import { Button } from "@/components/ui/button";
	import { concretize } from '@/application/application';
	import { UserLogin } from '@/domain/use-cases/user-login'

	const buttonCallback = () => concretize(UserLogin('jhonatandaar@gmail.com', '123456'));
</script>

<svelte:head>
	<title>Home</title>
	<meta name="description" content="Svelte demo app" />
</svelte:head>

<section>
	<Button on:click={buttonCallback}>Click me</Button>
</section>

<style>
</style>

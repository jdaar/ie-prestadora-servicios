<script>
	import '../app.css';
  import { Toaster } from "$lib/components/ui/sonner";
	import Navbar from '@/components/custom/navbar.svelte';

	const { data } = $props();
	const client = data.client;
</script>

<Toaster />
<Navbar {client} />
<div class="app">
	<main>
		<slot></slot>
	</main>
	<footer></footer>
</div>



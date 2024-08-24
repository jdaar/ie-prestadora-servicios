<script>
	import '../app.css';
  import { Toaster } from "$lib/components/ui/sonner";
</script>

<Toaster />
<div class="app">
	<main>
		<slot></slot>
	</main>
	<footer></footer>
</div>



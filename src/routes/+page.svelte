<script lang="ts">
	import { concretize } from "@/application/application";
	import { connectedUser } from "@/application/state";
	import { Button, buttonVariants } from "@/components/ui/button";
	import { GeneratePaymentReport } from "@/domain/use-cases/generate-payment-report.js";
	import { Option } from "effect";

	const { data } = $props();
	const client = data.client;

	const paymentsReportCallback = () => {
		concretize(client, GeneratePaymentReport)
	}
</script>

<main class="flex flex-col items-center justify-center w-full mt-5">
	{#if Option.isSome($connectedUser)}
		<div class="flex flex-col gap-5 items-center justify-center">
			<h2 class="mt-10 scroll-m-20 border-b pb-2 text-3xl font-semibold tracking-tight transition-colors first:mt-0">
				Modulos
			</h2>
			<div class="flex flex-col gap-2">
				<a href="/person" class={buttonVariants({variant: 'secondary'})}>Gestionar personas</a>
				<a href="/client" class={buttonVariants({variant: 'secondary'})}>Gestionar clientes</a>
				<Button variant="secondary" on:click={paymentsReportCallback}>Generar reporte de pagos</Button>
			</div>
		</div>
	{/if}
</main>

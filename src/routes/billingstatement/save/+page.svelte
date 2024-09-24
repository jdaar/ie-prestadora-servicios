<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { goto } from "$app/navigation";
	import { concretize } from "@/application/application.js";
	import { GetPerson } from "@/domain/use-cases/get-person.js";
	import { GetClientByPersonId } from "@/domain/use-cases/get-client-by-person-id.js";
	import { toast } from "svelte-sonner";
	import type { Service } from "@/domain/models/service.js";
	import { ZodError, z } from "zod";
	import { SaveBillingStatement } from "@/domain/use-cases/save-billing-statement.js";
	import { GetBillingStatement } from "@/domain/use-cases/get-billing-statement.js";

	const { data } = $props();
	const client = data.client;
	const personId = data.personId;
	const billingStatementId = data.billingStatementId;

	let total: number | undefined = $state(undefined)

	let personPromise = (async () => {
		try {
			const numericPersonId = parseInt(personId!);
			const person = await concretize(client, GetPerson(numericPersonId))
			return person.type == 'NATURAL' ? person.fullName : person.companyName;
		} catch {
			return "Persona no identificada"
		}
	})()

	let clientPromise = $derived.by(async () => {
		try {
			const numericPersonId = parseInt(personId!);
			return concretize(client, GetClientByPersonId(numericPersonId));
		} catch {
			return Promise.resolve(null);
		}
	})

	let billingStatementPromise = $derived.by(async () => {
		try {
			const numericBillingStatementId = parseInt(billingStatementId!);
			return concretize(client, GetBillingStatement(numericBillingStatementId));
		} catch {
			return Promise.resolve(null);
		}
	})

	const billingStatementFormSchema = z.object({
		id: z.number().optional(),
		total: z.number({message: 'El total es requerido'}),
	} as const)
	let validationErrors = $state<ZodError<Partial<Service>>>();

	const saveBillingStatementCallback = $derived(
		async () => {
			try {
				const billingStatement = await billingStatementFormSchema.safeParseAsync({
					id: billingStatementId ? parseInt(billingStatementId!) : undefined,
					total
				});

				if (billingStatement.error) {
					validationErrors = billingStatement.error;
				} else {
					const _client = await clientPromise
					const _billingStatement = await billingStatementPromise
					if (_client) {
						if (_billingStatement) {
							concretize(client, SaveBillingStatement({
								...billingStatement.data,
								clientId: _client.id,
								service: {
									..._billingStatement.service,
									cost: billingStatement.data.total
								}
							}))
								.then(() => {
									toast.info("Se actualizo la cuenta de cobro exitosamente");
								}).catch((err) => {
									toast.error(`No se pudo actualizar la cuenta de cobro: ${err}`);
								})
							validationErrors = undefined;
						} else {
							toast.error('La cuenta de cobro no existe');
						}
					} else {
						toast.error('La persona no cuenta con un cliente creado');
					}
				}
			} catch {
				toast.error('El id del servicio es invalido');
			}
		}
	)
</script>

<main class="p-5">
	<Card>
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>Crear servicio</CardTitle>
			<div class='flex gap-2.5'>
				<Button variant="outline" on:click={() => goto(`/client/${personId}`)}>Ir atras</Button>
				<Button variant="secondary" on:click={saveBillingStatementCallback}>Guardar</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<form class="flex flex-col gap-5">
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Id</Label>
						 <Input type="text" disabled value={billingStatementId}/>
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Persona</Label>
						 {#await personPromise}
							 <Input type="text" disabled value={"Cargando..."}/>
						 {:then person}
							 <Input type="text" disabled value={person}/>
						 {/await}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Total</Label>
						 <Input type="number" bind:value={total}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "total").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "total")[0].message}</small>
						 {/if}
					 </fieldset>
			</form>
		</CardContent>
	</Card>
</main>

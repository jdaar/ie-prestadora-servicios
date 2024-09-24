<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { goto } from "$app/navigation";
	import { concretize } from "@/application/application.js";
	import { SaveClient } from "@/domain/use-cases/save-client.js";
	import { toast } from "svelte-sonner";
	import { GetPerson } from "@/domain/use-cases/get-person.js";
	import { ZodError, z } from "zod";
	import type { Client } from "@/domain/models/client.js";

	const { data } = $props();
	const client = data.client;
	const personId = data.personId;

	let email: string | undefined = $state(undefined)

	let personPromise = (async () => {
		try {
			const numericPersonId = parseInt(personId!);
			const person = await concretize(client, GetPerson(numericPersonId))
			return person.type == 'NATURAL' ? person.fullName : person.companyName;
		} catch {
			return "Persona no identificada"
		}
	})()

	const clientFormSchema = z.object({
		email: z.string({ message: 'El correo electronico es requerido' }).regex(/^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/ig, 'El correo electronico no es valido')
	} as const)
	let validationErrors = $state<ZodError<Partial<Client>>>();

	const saveClientCallback = $derived(
		() => {
			try {
				const numericPersonId = parseInt(personId ?? "")

				const _client = clientFormSchema.safeParse({
					email
				})

				if (_client.error) {
					validationErrors = _client.error;
				} else {
					concretize(client, SaveClient(_client.data, numericPersonId))
						.then(() => toast.info("Se creo al cliente satisfactoriamente"))
						.catch((error) => {
							toast.error("No se pudo realizar esa accion");
							console.error(error)
						})
					validationErrors = undefined;
				}
			} catch {
				toast.error("No se pudo realizar esa accion: el id de la persona asociada es invalido");
			}
		}
	)
</script>

<main class="p-5">
	<Card>
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>Crear cliente</CardTitle>
			<div class='flex gap-2.5'>
				<Button variant="outline" on:click={() => goto('/person')}>Ir atras</Button>
				<Button variant="secondary" on:click={saveClientCallback}>Guardar</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<form class="flex flex-col gap-5">
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Persona</Label>
						 {#await personPromise}
							 <Input type="text" disabled value={"Cargando..."}/>
						 {:then person}
							 <Input type="text" disabled value={person}/>
						 {/await}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Correo electronico</Label>
						 <Input type="text" bind:value={email}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "email").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "email")[0].message}</small>
						 {/if}
					 </fieldset>
			</form>
		</CardContent>
	</Card>
</main>

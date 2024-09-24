<script lang="ts">
	import * as Select from "@/components/ui/select";
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
	import { Input } from "@/components/ui/input";
	import { Label } from "@/components/ui/label";
	import { goto } from "$app/navigation";
	import { concretize } from "@/application/application.js";
	import { GetPerson } from "@/domain/use-cases/get-person.js";
	import type { Selected } from "bits-ui";
	import { Option } from "effect";
	import { SaveService } from "@/domain/use-cases/save-service.js";
	import { GetClientByPersonId } from "@/domain/use-cases/get-client-by-person-id.js";
	import { toast } from "svelte-sonner";
	import type { Service } from "@/domain/models/service.js";
	import { ZodError, z } from "zod";
	import { GetService } from "@/domain/use-cases/get-service.js";

	const { data } = $props();
	const client = data.client;
	const personId = data.personId;
	const serviceId = data.serviceId;

	let concept: string | undefined = $state(undefined)
	let cost: number | undefined = $state(undefined)

	let personPromise = (async () => {
		try {
			const numericPersonId = parseInt(personId!);
			const person = await concretize(client, GetPerson(numericPersonId))
			return person.type == 'NATURAL' ? person.fullName : person.companyName;
		} catch {
			return "Persona no identificada"
		}
	})()

	const typeOptions = [
		{
			value: 'CAJA_COMPENSACION',
			label: "Caja de compensacion"
		},
		{
			value: 'PENSION',
			label: "Pension"
		},
		{
			value: 'SALUD',
			label: "Salud"
		}
	];

	let unparsedServiceType: Selected<Service['type']> | undefined = $state(undefined);
	const serviceType = $derived.by(() => Option.fromNullable((unparsedServiceType ?? { value: null }).value))

	let clientPromise = $derived.by(async () => {
		try {
			const numericPersonId = parseInt(personId!);
			return concretize(client, GetClientByPersonId(numericPersonId));
		} catch {
			return Promise.resolve(null);
		}
	})

	const serviceFormSchema = z.object({
		id: z.number().optional(),
		cost: z.number({ message: "El costo es requerido" }),
		type: z.enum(['CAJA_COMPENSACION', 'PENSION', 'SALUD'], { message: 'El tipo de servicio es requerido' }),
		concept: z.string({ message: 'El concepto es requerido' }).min(2, { message: 'El concepto debe contener como minimo dos caracteres' })
	} as const)
	let validationErrors = $state<ZodError<Partial<Service>>>();

	const saveServiceCallback = $derived(
		async () => {
			if (Option.isSome(serviceType)) {
				try {
					const service = await serviceFormSchema.safeParseAsync({
						id: serviceId ? parseInt(serviceId!) : undefined,
						cost: cost!,
						type: serviceType.value,
						concept: concept!
					});
					console.log(service)

					if (service.error) {
						validationErrors = service.error;
					} else {
						const _client = await clientPromise
						if (_client) {
							concretize(client, SaveService(service.data, _client.id))
								.then(() => {
									toast.info("Se realizo la accion exitosamente");
								}).catch((err) => {
									toast.error(`No se pudo crear el servicio: ${err}`);
								})
							validationErrors = undefined;
						} else {
							toast.error('La persona no cuenta con un cliente creado');
						}
					}
				} catch {
					toast.error('El id del servicio es invalido');
				}
			} else {
				toast.error('El tipo del servicio no puede ser nulo');
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
				<Button variant="secondary" on:click={saveServiceCallback}>Guardar</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<form class="flex flex-col gap-5">
					 {#if serviceId}
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Id</Label>
						 <Input type="text" disabled value={serviceId}/>
					 </fieldset>
					 {/if}
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Persona</Label>
						 {#await personPromise}
							 <Input type="text" disabled value={"Cargando..."}/>
						 {:then person}
							 <Input type="text" disabled value={person}/>
						 {/await}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Tipo</Label>
						 <Select.Root bind:selected={unparsedServiceType}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Selecciona un tipo de persona" />
								</Select.Trigger>
								<Select.Content>
									{#each typeOptions as typeOption}
									<Select.Item value={typeOption.value} label={typeOption.label}>{typeOption.label}</Select.Item>
									{/each}
								</Select.Content>
						 </Select.Root>
					 </fieldset>
					 {#if Option.isSome(serviceType)}
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Concepto</Label>
						 <Input type="text" bind:value={concept}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "concept").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "concept")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Costo</Label>
						 <Input type="number" bind:value={cost}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "cost").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "cost")[0].message}</small>
						 {/if}
					 </fieldset>
					 {/if}
			</form>
		</CardContent>
	</Card>
</main>

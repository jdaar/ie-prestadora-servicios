<script lang="ts">
	import { Button } from "@/components/ui/button";
	import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
	import { Input } from "@/components/ui/input";
	import { Option } from "effect";
	import { Label } from "@/components/ui/label";
	import * as Select from "@/components/ui/select";
	import type { Selected } from "bits-ui";
	import { goto } from "$app/navigation";
	import { concretize } from "@/application/application.js";
	import { SavePerson } from "@/domain/use-cases/save-person.js";
	import { toast } from "svelte-sonner";
	import { ZodError, z } from "zod";
	import type { Person } from "@/domain/models/person.js";

	const { data } = $props();
	const client = data.client;

	const documentTypeOptions = [
		{
			value: "NIT",
			label: "Numero de identificacion"
		},
		{
			value: "CC",
			label: "Cedula de ciudadania"
		},
		{
			value: "CE",
			label: "Cedula de extranjeria"
		},
		{
			value: "PASSPORT",
			label: "Pasaporte"
		}
	]

	const typeOptions = [
		{
			value: "NATURAL",
			label: "Natural"
		},
		{
			value: "ARTIFICIAL",
			label: "Juridica"
		}
	];

	let unparsedPersonType: Selected<string> | undefined = $state(undefined);
	let unparsedDocumentType: Selected<string> | undefined = $state(undefined);
	const personType = $derived.by(() => Option.fromNullable((unparsedPersonType ?? { value: null }).value))
	const documentType = $derived.by(() => Option.fromNullable((unparsedDocumentType ?? { value: null }).value))

	let fullName: string | undefined = $state(undefined)
	let documentNumber: string | undefined = $state(undefined)
	let risk: number | undefined = $state(undefined)
	let companyName: string | undefined = $state(undefined)
	let nit: string | undefined = $state(undefined)


	const personFormSchema = z.discriminatedUnion('type', [
		z.object({
			fullName: z.string({ message: "El nombre completo es obligatorio para personas naturales" }),
			identityNumber: z.string({ message: "El numero de documento es obligatorio para personas naturales" }),
			identityType: z.enum(['CC', 'CE', 'NIT', 'PASSPORT'], { message: "El tipo de documento es obligatorio para personas naturales" }),
			type: z.literal('NATURAL'),
			risk: z.number({ message: 'El riesgo es obligatorio' })
		} as const),
		z.object({
			companyName: z.string({ message: "El nombre de la compania es obligatorio para personas juridicas" }),
			nit: z.string({ message: "El NIT es obligatorio para personas juridicas" }),
			type: z.literal('ARTIFICIAL'),
			risk: z.number({ message: 'El riesgo es obligatorio' })
		} as const)
	])
	let validationErrors = $state<ZodError<Partial<Person>>>();
	
	$effect(() => {
		console.log(validationErrors)
	})

	const savePersonCallback = $derived(
		() => {
			if (Option.isSome(personType)) {
				const unparsedPerson = {
					type: personType.value === "NATURAL" ? "NATURAL" : "ARTIFICIAL",
					nit: nit,
					risk: risk,
					companyName: companyName,
					identityType: Option.isSome(documentType) ? documentType.value as 'CC' | 'CE' | 'NIT' | 'PASSPORT' : undefined,
					fullName: fullName,
					identityNumber: documentNumber
				}
				console.log(unparsedPerson)
				const _person = personFormSchema.safeParse(unparsedPerson);

				if (_person.error) {
					validationErrors = _person.error;
				} else {
					concretize(client, SavePerson(_person.data))
						.then(() => toast.info("Se creo la persona satisfactoriamente"))
						.catch((error) => {
							toast.error("No se pudo realizar esa accion");
							console.error(error)
						})
					validationErrors = undefined;
				}
			} else {
				toast.error("El tipo de persona no puede ser nulo");
			}
		}
	)
</script>

<main class="p-5">
	<Card>
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>Crear persona</CardTitle>
			<div class='flex gap-2.5'>
				<Button variant="outline" on:click={() => goto('/person')}>Ir atras</Button>
				<Button variant="secondary" on:click={savePersonCallback}>Guardar</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<form class="flex flex-col gap-5">
				 <fieldset class="flex flex-col gap-2.5 w-full">
					 <Label>Tipo de persona</Label>
					 <Select.Root bind:selected={unparsedPersonType}>
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

				 {#if Option.isSome(personType)}
					 {#if personType.value == "NATURAL"}
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Nombre</Label>
						 <Input type="text" bind:value={fullName}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "fullName").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "fullName")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5 w-full">
						 <Label>Tipo de documento</Label>
						 <Select.Root bind:selected={unparsedDocumentType}>
								<Select.Trigger class="w-full">
									<Select.Value placeholder="Selecciona un tipo de documento" />
								</Select.Trigger>
								<Select.Content>
									{#each documentTypeOptions as typeOption}
									<Select.Item value={typeOption.value} label={typeOption.label}>{typeOption.label}</Select.Item>
									{/each}
								</Select.Content>
						 </Select.Root>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "identityType").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "identityType")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Numero de documento</Label>
						 <Input type="text" bind:value={documentNumber}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "identityNumber").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "identityNumber")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Riesgo</Label>
						 <Input type="number" bind:value={risk}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "risk").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "risk")[0].message}</small>
						 {/if}
					 </fieldset>
				 	{:else}
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Razon social</Label>
						 <Input type="text" bind:value={companyName}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "companyName").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "companyName")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Numero de identificacion</Label>
						 <Input type="text" bind:value={nit}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "nit").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "nit")[0].message}</small>
						 {/if}
					 </fieldset>
					 <fieldset class="flex flex-col gap-2.5">
						 <Label>Riesgo</Label>
						 <Input type="number" bind:value={risk}/>
						 {#if (validationErrors?.errors.filter(v => v.path[0] == "risk").length ?? 0) > 0}
						 <small class="text-sm font-medium leading-none pb-1 text-[#ff6961]">{validationErrors?.errors.filter(v => v.path[0] == "risk")[0].message}</small>
						 {/if}
					 </fieldset>
					{/if}
				 {/if}
			</form>
		</CardContent>
	</Card>
</main>


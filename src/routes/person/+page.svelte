<script lang="ts">
	import { concretize } from '@/application/application';
	import { GetPersonList } from '@/domain/use-cases/get-person-list.js';
	import * as Table from "$lib/components/ui/table/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Skeleton } from '@/components/ui/skeleton/index.js';
	import { Option } from "effect";
	import SelectableColumnHeader from '@/components/custom/selectable-column-header.svelte';
	import SearchableColumnHeader from '@/components/custom/searchable-column-header.svelte';
	import { utils, writeFileXLSX } from 'xlsx';
	import Button from '@/components/ui/button/button.svelte';
	import { GeneratePersonReport } from '@/domain/use-cases/generate-person-report.js';
	import { goto } from '$app/navigation';

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
	]

	let documentNumberFilter = $state(Option.none<string>());
	let nameFilter = $state(Option.none<string>());
	let typeFilter = $state(Option.none<string>());
	let documentTypeFilter = $state(Option.none<string>());


	let personPromise = $derived(
		concretize(client, GetPersonList({
			documentNumber: documentNumberFilter,
			documentType: documentTypeFilter,
			name: nameFilter,
			type: typeFilter
		})
	));
	
	let personReportCallback = $derived(
		() => concretize(client, GeneratePersonReport({
			documentNumber: documentNumberFilter,
			documentType: documentTypeFilter,
			name: nameFilter,
			type: typeFilter
		}))
	)

	let filteredColumnNames = $derived([
		Option.isSome(documentNumberFilter) ? 'numero de documento' : null,
		Option.isSome(nameFilter) ? 'nombre' : null,
		Option.isSome(typeFilter) ? 'tipo' : null,
		Option.isSome(documentTypeFilter) ? 'tipo de documento' : null
	].filter((v) => v !== null))
</script>

<main class="p-5">
	<Card>
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>Listado de personas</CardTitle>
			<div class="flex gap-2.5"> 
				<Button variant="outline" on:click={() => goto('/person/save')}>Crear persona</Button>
				<Button variant="secondary" on:click={personReportCallback}>Exportar a excel</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Id</Table.Head>
						<Table.Head><SelectableColumnHeader class="w-full h-full" bind:selected={typeFilter} label="Tipo" options={typeOptions}>Tipo</SelectableColumnHeader></Table.Head>
						<Table.Head><SearchableColumnHeader class="w-full h-full" bind:selected={nameFilter} label="Nombre">Nombre</SearchableColumnHeader></Table.Head>
						<Table.Head><SelectableColumnHeader class="w-full h-full" bind:selected={documentTypeFilter} label="Tipo de documento", options={documentTypeOptions}>Tipo de documento</SelectableColumnHeader></Table.Head>
						<Table.Head><SearchableColumnHeader class="w-full h-full" bind:selected={documentNumberFilter} label="Numero de documento">Numero de documento</SearchableColumnHeader></Table.Head>
						<Table.Head class="text-right">Riesgo</Table.Head>
					</Table.Row>
				</Table.Header>
					<Table.Body>
						{#await personPromise}
							<Table.Row>
								<Table.Cell class="font-medium"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell class="text-right"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
							</Table.Row>
						{:then personList} 
							{#each personList as person, i (i)}
								<Table.Row>
									<Table.Cell class="font-medium">{person.id}</Table.Cell>
									<Table.Cell>{person.type}</Table.Cell>
									<Table.Cell>{person.type === "NATURAL" ? person.fullName : person.companyName}</Table.Cell>
									<Table.Cell>{person.type === "NATURAL" ? person.identityType : "NIT"}</Table.Cell>
									<Table.Cell>{person.type === "NATURAL" ? person.identityNumber : person.nit}</Table.Cell>
									<Table.Cell class="text-right">{person.type === "NATURAL" ? person.risk : "N/A"}</Table.Cell>
								</Table.Row>
							{/each}
						{/await}
				</Table.Body>
				{#await personPromise then personList}
					<Table.Caption>{personList.length} personas registradas{#if filteredColumnNames.length > 0}, filtrando por {filteredColumnNames.join(', ')}.{/if}</Table.Caption>
				{/await}
			</Table.Root>
		</CardContent>
	</Card>
</main>

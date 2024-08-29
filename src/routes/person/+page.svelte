<script lang="ts">
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";
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
	import { DeletePerson } from "@/domain/use-cases/delete-person.js";
	import { toast } from "svelte-sonner";

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
	let deletedItemsCount = $state(0)


	let personPromise = $derived.by(() => {
		deletedItemsCount;
		return concretize(client, GetPersonList({
				documentNumber: documentNumberFilter,
				documentType: documentTypeFilter,
				name: nameFilter,
				type: typeFilter
			}))
	});
	
	let personReportCallback = $derived.by(() => {
		deletedItemsCount;
		return () => concretize(client, GeneratePersonReport({
			documentNumber: documentNumberFilter,
			documentType: documentTypeFilter,
			name: nameFilter,
			type: typeFilter
		}))
	})

	let personDeletionCallback = (id: number) => concretize(client, DeletePerson(id))
		.then(() => {
			toast.info("Operacion realizada exitosamente")
			deletedItemsCount += 1
		})
		.catch((error) => {
			toast.error("Se presento un error al realizar la accion solicitada")
			console.error(error)
		})

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
						<Table.Head class="text-right">Editar</Table.Head>
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
								<Table.Row class="w-full">
									<Table.Cell class="font-medium">
										<ContextMenu.Root>
											<ContextMenu.Trigger>
													{person.id}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
													{person.type}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{person.type === "NATURAL" ? person.fullName : person.companyName}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{person.type === "NATURAL" ? person.identityType : "NIT"}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{person.type === "NATURAL" ? person.identityNumber : person.nit}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{person.type === "NATURAL" ? person.risk : "N/A"}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell class="flex justify-end">
										<Button variant="outline" on:click={() => goto(`/person/edit/${person.id}`)}><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" viewBox="0 0 24 24">
											<g fill="none"><path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z"/>
												<path fill="currentColor" d="M16.035 3.015a3 3 0 0 1 4.099-.135l.144.135l.707.707a3 3 0 0 1 .135 4.098l-.135.144L9.773 19.177a1.5 1.5 0 0 1-.562.354l-.162.047l-4.454 1.028a1 1 0 0 1-1.22-1.088l.02-.113l1.027-4.455a1.5 1.5 0 0 1 .29-.598l.111-.125zm-.707 3.535l-8.99 8.99l-.636 2.758l2.758-.637l8.99-8.99l-2.122-2.12Zm3.536-2.121a1 1 0 0 0-1.32-.083l-.094.083l-.708.707l2.122 2.121l.707-.707a1 1 0 0 0 .083-1.32l-.083-.094z"/></g></svg></Button>
									</Table.Cell>
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

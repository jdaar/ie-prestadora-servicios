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
					</Table.Row>
				</Table.Header>
					<Table.Body>
						{#await personPromise}
							{#each new Array(5).fill(0) as id}
							<Table.Row>
								<Table.Cell class="font-medium"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell class="flex justify-end"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
							</Table.Row>
							{/each}
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
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
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
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
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
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
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
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
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
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger class="text-right">
												{person.type === "NATURAL" ? person.risk : "N/A"}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => personDeletionCallback(person.id)}>Eliminar</ContextMenu.Item>
												<ContextMenu.Item on:click={() => goto(`/client/save?person-id=${person.id}`)}>Crear cliente</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
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

<script lang="ts">
	import { concretize } from '@/application/application';
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import Button from '@/components/ui/button/button.svelte';
	import { Skeleton } from '@/components/ui/skeleton/index.js';
	import * as Table from "$lib/components/ui/table/index.js";
	import { goto } from '$app/navigation';
	import { GetBillingStatementByClientId } from '@/domain/use-cases/get-billing-statement-by-client-id.js';
	import { GetClientByPersonId } from '@/domain/use-cases/get-client-by-person-id.js';
	import { toast } from 'svelte-sonner';
	import { GetPerson } from '@/domain/use-cases/get-person.js';
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";

	const { data } = $props();
	const client = data.client;
	const personId = data.personId;

	let personPromise = (async () => {
		try {
			const numericPersonId = parseInt(personId)
			return concretize(client, GetPerson(numericPersonId))
		} catch {
			toast.error("La persona tiene un id invalido");
		}
	})()

	let clientPromise = $derived.by(async () => {
		const person = await personPromise 
		if (!person) {
			return Promise.resolve(null);
		}
		return concretize(client, GetClientByPersonId(person!.id));
	})
	let billingStatementPromise = $derived.by(async () => {
		const _client = await clientPromise
		if (!_client) {
			return Promise.resolve([]);
		}
		return concretize(client, GetBillingStatementByClientId(_client.id))
	})
</script>

<main class="p-5">
	<Card>
		{#await personPromise}
		<CardHeader class="flex flex-row justify-between items-center">
			<Skeleton class="h-[20px] w-[100px] rounded-full"/>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<div class="flex gap-10 justify-between pt-5 pb-5">
				{#each new Array(6).fill(0) as _}
				<div class="flex flex-col gap-1">
					<p class="text-muted-foreground text-sm">
						<Skeleton class="h-[20px] w-[100px] rounded-full"/>
					</p>
					<small class="text-sm font-medium leading-none">
						<Skeleton class="h-[20px] w-[200px] rounded-full"/>
					</small>
				</div>
				{/each}
			</div>
			<Skeleton class="h-[20px] w-[100px] rounded-full"/>
			<Skeleton class="h-[100px] w-full rounded"/>
			<Skeleton class="h-[20px] w-[100px] rounded-full"/>
			<Skeleton class="h-[100px] w-full rounded"/>
		</CardContent>
		{:then person}
		{#if person}
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>{person.type === 'NATURAL' ? person.fullName : person.companyName}</CardTitle>
			<div class="flex gap-2.5"> 
				<Button variant="outline" on:click={() => goto('/client')}>Ir atras</Button>
				<Button variant="secondary" on:click={() => goto(`/service/save?person-id=${person.id}`)}>Crear servicio</Button>
			</div>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<div class="flex gap-10 justify-between pt-5 pb-5">
				<div>
					<p class="text-muted-foreground text-sm">Riesgo</p>
					<small class="text-sm font-medium leading-none">{person.risk}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Tipo</p>
					<small class="text-sm font-medium leading-none">{person.type}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Tipo de documento</p>
					<small class="text-sm font-medium leading-none">{person.identityType ?? 'N/A'}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Numero de documento</p>
					<small class="text-sm font-medium leading-none">{person.identityNumber ?? 'N/A'}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Nombre de compania</p>
					<small class="text-sm font-medium leading-none">{person.companyName ?? 'N/A'}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">NIT</p>
					<small class="text-sm font-medium leading-none">{person.nit ?? 'N/A'}</small>
				</div>
				<div>
					<p class="text-muted-foreground text-sm">Creado en</p>
					<small class="text-sm font-medium leading-none">{person.createdAt?.toLocaleDateString() ?? 'N/A'}</small>
				</div>
			</div>
			<CardTitle>Servicios</CardTitle>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Id</Table.Head>
						<Table.Head>Concepto</Table.Head>
						<Table.Head>Costo</Table.Head>
						<Table.Head>Tipo</Table.Head>
						<Table.Head class="text-right">Creado en</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#await billingStatementPromise}
					{#each new Array(5).fill(0) as _}
					<Table.Row>
						<Table.Cell class="font-medium"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
						<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
						<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
						<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
						<Table.Cell class="flex justify-end"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
					</Table.Row>
					{/each}
					{:then billingStatements}
					{#each billingStatements as billingStatement}
					<Table.Row>
						<Table.Cell class="font-medium">{billingStatement.service.id}</Table.Cell>
						<Table.Cell>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.service.concept}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/service/save?service-id=${billingStatement.service.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.service.cost}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/service/save?service-id=${billingStatement.service.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.service.type}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/service/save?service-id=${billingStatement.service.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell class="flex justify-end">
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.service.createdAt?.toLocaleDateString()}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/service/save?service-id=${billingStatement.service.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
					</Table.Row>
					{/each}
					{/await}
				</Table.Body>
				{#await billingStatementPromise then billingStatements}
					<Table.Caption>{billingStatements.length} servicios registrados</Table.Caption>
				{/await}
			</Table.Root>
			<CardTitle>Cuentas de cobro</CardTitle>
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Id</Table.Head>
						<Table.Head>Total</Table.Head>
						<Table.Head>Concepto del servicio</Table.Head>
						<Table.Head class="text-right">Creado en</Table.Head>
					</Table.Row>
				</Table.Header>
				<Table.Body>
					{#await billingStatementPromise}
					{#each new Array(5).fill(0) as _}
					<Table.Row>
						<Table.Cell class="font-medium"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
						<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
						<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
						<Table.Cell class="flex justify-end"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
					</Table.Row>
					{/each}
					{:then billingStatements}
					{#each billingStatements as billingStatement}
					<Table.Row>
						<Table.Cell class="font-medium">
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.id}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/billingstatement/save?billing-statement-id=${billingStatement.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.total}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/billingstatement/save?billing-statement-id=${billingStatement.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell>
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.service.concept}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/billingstatement/save?billing-statement-id=${billingStatement.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
						<Table.Cell class="flex justify-end">
							<ContextMenu.Root>
								<ContextMenu.Trigger>
									{billingStatement.createdAt?.toLocaleDateString()}
								</ContextMenu.Trigger>
								<ContextMenu.Content class="w-64">
									<ContextMenu.Item on:click={() => goto(`/billingstatement/save?billing-statement-id=${billingStatement.id}&person-id=${person.id}`)}>Actualizar</ContextMenu.Item>
								</ContextMenu.Content>
							</ContextMenu.Root>
						</Table.Cell>
					</Table.Row>
					{/each}
					{/await}
				</Table.Body>
				{#await billingStatementPromise then billingStatements}
					<Table.Caption>{billingStatements.length} cuentas de cobro registradas</Table.Caption>
				{/await}
			</Table.Root>
		</CardContent>
		{:else}
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>No se encontro a la persona con ese id</CardTitle>
		</CardHeader>
		{/if}
		{/await}
	</Card>
</main>

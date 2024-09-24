<script lang="ts">
	import { concretize } from '@/application/application';
	import * as Table from "$lib/components/ui/table/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Skeleton } from '@/components/ui/skeleton/index.js';
	import { goto } from '$app/navigation';
	import { GetClientList } from '@/domain/use-cases/get-client-list.js';
  import * as ContextMenu from "$lib/components/ui/context-menu/index.js";

	const { data } = $props();
	const client = data.client;

	let clientPromise = $derived.by(() => {
		return concretize(client, GetClientList)
	});
</script>

<main class="p-5">
	<Card>
		<CardHeader class="flex flex-row justify-between items-center">
			<CardTitle>Listado de clientes</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Id</Table.Head>
						<Table.Head>Email</Table.Head>
						<Table.Head>Nombre completo</Table.Head>
						<Table.Head>Numero de documento</Table.Head>
						<Table.Head class="text-right">Creado en</Table.Head>
					</Table.Row>
				</Table.Header>
					<Table.Body>
						{#await clientPromise}
							{#each new Array(5).fill(0) as _}
							<Table.Row>
								<Table.Cell class="font-medium"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell><Skeleton class="h-[20px] w-[100px] rounded-full"/></Table.Cell>
								<Table.Cell class="flex justify-end"><Skeleton class="h-[20px] w-[50px] rounded-full"/></Table.Cell>
							</Table.Row>
							{/each}
						{:then clientList} 
							{#each clientList as clnt, i (i)}
								<Table.Row class="w-full">
									<Table.Cell class="font-medium">
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{clnt.id}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => goto(`/client/${clnt.person.id}`)}>Ver detalle</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{clnt.email}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => goto(`/client/${clnt.person.id}`)}>Ver detalle</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{clnt.person.type == "NATURAL" ? clnt.person.fullName : clnt.person.companyName}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => goto(`/client/${clnt.person.id}`)}>Ver detalle</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell>
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{clnt.person.type == "NATURAL" ? `${clnt.person.identityType} ${clnt.person.identityNumber}` : `NIT ${clnt.person.nit}`}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => goto(`/client/${clnt.person.id}`)}>Ver detalle</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
									<Table.Cell class="text-right">
										<ContextMenu.Root>
											<ContextMenu.Trigger>
												{clnt.createdAt?.toLocaleDateString()}
											</ContextMenu.Trigger>
											<ContextMenu.Content class="w-64">
												<ContextMenu.Item on:click={() => goto(`/client/${clnt.person.id}`)}>Ver detalle</ContextMenu.Item>
											</ContextMenu.Content>
										</ContextMenu.Root>
									</Table.Cell>
								</Table.Row>
							{/each}
						{/await}
				</Table.Body>
				{#await clientPromise then clientList}
					<Table.Caption>{clientList.length} clientes registrados</Table.Caption>
				{/await}
			</Table.Root>
		</CardContent>
	</Card>
	</main>

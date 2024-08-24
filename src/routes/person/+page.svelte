<script lang="ts">
	import { concretize } from '@/application/application';
	import { GetPersonList } from '@/domain/use-cases/get-person-list.js';
	import * as Table from "$lib/components/ui/table/index.js";
	import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
	import { Skeleton } from '@/components/ui/skeleton/index.js';

	const { data } = $props();
	const client = data.client;

	const personPromise = concretize(client, GetPersonList);
</script>

<main class="p-5">
	<Card>
		<CardHeader>
			<CardTitle>Listado de personas</CardTitle>
		</CardHeader>
		<CardContent class="flex flex-col gap-5">
			<Table.Root>
				<Table.Header>
					<Table.Row>
						<Table.Head class="w-[100px]">Id</Table.Head>
						<Table.Head>Tipo</Table.Head>
						<Table.Head>Nombre</Table.Head>
						<Table.Head>Tipo de documento</Table.Head>
						<Table.Head>Numero de documento</Table.Head>
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
					<Table.Caption>{personList.length} personas registradas</Table.Caption>
				{/await}
			</Table.Root>
		</CardContent>
	</Card>
</main>

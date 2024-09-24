import { Effect, Layer } from "effect";
import { SupabaseGatewayAdapter, SupabaseInstanceRef, type SupabaseGateway } from "@/domain/gateways/supabase";
import { SupabaseSDKError } from "@/domain/models/errors/supabase-sdk-error";
import type { User } from "@/domain/models/user";
import type { Person } from "@/domain/models/person";
import type { Client } from "@/domain/models/client";
import type { BillingStatement } from "@/domain/models/billing-statement";
import type { Service } from "@/domain/models/service";

export const SupabaseGatewayLive = Layer.effect(
	SupabaseGatewayAdapter,
	Effect.gen(function *(_) { const instance = yield *_(SupabaseInstanceRef);

		const signIn: SupabaseGateway['signIn'] = (user) => Effect.tryPromise({
				try: () => instance.auth.signInWithPassword({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap((value) => {
					if (value.error !== null)
						return Effect.fail(new SupabaseSDKError(value.error))
					else
						return Effect.succeed(value)
				})
			);

		const signUp: SupabaseGateway['signUp'] = (user) => Effect.tryPromise({
				try: () => instance.auth.signUp({
					email: user.email,
					password: user.password
				}),
				catch: (error) => new SupabaseSDKError(error)
			});

		const signOut: SupabaseGateway['signOut'] = Effect.tryPromise({
				try: () => instance.auth.signOut(),
				catch: (error) => new SupabaseSDKError(error)
			});

		const getConnectedUser: SupabaseGateway['getConnectedUser'] = Effect.tryPromise({
				try: () => instance.auth.getUser(),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap((data) => {
					if (!data.data.user?.email) {
						return Effect.fail(
							new SupabaseSDKError(new Error("retrieved invalid user (reason: null email)"))
						)
					}
					return Effect.succeed({
						// TODO: fix
						id: 0,
						email: data.data.user?.email
					} satisfies User)
				})
			);

		const getPersons: SupabaseGateway['getPersons'] = Effect.tryPromise({
				try: () => instance.from('person').select(),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap(v => {
					if (v.error !== null) {
						return Effect.fail(new SupabaseSDKError(v.error))
					}
					return Effect.succeed(v.data.map(v => 
						v.type == 'NATURAL' ? ({
							type: 'NATURAL',
							id: v.id,
							risk: v.risk!,
							fullName: v.full_name!,
							identityType: v.identity_type!,
							identityNumber: v.identity_number!
						} satisfies Person)
						:
						({
							type: 'ARTIFICIAL',
							nit: v.nit!,
							id: v.id,
							companyName: v.company_name!,
						} satisfies Person)
					))
				})
			);

		const getPerson: SupabaseGateway['getPerson'] = (personId: number) => Effect.tryPromise({
				try: () => instance.from('person').select().eq("id", personId),
				catch: (error) => new SupabaseSDKError(error)
			}).pipe(
				Effect.flatMap(v => {
					if (v.error !== null) {
						return Effect.fail(new SupabaseSDKError(v.error))
					}
					return Effect.succeed(v.data.map(v => 
						v.type == 'NATURAL' ? ({
							type: 'NATURAL',
							id: v.id,
							risk: v.risk!,
							fullName: v.full_name!,
							identityType: v.identity_type!,
							identityNumber: v.identity_number!
						} satisfies Person)
						:
						({
							type: 'ARTIFICIAL',
							nit: v.nit!,
							id: v.id,
							companyName: v.company_name!,
						} satisfies Person)
					)[0])
				})
			);

		const getService: SupabaseGateway['getService'] = (serviceId: number) => Effect.tryPromise({
			try: () => instance.from('service').select().eq("id", serviceId).limit(1),
			catch: (error) => new SupabaseSDKError(error)
		}).pipe(
			Effect.flatMap(v => {
				if (v.error !== null) {
					return Effect.fail(new SupabaseSDKError(v.error))
				}
				return Effect.succeed(v.data.map(v => ({
					id: v.id,
					type: v.type,
					cost: v.cost,
					concept: v.concept,
					createdAt: new Date(v.created_at)
				} satisfies Service))[0])
			})
		)

		const getBillingStatementByServiceId: SupabaseGateway['getBillingStatementByServiceId'] = (serviceId: number) => Effect.gen(function *(_) {
			const billingStatementData = yield *_(Effect.tryPromise({
				try: () => instance.from('billing_statement').select().eq("service_id", serviceId).limit(1).single(),
				catch: (error) => new SupabaseSDKError(error)
			}));
			if (billingStatementData.error) {
				return yield *_(Effect.fail(new SupabaseSDKError("Entity not found")))
			}
			const service = yield *_(getService(billingStatementData.data.service_id))
			return {
				id: billingStatementData.data.id,
				createdAt: new Date(billingStatementData.data.created_at),
				service,
				clientId: billingStatementData.data.client_id,
				total: billingStatementData.data.total
			};
		})

		const getBillingStatement: SupabaseGateway['getBillingStatement'] = (billingStatementId: number) => Effect.gen(function *(_) {
			const billingStatementData = yield *_(Effect.tryPromise({
				try: () => instance.from('billing_statement').select().eq("id", billingStatementId).limit(1).single(),
				catch: (error) => new SupabaseSDKError(error)
			}));
			if (billingStatementData.error) {
				return yield *_(Effect.fail(new SupabaseSDKError("Entity not found")))
			}
			const service = yield *_(getService(billingStatementData.data.service_id))
			return {
				id: billingStatementData.data.id,
				createdAt: new Date(billingStatementData.data.created_at),
				service,
				clientId: billingStatementData.data.client_id,
				total: billingStatementData.data.total
			};
		})

		const getBillingStatementsByClientId: SupabaseGateway['getBillingStatementsByClientId'] = (clientId: number) => Effect.gen(function *(_) {
			const billingStatements = yield *_(Effect.tryPromise({
				try: () => instance.from('billing_statement').select().eq("client_id", clientId),
				catch: (error) => new SupabaseSDKError(error)
			}));
			if (billingStatements.error) {
				yield *_(Effect.fail(new SupabaseSDKError("Entity not found")))
			}
			const output: Array<BillingStatement> = new Array();
			for (let idx = 0; idx < billingStatements.data!.length; idx += 1) {
				const billingStatementData = billingStatements.data![idx];
				// better performance with join but fuck it
				const service = yield *_(getService(billingStatementData.service_id))
				output.push({
					id: billingStatementData.id,
					createdAt: new Date(billingStatementData.created_at),
					service,
					clientId: billingStatementData.client_id,
					total: billingStatementData.total
				})
			}
			return output;
		})

		const getClientByPersonId: SupabaseGateway['getClientByPersonId'] = (personId: number) => Effect.gen(function *(_) {
			const client = yield *_(Effect.tryPromise({
				try: () => instance.from('client').select().eq('person_id', personId).limit(1).single(),
				catch: (error) => new SupabaseSDKError(error)
			}));

			if (client.error) {
				yield *_(Effect.fail(new SupabaseSDKError("Entity not found")))
			}

			const person = yield *_(getPerson(client.data!.person_id))

			return {
				id: client.data!.id,
				createdAt: new Date(client.data!.created_at),
				person,
				email: client.data!.email
			} satisfies Client;
		});

		const getClients: SupabaseGateway['getClients'] = Effect.gen(function *(_) {
			const clients = yield *_(Effect.tryPromise({
				try: () => instance.from('client').select(),
				catch: (error) => new SupabaseSDKError(error)
			}));
			if (clients.error) {
				yield *_(Effect.fail(new SupabaseSDKError("Entity not found")))
			}
			const outputClients: Array<Client> = new Array();
			for (let idx = 0; idx < clients.data!.length; idx += 1) {
				const clientData = clients.data![idx];
				// better performance with join but fuck it
				const person = yield *_(getPerson(clientData.person_id))
				outputClients.push({
					id: clientData.id,
					email: clientData.email,
					createdAt: new Date(clientData.created_at),
					person
				})
			}

			return outputClients;
		})

		const saveClient: SupabaseGateway['saveClient'] = (client, personId) => 
		Effect.succeed(client.id)
			.pipe(
				Effect.flatMap((value) => {
					if (value !== undefined) {
						return Effect.tryPromise({
							try: () => instance.from('client').update({
								email: client.email,
								person_id: personId,
							}).eq('id', value).select().single(),
							catch: (error) => new SupabaseSDKError(error)
						})
					} else {
						return Effect.tryPromise({
							try: () => instance.from('client').insert({
								email: client.email,
								person_id: personId,
							}).select().single(),
							catch: (error) => new SupabaseSDKError(error)
						})
					}
				})
			).pipe(
				Effect.flatMap(v => {
					if (v.error !== null) {
						return Effect.fail(new SupabaseSDKError(v.error))
					}
					return Effect.gen(function *(_){
						const person = yield *_(getPerson(v.data.person_id))
						return {
							person,
							email: v.data.email,
							createdAt: new Date(v.data.created_at),
							id: v.data.id
						} satisfies Client
					})
				})
			)

		const saveService: SupabaseGateway['saveService'] = (service) => 
			Effect.succeed(service.id)
				.pipe(
					Effect.flatMap((value) => {
						if (value !== undefined) {
							return Effect.tryPromise({
								try: () => instance.from('service').update({
									cost: service.cost,
									type: service.type,
									concept: service.concept
								}).eq('id', value).select().single(),
								catch: (error) => new SupabaseSDKError(error)
							})
						} else {
							return Effect.tryPromise({
								try: () => instance.from('service').insert({
									cost: service.cost,
									type: service.type,
									concept: service.concept
								}).select().single(),
								catch: (error) => new SupabaseSDKError(error)
							})
						}
					})
				).pipe(
					Effect.flatMap(v => {
						if (v.error !== null) {
							return Effect.fail(new SupabaseSDKError(v.error))
						}
						return Effect.succeed(
							{
								id: v.data.id,
								concept: v.data.concept,
								type: v.data.type,
								cost: v.data.cost,
								createdAt: new Date(v.data.created_at)
							} satisfies Service
						)
					})
				)

		const saveBillingStatement: SupabaseGateway['saveBillingStatement'] = (billingStatement) => 
			Effect.succeed(billingStatement.id)
				.pipe(
					Effect.flatMap((value) => {
						if (value !== undefined) {
							return Effect.tryPromise({
								try: () => instance.from('billing_statement').update({
									total: billingStatement.total,
									service_id: billingStatement.service.id,
									client_id: billingStatement.clientId
								}).eq('id', value).select().single(),
								catch: (error) => new SupabaseSDKError(error)
							})
						} else {
							return Effect.tryPromise({
								try: () => instance.from('billing_statement').insert({
									total: billingStatement.total,
									service_id: billingStatement.service.id,
									client_id: billingStatement.clientId
								}).select().single(),
								catch: (error) => new SupabaseSDKError(error)
							})
						}
					})
				).pipe(
					Effect.flatMap(v => {
						if (v.error !== null) {
							return Effect.fail(new SupabaseSDKError(v.error))
						}
						return Effect.gen(function *(_) {
							const service = yield *_(getService(v.data.service_id));
							return {
								id: v.data.id,
								clientId: v.data.client_id,
								service,
								total: v.data.total,
								createdAt: new Date(v.data.created_at)
							} satisfies BillingStatement
						}
						)
					})
				)
			
		const savePerson: SupabaseGateway['savePerson'] = (person) => 
		Effect.succeed(person.id)
			.pipe(
				Effect.flatMap((value) => {
					if (value !== undefined) {
						return Effect.tryPromise({
							try: () => instance.from('person').update({
								type: person.type,
								nit: person.nit,
								company_name: person.companyName,
								id: person.id,
								risk: person.risk,
								full_name: person.fullName,
								identity_type: person.identityType,
								identity_number: person.identityNumber
							}).eq('id', value).select().single(),
							catch: (error) => new SupabaseSDKError(error)
						})
					} else {
						return Effect.tryPromise({
							try: () => instance.from('person').insert({
								type: person.type,
								nit: person.nit,
								company_name: person.companyName,
								id: person.id,
								risk: person.risk,
								full_name: person.fullName,
								identity_type: person.identityType,
								identity_number: person.identityNumber
							}).select().single(),
							catch: (error) => new SupabaseSDKError(error)
						})
					}
				})
			).pipe(
				Effect.flatMap(v => {
					if (v.error !== null) {
						return Effect.fail(new SupabaseSDKError(v.error))
					}
					return Effect.succeed({
						id: v.data.id,
						identityNumber: v.data.identity_number!,
						identityType: v.data.identity_type!,
						fullName: v.data.full_name!,
						risk: v.data.risk!,
						companyName: v.data.company_name!,
						nit: v.data.nit!,
						type: v.data.type!
					} satisfies Person)
				})
		)

		const deletePerson: SupabaseGateway['deletePerson'] = (id) => Effect.tryPromise({
				try: () => instance.from('person').delete().eq('id', id),
				catch: (error) => new SupabaseSDKError(error)
			})

		return SupabaseGatewayAdapter.of({
			signIn,
			signUp,
			signOut,
			getConnectedUser,
			getPersons,
			savePerson,
			getPerson,
			getClients,
			getService,
			getClientByPersonId,
			getBillingStatementsByClientId,
			getBillingStatementByServiceId,
			getBillingStatement,
			saveClient,
			deletePerson,
			saveBillingStatement,
			saveService
		})
	})
)

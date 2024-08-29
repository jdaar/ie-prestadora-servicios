import { Effect, Layer } from "effect";
import { ConfigGatewayLive } from "./config";
import { SupabaseGatewayAdapter, SupabaseInstanceRef, type SupabaseGateway } from "@/domain/gateways/supabase";
import { SupabaseSDKError } from "@/domain/models/errors/supabase-sdk-error";
import type { User } from "@/domain/models/user";
import type { Person } from "@/domain/models/person";
import type { satisfies } from "effect/Function";

export const SupabaseGatewayLive = Layer.effect(
	SupabaseGatewayAdapter,
	Effect.gen(function *(_) {
		const instance = yield *_(SupabaseInstanceRef);

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

		const savePerson: SupabaseGateway['savePerson'] = (person) => 
		Effect.tryPromise({
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
		}).pipe(
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
			deletePerson
		})
	})
)

import { SUPABASE_GATEWAY_TAG, SUPABASE_INSTANCE_TAG } from "@/resources/constants"
import type { AuthResponse, AuthTokenResponsePassword, SupabaseClient } from "@supabase/supabase-js"
import { Context, Effect } from "effect"
import type { ConnectableUser } from "../models/views/connectable-user"
import type { SupabaseSDKError } from "../models/errors/supabase-sdk-error"
import type { User } from "../models/user"
import type { Person } from "../models/person"
import type { Database } from "@/database.types"
import type { Client } from "../models/client"
import type { BillingStatement } from "../models/billing-statement"
import type { Service } from "../models/service"

interface IdentityProviderGateway {
	readonly signIn: (user: ConnectableUser) => Effect.Effect<AuthTokenResponsePassword, SupabaseSDKError>
	readonly signUp: (user: ConnectableUser) => Effect.Effect<AuthResponse, SupabaseSDKError>
	readonly signOut: Effect.Effect<void, SupabaseSDKError>
	readonly getConnectedUser: Effect.Effect<User, SupabaseSDKError>
}

interface DatabaseGateway {
	readonly getPerson: (personId: number) => Effect.Effect<Person, SupabaseSDKError>
	readonly getBillingStatement: (billingStatementId: number) => Effect.Effect<BillingStatement, SupabaseSDKError>
	readonly getBillingStatements: Effect.Effect<Array<BillingStatement>, SupabaseSDKError>
	readonly getBillingStatementsByClientId: (clientId: number) => Effect.Effect<Array<BillingStatement>, SupabaseSDKError>
	readonly getBillingStatementByServiceId: (serviceId: number) => Effect.Effect<BillingStatement, SupabaseSDKError>
	readonly getClientByPersonId: (personId: number) => Effect.Effect<Client, SupabaseSDKError>
	readonly getService: (serviceId: number) => Effect.Effect<Service, SupabaseSDKError>
	readonly getPersons: Effect.Effect<Array<Person>, SupabaseSDKError>
	readonly getClients: Effect.Effect<Array<Client>, SupabaseSDKError>
	readonly savePerson: (person: Omit<Person, 'id'> & { id?: number }) => Effect.Effect<Person, SupabaseSDKError>
	readonly saveClient: (client: Omit<Client, 'id' | 'person'> & { id?: number }, personId: number) => Effect.Effect<Client, SupabaseSDKError>
	readonly deletePerson: (id: number) => Effect.Effect<void, SupabaseSDKError>
	readonly saveService: (service: Omit<Service, 'id'> & { id?: number }) => Effect.Effect<Service, SupabaseSDKError>
	readonly saveBillingStatement: (billingStatement: Omit<BillingStatement, 'id'> & { id?: number }) => Effect.Effect<BillingStatement, SupabaseSDKError>
}

export interface SupabaseGateway extends IdentityProviderGateway, DatabaseGateway {
};

export class SupabaseInstanceRef extends Context.Tag(SUPABASE_INSTANCE_TAG)<
	SupabaseInstanceRef,
	SupabaseClient<Database>
>() {}

export class SupabaseGatewayAdapter extends Context.Tag(SUPABASE_GATEWAY_TAG)<
	SupabaseGatewayAdapter,
	SupabaseGateway 
>() {} 

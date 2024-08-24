export const prerender = true;
import { Effect, Option } from 'effect';
import type { LayoutLoad } from './$types';
import { ConfigGatewayAdapter, ConfigGatewayLive } from '@/driven-adapters/config';
import { createClient } from '@supabase/supabase-js';
import { concretize } from '@/application/application';
import { GetConnectedUser } from '@/domain/use-cases/get-connected-user';
import type { User } from '@/domain/models/user';
import { connectedUser } from '@/application/state';

export const load: LayoutLoad = async () => {
	const client = Effect.runSync(
		Effect.gen(function *(_) {
			const configGateway = yield *_(ConfigGatewayAdapter);
			return createClient(
				configGateway.supabaseClient,
				configGateway.supabaseSecret,
				{}
			)
		}).pipe(
			Effect.provide(ConfigGatewayLive)
		)
	)


	let user: Option.Option<User>;
	try {
		user = Option.some(await concretize(client, GetConnectedUser));
		connectedUser.set(user);
	} catch (error) {
		user = Option.none()
	}

	return {
		client,
		user
	};
};

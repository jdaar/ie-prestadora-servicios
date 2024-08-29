import { Effect, Option } from "effect";
import { SupabaseGatewayAdapter } from "../gateways/supabase";
import type { Person } from "../models/person";

export const GetPersonList = ({
	documentNumber,
	documentType,
	name,
	type
} : {
	documentNumber: Option.Option<string>,
	documentType: Option.Option<string>,
	name: Option.Option<string>,
	type: Option.Option<string>
}) => Effect.gen(function *(_) {
	const supabaseGateway = yield *_(SupabaseGatewayAdapter);
	return yield *_(supabaseGateway.getPersons);
}).pipe(
	Effect.map(
				(initial: Array<Person>) => {
					let result = initial 

					if (Option.isSome(documentType)) {
						result = result.filter((person) => person.type === "NATURAL" && person.identityType == documentType.value)
					}

					if (Option.isSome(documentNumber)) {
						result = result.filter((person) => 
							(person.type === "NATURAL" && person.identityNumber.toLowerCase().match(`.*(${documentNumber.value.toLowerCase()}).*`))
							|| 
							(person.type === "ARTIFICIAL" && person.nit.toLowerCase().match(`.*(${documentNumber.value.toLowerCase()}).*`))
						)
					}

					if (Option.isSome(name)) {
						result = result.filter((person) => 
							(person.type === "NATURAL" && person.fullName.toLowerCase().match(`.*(${name.value.toLowerCase()}).*`))
							|| 
							(person.type === "ARTIFICIAL" && person.companyName.toLowerCase().match(`.*(${name.value.toLowerCase()}).*`))
						)
					}

					if (Option.isSome(type)) {
						result = result.filter((person) => person.type === type.value)
					}

					return result
				}
			)
)

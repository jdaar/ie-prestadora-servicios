import type { Entity } from "./entity";

export type Person = Entity<{
	type: 'NATURAL',
	fullName: string;
	identityNumber: string;
	identityType: 'CC' | 'CE' | 'NIT' | 'PASSPORT';
	risk: number;
} | {
	type: 'ARTIFICIAL',
	companyName: string;
	nit: string;
}>

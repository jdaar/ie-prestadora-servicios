import type { Entity } from "./entity";

export type Service = Entity<{
	concept: string;
	cost: number;
	type: 'CAJA_COMPENSACION' | 'PENSION' | 'SALUD';
}>

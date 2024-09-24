export type Entity<T> = {
	id: number;
	createdAt?: Date;
} & T

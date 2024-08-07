import { writable } from "svelte/store";
import { type SharedUser } from "$shared/types/User";

export const userStore = writable<SharedUser | null>(null);

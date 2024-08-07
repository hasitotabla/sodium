import type { PermissionLevel } from "$shared/types/User";
import type { SvelteComponent } from "svelte";

type AsyncSvelteComponent = () => Promise<{
  default: typeof SvelteComponent<any>;
}>;

export type PageRoute = {
  path?: string;
  component?: typeof SvelteComponent<any> | AsyncSvelteComponent;

  loginRequired?: boolean;
  requiredRoles?: PermissionLevel[];

  useDashboardLayout?: boolean;
};

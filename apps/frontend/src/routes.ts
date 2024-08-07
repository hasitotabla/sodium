import type { SvelteComponent } from "svelte";

// Pages
import Home from "./pages/Home.svelte";
import FileView from "./pages/FileView.svelte";
import TempUpload from "./pages/TempUpload.svelte";

// Dashboard
import DashboardAuth from "./pages/dashboard/Auth.svelte";
import DashboardHome from "./pages/dashboard/Home.svelte";
import DashboardUpload from "./pages/dashboard/Upload.svelte";
import DashboardFiles from "./pages/dashboard/Files.svelte";
import DashboardProfile from "./pages/dashboard/Profile.svelte";

import DashboardAdminUsers from "./pages/dashboard/admin/Users.svelte";
import DashboardAdminInvites from "./pages/dashboard/admin/Invites.svelte";
import DashboardAdminSettings from "./pages/dashboard/admin/Settings.svelte";

import { PermissionLevel } from "$shared/types/User";

type AsyncSvelteComponent = () => Promise<{ default: typeof SvelteComponent<any> }>;
type ModifiedSvelteComponent = typeof SvelteComponent<any> | AsyncSvelteComponent;

export type PageRoute = {
  component: ModifiedSvelteComponent;

  displayAs?: string;

  loginRequired?: boolean;
  requiredRoles?: PermissionLevel[];
};

export type NestedPageRoute = { label: string; subRoutes: Array<PageRoute> };

export type RouteTree = {
  _: PageRoute;
  [key: string]: RouteTree | PageRoute;
};

export const PageRoutes: RouteTree = {
  _: { component: Home },
  upload: { component: TempUpload },
  ":id": { component: FileView },

  dashboard: {
    _: { displayAs: "Home", component: DashboardHome, loginRequired: true },
    auth: { component: DashboardAuth, loginRequired: true },
    upload: { displayAs: "Upload", component: DashboardUpload, loginRequired: true },
    files: { displayAs: "Files", component: DashboardFiles, loginRequired: true },
    profile: { displayAs: "Profile", component: DashboardProfile, loginRequired: true },

    admin: {
      _: { displayAs: "Admin", component: DashboardHome, requiredRoles: [PermissionLevel.ADMIN] },
      users: { displayAs: "Users", component: DashboardAdminUsers, requiredRoles: [PermissionLevel.ADMIN] },
      invites: { displayAs: "Invites", component: DashboardAdminInvites, requiredRoles: [PermissionLevel.ADMIN] },
      settings: { displayAs: "Settings", component: DashboardAdminSettings, requiredRoles: [PermissionLevel.ADMIN] },
    },
  },
};

// for future idk
export const PageRouteReferences: { [key: string]: PageRoute } = {};

// For svelte-routing
export const PageRouteList: Array<{ path: string; component: ModifiedSvelteComponent }> = [];

const extractRoute = (route: RouteTree, partPath: string) => {
  for (const key in route) {
    const routeItem = route[key];

    if (routeItem?.component) {
      let routePath = partPath + (key === "_" ? "/" : `/${key}`);
      if (routePath !== "/" && routePath.at(-1) === "/") routePath = routePath.slice(0, -1);

      if (routeItem?.requiredRoles) routeItem.loginRequired = true;

      PageRouteReferences[routePath] = routeItem as PageRoute;
      PageRouteList.push({
        path: routePath,
        component: routeItem.component as any,
      });
    } else {
      extractRoute(routeItem as RouteTree, `${partPath}/${key}`);
    }
  }
};

extractRoute(PageRoutes, "");

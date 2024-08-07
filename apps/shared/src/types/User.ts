export enum PermissionLevel {
  USER = "USER",
  ADMIN = "ADMIN",
}

export type SharedUser = {
  id: number;
  email: string;
  permission: PermissionLevel;
  uploadLimit: number;
};

export type SharedUserWithFiles = SharedUser & {
  filesUploaded: number;
  filesUsedSpace: number;
};

export type UserListResponse = {
  users: SharedUser[];
  total: number;
};

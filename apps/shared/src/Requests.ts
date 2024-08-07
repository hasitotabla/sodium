import { SharedUser } from "./types/User";

export interface IRequest {
  //
  // Auth
  //

  ["/auth/settings"]: { inviteRequired: boolean; registrationOpen: boolean };
  ["/auth/login"]: { refreshToken: string; accessToken: string; user: SharedUser };
  ["/auth/register"]: { email: string; password: string; inviteCode: string };
  ["/auth/refresh"]: { accessToken: string };

  //
  // Files
  //

  ["/files/upload"]: { url: string };
  ["/files/purgeUserFiles"]: boolean;
  ["/files/createTempSession"]: { url: string };

  // Users
  ["/users/me"]: SharedUser;
  ["/users/all"]: {
    users: Array<
      SharedUser & {
        filesUploaded: number;
        filesUploadedSize: number;
      }
    >;
    total: number;
  };
  ["/users/delete"]: boolean;
  ["/users/passwordChange"]: boolean;
  ["/users/updateUploadLimit"]: boolean;
}

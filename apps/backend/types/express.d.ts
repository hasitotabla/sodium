import { SharedUser } from '$shared/index';

declare module 'express' {
  export interface Request {
    user?: SharedUser;
    userToken?: string;
  }
}

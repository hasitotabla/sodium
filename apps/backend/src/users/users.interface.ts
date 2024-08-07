import { SharedUser } from '../../../shared/src';

export type User = SharedUser & {
  password: string;
};

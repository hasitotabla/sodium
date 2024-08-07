export type Invite = {
  id: number;
  code: string;
  createdBy: string;
  usedBy: string;
};

export type InviteFetchResponse = {
  invites: Invite[];
  total: number;
};

export type InviteCreateResponse = {
  id: number;
  code: string;
  createdBy: string;
};

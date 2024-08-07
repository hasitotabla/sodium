export interface SettingsKeys {
  invite_only: boolean;
  is_registration_open: boolean;

  user_default_upload_limit: number;

  file_ignore_same_checksum: boolean;
  file_ignore_checksum_for: number;
  file_max_preview_size: number;

  home_page_content: string;
}

export type ValidSettingsTypes =
  | boolean
  | number
  | string
  | Array<any>
  | object;

export enum SettingsItemType {
  BOOLEAN = 'boolean',
  NUMBER = 'number',
  STRING = 'string',
  ARRAY = 'array',
  OBJECT = 'object',
}

export const SETTINGS_KEYS: {
  [key in keyof SettingsKeys]: {
    type: SettingsItemType;
    default: ValidSettingsTypes;
    isPublic?: boolean;
  };
} = {
  invite_only: {
    type: SettingsItemType.BOOLEAN,
    default: true,
  },
  is_registration_open: {
    type: SettingsItemType.BOOLEAN,
    default: true,
  },
  user_default_upload_limit: {
    type: SettingsItemType.NUMBER,
    default: 10,
  },
  file_ignore_same_checksum: {
    type: SettingsItemType.BOOLEAN,
    default: false,
  },
  file_ignore_checksum_for: {
    type: SettingsItemType.NUMBER,
    default: 60 * 60,
  },
  file_max_preview_size: {
    type: SettingsItemType.NUMBER,
    default: 1024 * 25, // 25MB
  },
  home_page_content: {
    type: SettingsItemType.STRING,
    default: "[b]Welcome to the home page! You're id {{ .id }}![/b]",
    isPublic: true,
  },
};

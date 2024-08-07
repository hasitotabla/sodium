import { SharedFile } from '$shared/types/File';

export type ExtendedMulterFile = Express.Multer.File & { savename?: string };

export type ExtendedSharedFile = SharedFile & { password?: string };

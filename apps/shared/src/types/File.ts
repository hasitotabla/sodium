export type FileSortBy = "date_desc" | "date_asc" | "size_desc" | "size_asc" | "name_desc" | "name_asc";

export type SharedFile = {
  id: string;
  originalFileName: string;

  mimeType: string;
  size: number;
  views: number;

  uploadedAt: number;
  uploadedBy?: number;
};

export type UserFiles = {
  files: SharedFile[];
  totalNumOfFiles: number;
};

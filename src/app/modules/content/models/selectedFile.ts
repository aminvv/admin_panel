export interface SelectedFile {
  file: File | null;
  preview: string;
  publicId: string;
  isUploading: boolean;
  uploadError: boolean;
  controller?: AbortController;
}

import { environment } from "src/environments/environment";





export const CLOUDINARY_CONFIG = {
  cloudName: environment.cloudinary.cloudName,  
  uploadPreset: environment.cloudinary.uploadPreset,
  folder: environment.cloudinary.folder,
};

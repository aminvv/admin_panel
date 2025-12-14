



import { CloudinaryService } from "src/app/shared/services/cloudinary-upload.service";



export class MyUploadAdapter {
  private controller!: AbortController;

  constructor(
    private loader: any,
    private cloudinaryService: CloudinaryService
  ) {}

  upload() {
    return this.loader.file.then((file: File) => {
      const { observable, controller } =
        this.cloudinaryService.uploadWithAbort(file);

      this.controller = controller;

      return new Promise((resolve, reject) => {
        observable.subscribe({
          next: res => resolve({ default: res.url, publicId:res.publicId }),
          error: err => reject(err),
        });
      });
    });
  }

  abort() {
    if (this.controller) {
      this.controller.abort();
    }
  }
}

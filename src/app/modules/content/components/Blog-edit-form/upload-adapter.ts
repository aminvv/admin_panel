// export class MyUploadAdapter {
//   loader: any;
//   cloudinaryService: any;
//   subscription: any;

  
//   constructor(loader, cloudinaryService) {
//     this.loader = loader;
//     this.cloudinaryService = cloudinaryService;
//   }
  
//   upload() {
//     return this.loader.file.then(file => {
//       return new Promise((resolve, reject) => {
//         this.subscription = this.cloudinaryService.upload(file).subscribe({
//           next: (res: any) => {
//             resolve({ default: res.url });
//             this.subscription.unsubscribe();
//           },
//           error: (err: any) => {
//             reject(err);
//             this.subscription.unsubscribe();
//           }
//         });
//       });
//     });
//   }
  
//   abort() {
//     if (this.subscription) {
//       this.subscription.unsubscribe();
//     }
//   }
// }



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
          next: res => resolve({ default: res.url }),
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

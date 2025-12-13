import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { CLOUDINARY_CONFIG } from "src/app/config/cloudinary.config";

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private http: HttpClient) { }






  upload(fileOrFiles: File | File[]): Observable<{ url: string; publicId: string } | { url: string; publicId: string }[]> {
    if (!fileOrFiles) throw new Error("فایل برای آپلود ارسال نشده")

    if (Array.isArray(fileOrFiles)) {
      const upload = fileOrFiles.map(file => this.uploadToCloudinary(file))
      return forkJoin(upload)
    } else {
      return this.uploadToCloudinary(fileOrFiles);
    }




  }






  

  uploadToCloudinary(file: File) {
    const formData = new FormData()

    formData.append('file', file)
    formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)
    formData.append('folder', CLOUDINARY_CONFIG.folder)


    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;
    
    return new Observable<{ url: string; publicId: string }>(observer => {
      fetch(url, {
        method: 'POST',
        body: formData,
      })
        .then(res => res.json())
        .then(data => {
          observer.next({
            url: data.secure_url,
            publicId: data.public_id,
          });
          observer.complete();
        })
        .catch(err => observer.error(err));
    });
  }

uploadWithAbort(file: File) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset);
  formData.append('folder', CLOUDINARY_CONFIG.folder);

  const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

  const controller = new AbortController();

  const observable = new Observable<{ url: string; publicId: string }>(observer => {
    fetch(url, {
      method: 'POST',
      body: formData,
      signal: controller.signal,
    })
      .then(res => res.json())
      .then(data => {
        observer.next({
          url: data.secure_url,
          publicId: data.public_id,
        });
        observer.complete();
      })
      .catch(err => observer.error(err));
  });

  return { observable, controller };
}


}




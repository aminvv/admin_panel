import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { forkJoin, Observable } from "rxjs";
import { CLOUDINARY_CONFIG } from "src/app/config/cloudinary.config";

@Injectable({
  providedIn: 'root',
})
export class CloudinaryService {
  constructor(private http: HttpClient) { }






  upload(fileOrFiles: File | File[]): Observable<string | string[]> {
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
    formData.append('uploadPreset', CLOUDINARY_CONFIG.uploadPreset)
    formData.append('folder', CLOUDINARY_CONFIG.folder)


    const url = `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/upload`;

    return new Observable<string>((observer) => {
      this.http.post<any>(url, formData).subscribe({
        next: (res) => {
          observer.next(res.secure_url);
          observer.complete();
        },
        error: (err) => observer.error(err),
      });
    });
  }




}

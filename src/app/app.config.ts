// import { Injectable } from '@angular/core';
// import { environment } from '../environments/environment';

// const hostApi = 'http://localhost';
// const portApi = '4000';
// const baseURLApi = `${hostApi}:${portApi}`;

// @Injectable({
//   providedIn: 'root'
// })
// export class AppConfig {
//   config = {
//     version: '1.2.0',
//     // remote: 'http://localhost:4000',
//     isBackend: environment.backend,
//     hostApi,
//     portApi,
//     baseURLApi,
//   };

//   constructor() {
//   }

//   getConfig(): Object {
//     return this.config;
//   }
// }






import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

const baseURLApi = environment.apiUrl;

@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  config = {
    version: '1.2.0',
    isBackend: environment.backend,
    baseURLApi,
  };

  constructor() {
  }

  getConfig(): Object {
    return this.config;
  }
}
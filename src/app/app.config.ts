import { Injectable } from '@angular/core';
import { environment } from '../environments/environment';

const hostApi = process.env.NODE_ENV === 'development' ? 'http://localhost' : 'https://sing-generator-node.herokuapp.com';
const portApi = process.env.NODE_ENV === 'development' ? '8080' : '';
const baseURLApi = `${hostApi}${portApi ? `:${portApi}` : ``}`;

@Injectable({
  providedIn: 'root'
})
export class AppConfig {
  config = {
    version: '1.2.0',
    remote: 'https://sing-generator-node.herokuapp.com',
    isBackend: environment.backend,
    hostApi,
    portApi,
    baseURLApi,
    auth: {
      email: 'aminviper1378@gmail.com',
      password: '123456'
    },
  };

  constructor() {
  }

  getConfig(): Object {
    return this.config;
  }
}

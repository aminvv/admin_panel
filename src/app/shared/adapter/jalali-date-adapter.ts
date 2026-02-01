import { Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment-jalaali';

@Injectable()
export class JalaliDateAdapter extends MomentDateAdapter {

  constructor() {
    super('fa');
    moment.locale('fa');
  }

  override format(date: moment.Moment, displayFormat: string): string {
    if (displayFormat === 'input') {
      return moment(date).format('jYYYY/jMM/jDD');
    }
    return super.format(date, displayFormat);
  }

  override parse(value: any, parseFormat: string | string[]): moment.Moment | null {
    if (value) {
      // فرمت ورودی شمسی را پشتیبانی کن
      return moment(value, 'jYYYY/jMM/jDD', true);
    }
    return null;
  }
}
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
      // تبدیل تاریخ میلادی به شمسی برای نمایش
      return moment(date).format('jYYYY/jMM/jDD');
    }
    return super.format(date, displayFormat);
  }

  override parse(value: any, parseFormat: string | string[]): moment.Moment | null {
    if (value) {
      // اگر مقدار ورودی یک تاریخ شمسی است
      if (typeof value === 'string' && value.includes('/')) {
        // پارس تاریخ شمسی و تبدیل به moment میلادی
        const jalaliMoment = moment(value, 'jYYYY/jMM/jDD', true);
        if (jalaliMoment.isValid()) {
          return jalaliMoment;
        }
      }
    }
    return null;
  }
}
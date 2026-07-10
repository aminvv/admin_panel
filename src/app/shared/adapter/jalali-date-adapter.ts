import { Injectable } from '@angular/core';
import { MomentDateAdapter } from '@angular/material-moment-adapter';
import * as moment from 'moment-jalaali';

@Injectable()
export class JalaliDateAdapter extends MomentDateAdapter {

  constructor() {
    super('fa');
    (moment as any).loadPersian({ usePersianDigits: false, dialect: 'persian-modern' });
  }

  override getYear(date: moment.Moment): number {
    return (this.clone(date) as any).jYear();
  }

  override getMonth(date: moment.Moment): number {
    return (this.clone(date) as any).jMonth();
  }

  override getDate(date: moment.Moment): number {
    return (this.clone(date) as any).jDate();
  }

  override getYearName(date: moment.Moment): string {
    return this.clone(date).format('jYYYY');
  }

  override getNumDaysInMonth(date: moment.Moment): number {
    return (this.clone(date) as any).jDaysInMonth();
  }

  override getFirstDayOfWeek(): number {
    return 6;
  }

  override getMonthNames(): string[] {
    return ['فروردین','اردیبهشت','خرداد','تیر','مرداد','شهریور',
            'مهر','آبان','آذر','دی','بهمن','اسفند'];
  }

  override createDate(year: number, month: number, date: number): moment.Moment {
    const result = moment(`${year}/${month + 1}/${date}`, 'jYYYY/jM/jD');
    if (!result.isValid()) {
      throw Error(`تاریخ نامعتبر: سال=${year} ماه=${month} روز=${date}`);
    }
    return result;
  }

  override today(): moment.Moment {
    return moment();
  }

  override addCalendarYears(date: moment.Moment, years: number): moment.Moment {
    return (this.clone(date) as any).add(years, 'jYear');
  }

  override addCalendarMonths(date: moment.Moment, months: number): moment.Moment {
    return (this.clone(date) as any).add(months, 'jMonth');
  }

  override format(date: moment.Moment, displayFormat: string): string {
    const clonedDate = this.clone(date);
    if (!this.isValid(clonedDate)) {
      throw Error('تاریخ نامعتبر جهت فرمت‌دهی');
    }
    return clonedDate.format(displayFormat);
  }

  override parse(value: any, parseFormat: string | string[]): moment.Moment | null {
    if (value instanceof Date) {
      return moment(value);
    }
    if (value && typeof value === 'string') {
      const jalaliMoment = moment(value, 'jYYYY/jMM/jDD', true);
      if (jalaliMoment.isValid()) {
        return jalaliMoment;
      }
    }
    return null;
  }
}
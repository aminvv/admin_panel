import { Component, OnInit } from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';

@Component({
  selector: 'app-settings-edit-form',
  templateUrl: './settings-edit-form.component.html',
  styleUrls: ['./settings-edit-form.component.scss']
})
export class SettingsEditFormComponent implements OnInit {
  public settingForm: UntypedFormGroup;

  constructor() {
  }

  public ngOnInit() {
    this.settingForm = new UntypedFormGroup({
      lang: new UntypedFormControl('eng'),
    });
  }

  get lang() {
    return this.settingForm.get('lang') as UntypedFormControl;
  }
}

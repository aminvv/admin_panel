import { Component, OnInit } from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';

@Component({
  selector: 'app-account-edit-form',
  templateUrl: './account-edit-form.component.html',
  styleUrls: ['./account-edit-form.component.scss']
})
export class AccountEditFormComponent implements OnInit {
  public editForm: UntypedFormGroup;

  constructor() {
  }

  public ngOnInit() {
    this.editForm = new UntypedFormGroup({
      userName: new UntypedFormControl('user'),
      userEmail: new UntypedFormControl('user@mail.com'),
      userStatus: new UntypedFormControl('admin'),
    });
  }

  get userName() {
    return this.editForm.get('userName') as UntypedFormControl;
  }

  get userEmail() {
    return this.editForm.get('userEmail') as UntypedFormControl;
  }

  get userStatus() {
    return this.editForm.get('userStatus') as UntypedFormControl;
  }
}

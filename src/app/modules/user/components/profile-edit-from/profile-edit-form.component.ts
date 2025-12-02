import { Component, OnInit } from '@angular/core';
import {UntypedFormControl, UntypedFormGroup} from '@angular/forms';

@Component({
  selector: 'app-profile-edit-form',
  templateUrl: './profile-edit-form.component.html',
  styleUrls: ['./profile-edit-form.component.scss']
})
export class ProfileEditFormComponent implements OnInit {
  public socialForm: UntypedFormGroup;
  public companyForm: UntypedFormGroup;
  public profileForm: UntypedFormGroup;

  constructor() {
  }

  public ngOnInit() {
    this.profileForm = new UntypedFormGroup({
      userName: new UntypedFormControl('Jane'),
      userSecondName: new UntypedFormControl('Jonson'),
      userPhone: new UntypedFormControl('1-555-666-7070'),
      userEmail: new UntypedFormControl('Jane@gmail.com'),
      userCountry: new UntypedFormControl('us'),
      userState: new UntypedFormControl('california'),
      userCity: new UntypedFormControl('poloAlto'),
      userStreet: new UntypedFormControl('1258 Riverside Drive Redding')
    });

    this.companyForm = new UntypedFormGroup({
      companyName: new UntypedFormControl('Company'),
      companyId: new UntypedFormControl('AD1234567891'),
      companyEmail: new UntypedFormControl('company@gmail.com'),
      companyPhone: new UntypedFormControl('1-353-969-7070')
    });

    this.socialForm = new UntypedFormGroup({
      facebook: new UntypedFormControl('https://www.facebook.com/janejonson'),
      twitter: new UntypedFormControl('https://twitter/janejonson'),
      instagram: new UntypedFormControl('https://www.instagram.com/janejonson'),
      github: new UntypedFormControl('https://github.com/janejonson'),
      codepen: new UntypedFormControl('https://codepen.io/janejonson'),
      nik: new UntypedFormControl('@janejonson')
    });
  }

  get userName() {
    return this.profileForm.get('userName') as UntypedFormControl;
  }

  get userSecondName() {
    return this.profileForm.get('userSecondName') as UntypedFormControl;
  }

  get userPhone() {
    return this.profileForm.get('userPhone') as UntypedFormControl;
  }

  get userEmail() {
    return this.profileForm.get('userEmail') as UntypedFormControl;
  }

  get userCountry() {
    return this.profileForm.get('userCountry') as UntypedFormControl;
  }

  get userState() {
    return this.profileForm.get('userState') as UntypedFormControl;
  }

  get userCity() {
    return this.profileForm.get('userCity') as UntypedFormControl;
  }

  get userStreet() {
    return this.profileForm.get('userStreet') as UntypedFormControl;
  }

  get companyName() {
    return this.companyForm.get('companyName') as UntypedFormControl;
  }

  get companyId() {
    return this.companyForm.get('companyId') as UntypedFormControl;
  }

  get companyEmail() {
    return this.companyForm.get('companyEmail') as UntypedFormControl;
  }

  get companyPhone() {
    return this.companyForm.get('companyPhone') as UntypedFormControl;
  }

  get facebook() {
    return this.socialForm.get('facebook') as UntypedFormControl;
  }

  get twitter() {
    return this.socialForm.get('twitter') as UntypedFormControl;
  }

  get instagram() {
    return this.socialForm.get('instagram') as UntypedFormControl;
  }

  get github() {
    return this.socialForm.get('github') as UntypedFormControl;
  }

  get codepen() {
    return this.socialForm.get('codepen') as UntypedFormControl;
  }

  get nik() {
    return this.socialForm.get('nik') as UntypedFormControl;
  }
}

import { Component, OnInit } from '@angular/core';
import { UntypedFormControl, UntypedFormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-simple-validation',
  templateUrl: './simple-validation.component.html',
  styleUrls: ['./simple-validation.component.scss']
})
export class SimpleValidationComponent implements OnInit {
  public form: UntypedFormGroup;

  ngOnInit(): void {
    this.form = new UntypedFormGroup({
      optionA: new UntypedFormControl(''),
      optionB: new UntypedFormControl('')
    });
  }

  public validate(): void {
    this.optionA.setValidators([Validators.required]);
    this.optionB.setValidators([Validators.required, Validators.minLength(10)]);
  }

  get optionA() {
    return this.form.get('optionA') as UntypedFormControl;
  }

  get optionB() {
    return this.form.get('optionB') as UntypedFormControl;
  }
}

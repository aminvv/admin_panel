import { Component, OnInit } from '@angular/core';
import {routes} from '../../../../consts';
import {UntypedFormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-edit-page',
  templateUrl: './edit-page.component.html',
  styleUrls: ['./edit-page.component.scss']
})
export class EditPageComponent implements OnInit {
  public routes: typeof routes = routes;
  public selectedTab = new UntypedFormControl(0);

  ngOnInit(): void {
  }



}

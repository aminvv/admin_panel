import { Component, EventEmitter, OnInit, Output } from '@angular/core';
import { MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-popup',
  templateUrl: './delete-popup.component.html',
  styleUrls: ['./delete-popup.component.scss']
})
export class DeletePopupComponent implements OnInit {

  @Output() deleteConfirmed = new EventEmitter<any>();

  constructor(public dialogRef: MatDialogRef<DeletePopupComponent>) { }

  ngOnInit(): void {
  }

  delete() {
    this.deleteConfirmed.emit();
    console.log('✅ کاربر تایید کرد - ارسال true');
    this.dialogRef.close();
  }

  cancel(): void {
    this.dialogRef.close();
      console.log('❌ کاربر لغو کرد - ارسال false');
  }

}

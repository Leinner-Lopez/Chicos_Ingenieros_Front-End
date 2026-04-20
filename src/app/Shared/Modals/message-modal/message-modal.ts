import { DIALOG_DATA, DialogRef } from '@angular/cdk/dialog';
import { Component, Inject, inject } from '@angular/core';

@Component({
  selector: 'app-message-modal',
  imports: [],
  templateUrl: './message-modal.html',
  styleUrl: './message-modal.css',
})
export class MessageModal {

  dialogRef: DialogRef<string> = inject(DialogRef);
  title: string = '';
  message: string = '';

  constructor(@Inject(DIALOG_DATA) public data: any) {
    if (data) {
      this.title = data.title || '';
      this.message = data.message || '';
    }
  }

  closeModal(){
    this.dialogRef.close();
  }
}

import { inject, Injectable } from '@angular/core';
import { Dialog } from '@angular/cdk/dialog';
import { MessageModal } from '../../Shared/Modals/message-modal/message-modal';

@Injectable({ providedIn: 'root' })
export class ModalNotificationService {
  private readonly dialog = inject(Dialog);

  showSuccess(title: string, message: string, onClose: () => void, delayMs = 1500): void {
    const ref = this.dialog.open<string>(MessageModal, { data: { title, message } });
    setTimeout(() => { ref.close(); onClose(); }, delayMs);
  }
}

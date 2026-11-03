import { Component, inject, OnInit, signal } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { TranslocoPipe, TranslocoService } from '@jsverse/transloco';
import { TranslocoDatePipe, TranslocoLocaleService } from '@jsverse/transloco-locale';
import { finalize, Observable } from 'rxjs';
import { BackupService } from '../../../../Data/Services/backup-service';
import { ApiError, Backup, BackupOperationResponse, BackupType } from '../../../../Data/Interfaces/Backup';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';
import { MessageModal } from '../../../../Shared/Modals/message-modal/message-modal';
import { ModalNotificationService } from '../../../../Core/Services/modal-notification.service';

@Component({
  selector: 'app-backup',
  imports: [TranslocoPipe, TranslocoDatePipe],
  templateUrl: './backup.html',
  styleUrl: './backup.css',
})
export class BackupView implements OnInit {
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);
  private readonly backupService = inject(BackupService);
  private readonly notification = inject(ModalNotificationService);
  private readonly t = inject(TranslocoService);
  private readonly localeService = inject(TranslocoLocaleService);

  backups = signal<Backup[]>([]);
  busy = signal(false);
  busyText = signal('');

  readonly typeLabelKeys: Record<BackupType, string> = {
    MANUAL: 'backup.typeManual',
    PRE_RESTORE: 'backup.typePreRestore',
    PRE_PURGE: 'backup.typePrePurge',
  };

  ngOnInit(): void {
    this.loadBackups();
  }

  loadBackups() {
    this.backupService.getBackups().subscribe({
      next: (data) => this.backups.set(data),
      error: (err) => this.showError(err),
    });
  }

  formatSize(bytes: number): string {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  }

  createBackup() {
    this.run(this.t.translate('backup.creating'), this.backupService.createBackup(), () => {
      this.notification.showSuccess(this.t.translate('backup.created'), this.t.translate('backup.createdMsg'), () => {});
      this.loadBackups();
    });
  }

  downloadBackup(backup: Backup) {
    this.run(this.t.translate('backup.downloading'), this.backupService.downloadBackup(backup.backupId), (blob) => {
      const url = URL.createObjectURL(blob);
      const link = this.document.createElement('a');
      link.href = url;
      link.download = backup.fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
  }

  restoreBackup(backup: Backup) {
    const date = this.localeService.localizeDate(new Date(backup.createdAt), undefined, {
      dateStyle: 'short',
      timeStyle: 'short',
    });
    this.confirm(
      this.t.translate('backup.confirmRestoreTitle'),
      this.t.translate('backup.confirmRestoreMsg', { date }),
      () =>
        this.run(this.t.translate('backup.restoring'), this.backupService.restoreBackup(backup.backupId), (res) =>
          this.onOperationDone(this.t.translate('backup.restored'), res),
        ),
    );
  }

  purgeDatabase() {
    this.confirm(
      this.t.translate('backup.confirmPurgeTitle'),
      this.t.translate('backup.confirmPurgeMsg'),
      () =>
        this.run(this.t.translate('backup.purging'), this.backupService.purgeDatabase(), (res) =>
          this.onOperationDone(this.t.translate('backup.purged'), res),
        ),
    );
  }

  private confirm(title: string, message: string, onAccept: () => void) {
    const ref = this.dialog.open<string>(ConfirmModal, {
      data: { title, message, confirmOnly: true },
    });
    ref.closed.subscribe((result) => {
      if (result === 'confirmed') onAccept();
    });
  }

  private onOperationDone(title: string, res: BackupOperationResponse) {
    this.notification.showSuccess(
      title,
      this.t.translate('backup.safetyCopy', { id: res.safetyBackup.backupId }),
      () => {},
      4000,
    );
    // Los servicios no guardan caché y las demás pantallas recargan sus datos al montarse,
    // por lo que solo hay que refrescar el historial de esta pantalla.
    this.loadBackups();
  }

  private run<T>(text: string, op$: Observable<T>, onSuccess: (res: T) => void) {
    if (this.busy()) return;
    this.busy.set(true);
    this.busyText.set(text);
    op$.pipe(finalize(() => this.busy.set(false))).subscribe({
      next: onSuccess,
      error: (err) => this.showError(err),
    });
  }

  private async showError(err: unknown) {
    const message = await this.extractMessage(err);
    this.dialog.open(MessageModal, { data: { title: this.t.translate('common.error'), message } });
  }

  private async extractMessage(err: unknown): Promise<string> {
    if (!(err instanceof HttpErrorResponse) || err.status >= 500 || err.status === 0) {
      return this.t.translate('backup.genericError');
    }
    let body: unknown = err.error;
    if (body instanceof Blob) {
      try {
        body = JSON.parse(await body.text());
      } catch {
        body = null;
      }
    }
    const apiMessage = (body as Partial<ApiError> | null)?.message;
    if (apiMessage) return apiMessage;
    if (err.status === 403) return this.t.translate('backup.forbidden');
    if (err.status === 404) return this.t.translate('backup.notFound');
    return this.t.translate('backup.actionFailed');
  }
}

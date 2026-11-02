import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe, DOCUMENT } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Dialog } from '@angular/cdk/dialog';
import { finalize, Observable } from 'rxjs';
import { BackupService } from '../../../../Data/Services/backup-service';
import { ApiError, Backup, BackupOperationResponse, BackupType } from '../../../../Data/Interfaces/Backup';
import { ConfirmModal } from '../../../../Shared/Modals/confirm-modal/confirm-modal';
import { MessageModal } from '../../../../Shared/Modals/message-modal/message-modal';
import { ModalNotificationService } from '../../../../Core/Services/modal-notification.service';

const GENERIC_ERROR = 'Ocurrió un error interno. Inténtalo de nuevo más tarde.';

@Component({
  selector: 'app-backup',
  imports: [DatePipe],
  templateUrl: './backup.html',
  styleUrl: './backup.css',
})
export class BackupView implements OnInit {
  private readonly dialog = inject(Dialog);
  private readonly document = inject(DOCUMENT);
  private readonly backupService = inject(BackupService);
  private readonly notification = inject(ModalNotificationService);

  backups = signal<Backup[]>([]);
  busy = signal(false);
  busyText = signal('');

  readonly typeLabels: Record<BackupType, string> = {
    MANUAL: 'Manual',
    PRE_RESTORE: 'Automático (antes de restaurar)',
    PRE_PURGE: 'Automático (antes de vaciar)',
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
    this.run('Creando backup…', this.backupService.createBackup(), () => {
      this.notification.showSuccess('Backup creado', 'La copia de seguridad se creó exitosamente.', () => {});
      this.loadBackups();
    });
  }

  downloadBackup(backup: Backup) {
    this.run('Descargando backup…', this.backupService.downloadBackup(backup.backupId), (blob) => {
      const url = URL.createObjectURL(blob);
      const link = this.document.createElement('a');
      link.href = url;
      link.download = backup.fileName;
      link.click();
      setTimeout(() => URL.revokeObjectURL(url), 0);
    });
  }

  restoreBackup(backup: Backup) {
    const date = new Date(backup.createdAt).toLocaleString('es-CO');
    this.confirm(
      'Confirmar Restauración',
      `Esto reemplazará todos los datos actuales (productos, lotes, ventas, categorías y usuarios) por los del backup del ${date}. Tu usuario administrador se conserva. Antes de restaurar se creará un backup automático para que puedas volver atrás.`,
      () =>
        this.run('Restaurando backup…', this.backupService.restoreBackup(backup.backupId), (res) =>
          this.onOperationDone('Base de datos restaurada', res),
        ),
    );
  }

  purgeDatabase() {
    this.confirm(
      'Confirmar Vaciado',
      'Esto eliminará todos los datos actuales (productos, lotes, ventas, categorías y usuarios). Se conserva el usuario administrador y el historial de backups. Antes de vaciar se creará un backup automático para que puedas volver atrás.',
      () =>
        this.run('Vaciando base de datos…', this.backupService.purgeDatabase(), (res) =>
          this.onOperationDone('Base de datos vaciada', res),
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
      `Se guardó una copia previa (#${res.safetyBackup.backupId}) por si necesitas deshacer.`,
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
    this.dialog.open(MessageModal, { data: { title: 'Error', message } });
  }

  private async extractMessage(err: unknown): Promise<string> {
    if (!(err instanceof HttpErrorResponse) || err.status >= 500 || err.status === 0) {
      return GENERIC_ERROR;
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
    if (err.status === 403) return 'No tienes permisos o tu sesión expiró.';
    if (err.status === 404) return 'El backup o su archivo no existen.';
    return 'No se pudo completar la acción.';
  }
}

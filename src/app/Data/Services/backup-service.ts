import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Backup, BackupOperationResponse } from '../Interfaces/Backup';
import { API_URL } from '../../tokens/api-url.token';

@Injectable({
  providedIn: 'root',
})
export class BackupService {
  private readonly httpClient = inject(HttpClient);
  private readonly apiUrl = `${inject(API_URL)}/backups`;

  createBackup(): Observable<Backup> {
    return this.httpClient.post<Backup>(this.apiUrl, null);
  }

  getBackups(): Observable<Backup[]> {
    return this.httpClient.get<Backup[]>(this.apiUrl);
  }

  downloadBackup(id: number): Observable<Blob> {
    return this.httpClient.get(`${this.apiUrl}/${id}/download`, { responseType: 'blob' });
  }

  restoreBackup(id: number): Observable<BackupOperationResponse> {
    return this.httpClient.post<BackupOperationResponse>(`${this.apiUrl}/${id}/restore`, null);
  }

  purgeDatabase(): Observable<BackupOperationResponse> {
    return this.httpClient.post<BackupOperationResponse>(`${this.apiUrl}/purge`, null);
  }
}

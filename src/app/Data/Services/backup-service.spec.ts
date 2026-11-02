import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { BackupService } from './backup-service';
import { Backup, BackupOperationResponse } from '../Interfaces/Backup';
import { environment } from '../../../environments/environment';
import { API_URL } from '../../tokens/api-url.token';

describe('BackupService', () => {
  let service: BackupService;
  let httpMock: HttpTestingController;
  const apiUrl = `${environment.apiUrl}/backups`;

  const mockBackup: Backup = {
    backupId: 1,
    fileName: 'backup-1.json.gz',
    createdAt: '2026-11-02T10:30:00.123',
    createdBy: 'admin@test.com',
    sizeBytes: 2048,
    recordCount: 120,
    checksum: 'abc',
    type: 'MANUAL',
  };

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [BackupService, { provide: API_URL, useValue: environment.apiUrl }],
    });
    service = TestBed.inject(BackupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('debe crear un backup (POST sin body)', () => {
    service.createBackup().subscribe((b) => expect(b).toEqual(mockBackup));
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(mockBackup);
  });

  it('debe obtener el historial (GET)', () => {
    service.getBackups().subscribe((list) => expect(list).toEqual([mockBackup]));
    const req = httpMock.expectOne(apiUrl);
    expect(req.request.method).toBe('GET');
    req.flush([mockBackup]);
  });

  it('debe descargar un backup como blob (GET)', () => {
    service.downloadBackup(1).subscribe((blob) => expect(blob).toBeInstanceOf(Blob));
    const req = httpMock.expectOne(`${apiUrl}/1/download`);
    expect(req.request.method).toBe('GET');
    expect(req.request.responseType).toBe('blob');
    req.flush(new Blob(['data']));
  });

  it('debe restaurar un backup (POST sin body)', () => {
    const response: BackupOperationResponse = { message: 'ok', safetyBackup: { ...mockBackup, backupId: 2, type: 'PRE_RESTORE' } };
    service.restoreBackup(1).subscribe((r) => expect(r.safetyBackup.backupId).toBe(2));
    const req = httpMock.expectOne(`${apiUrl}/1/restore`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(response);
  });

  it('debe vaciar la base de datos (POST sin body)', () => {
    const response: BackupOperationResponse = { message: 'ok', safetyBackup: { ...mockBackup, backupId: 3, type: 'PRE_PURGE' } };
    service.purgeDatabase().subscribe((r) => expect(r.safetyBackup.type).toBe('PRE_PURGE'));
    const req = httpMock.expectOne(`${apiUrl}/purge`);
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toBeNull();
    req.flush(response);
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { SalesHistory } from './sales-history';
import { API_URL } from '../../../../tokens/api-url.token';
import { environment } from '../../../../../environments/environment';

describe('SalesHistory', () => {
  let component: SalesHistory;
  let fixture: ComponentFixture<SalesHistory>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SalesHistory, HttpClientTestingModule],
      providers: [{ provide: API_URL, useValue: environment.apiUrl }],
    }).compileComponents();

    fixture = TestBed.createComponent(SalesHistory);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

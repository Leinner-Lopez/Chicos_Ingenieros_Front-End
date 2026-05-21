import { ComponentFixture, TestBed } from '@angular/core/testing';

import { RegisterLot } from './register-lot';

describe('RegisterLot', () => {
  let component: RegisterLot;
  let fixture: ComponentFixture<RegisterLot>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [RegisterLot]
    })
    .compileComponents();

    fixture = TestBed.createComponent(RegisterLot);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuyProductModal } from './buy-product-modal';

describe('BuyProductModal', () => {
  let component: BuyProductModal;
  let fixture: ComponentFixture<BuyProductModal>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BuyProductModal]
    })
    .compileComponents();

    fixture = TestBed.createComponent(BuyProductModal);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

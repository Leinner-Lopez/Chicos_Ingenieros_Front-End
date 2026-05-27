import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LotExpirationList } from './lot-expiration-list';
import { LotDTO } from '../../Data/Interfaces/Lot';
import { By } from '@angular/platform-browser';

const mockLots: LotDTO[] = [
  { lotId: 1, productName: 'Arroz Diana', stockQuantity: 50, expirationDate: '2025-06-01' },
  { lotId: 2, productName: 'Leche Entera', stockQuantity: 20, expirationDate: '2025-07-15' },
];

describe('LotExpirationList', () => {
  let fixture: ComponentFixture<LotExpirationList>;
  let component: LotExpirationList;

  function setup(lots: LotDTO[] = [], fecha = 'Lunes, 5 de enero', title?: string) {
    TestBed.configureTestingModule({ imports: [LotExpirationList] });
    fixture = TestBed.createComponent(LotExpirationList);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('lots', lots);
    fixture.componentRef.setInput('fecha', fecha);
    if (title !== undefined) fixture.componentRef.setInput('title', title);
    fixture.detectChanges();
  }

  it('debe ser creado', () => {
    setup();
    expect(component).toBeTruthy();
  });

  it('debe mostrar el título por defecto cuando no se pasa input', () => {
    setup([], 'Lunes, 5 de enero');
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent.trim()).toBe('Lotes por vencer esta semana');
  });

  it('debe mostrar el título personalizado cuando se pasa input', () => {
    setup([], 'Lunes, 5 de enero', 'Lotes de esta semana');
    const h2 = fixture.nativeElement.querySelector('h2');
    expect(h2.textContent.trim()).toBe('Lotes de esta semana');
  });

  it('debe mostrar la fecha recibida', () => {
    setup([], 'Miércoles, 15 de mayo');
    const p = fixture.nativeElement.querySelector('.agenda__header p');
    expect(p.textContent.trim()).toBe('Miércoles, 15 de mayo');
  });

  it('debe renderizar una tarjeta por cada lote', () => {
    setup(mockLots, 'Lunes, 5 de enero');
    const cards = fixture.debugElement.queryAll(By.css('.lote-card'));
    expect(cards.length).toBe(2);
  });

  it('debe mostrar el nombre del producto en cada tarjeta', () => {
    setup(mockLots, 'Lunes, 5 de enero');
    const cards = fixture.debugElement.queryAll(By.css('.lote-card'));
    expect(cards[0].nativeElement.textContent).toContain('Arroz Diana');
    expect(cards[1].nativeElement.textContent).toContain('Leche Entera');
  });

  it('debe mostrar el stock de cada lote', () => {
    setup(mockLots, 'Lunes, 5 de enero');
    const cards = fixture.debugElement.queryAll(By.css('.lote-card'));
    expect(cards[0].nativeElement.textContent).toContain('50 unds');
    expect(cards[1].nativeElement.textContent).toContain('20 unds');
  });

  it('debe mostrar el estado vacío cuando no hay lotes', () => {
    setup([], 'Lunes, 5 de enero');
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).not.toBeNull();
    expect(emptyState.textContent).toContain('No hay lotes en riesgo de vencimiento esta semana.');
  });

  it('no debe mostrar el estado vacío cuando hay lotes', () => {
    setup(mockLots, 'Lunes, 5 de enero');
    const emptyState = fixture.nativeElement.querySelector('.empty-state');
    expect(emptyState).toBeNull();
  });
});

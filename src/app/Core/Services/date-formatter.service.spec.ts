import { TestBed } from '@angular/core/testing';
import { DateFormatterService } from './date-formatter.service';

describe('DateFormatterService', () => {
  let service: DateFormatterService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DateFormatterService);
  });

  it('debe ser creado', () => {
    expect(service).toBeTruthy();
  });

  it('debe retornar una cadena con el formato "DiaSemana, D de mes"', () => {
    const resultado = service.getFechaFormateada();
    expect(resultado).toMatch(/^[\p{L}\s]+, \d+ de [\p{L}\s]+$/u);
  });

  it('debe usar la fecha actual cuando no se pasa argumento', () => {
    const hoy = new Date();
    const resultado = service.getFechaFormateada();
    const mes = hoy.toLocaleDateString('es-ES', { month: 'long' });
    expect(resultado).toContain(`${hoy.getDate()} de ${mes}`);
  });

  it('debe formatear una fecha específica correctamente', () => {
    const fecha = new Date(2025, 0, 6); // Lunes 6 de enero de 2025
    const resultado = service.getFechaFormateada(fecha);
    expect(resultado).toBe('Lunes, 6 de enero');
  });

  it('debe usar el nombre del día de la semana correcto', () => {
    const diasEsperados = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    for (let i = 0; i < 7; i++) {
      const fecha = new Date(2025, 0, 5 + i); // 5 enero es domingo
      const resultado = service.getFechaFormateada(fecha);
      expect(resultado.startsWith(diasEsperados[i])).toBe(true);
    }
  });
});

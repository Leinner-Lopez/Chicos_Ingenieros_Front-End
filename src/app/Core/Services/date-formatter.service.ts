import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class DateFormatterService {
  private readonly díasSemana = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

  getFechaFormateada(fecha: Date = new Date()): string {
    const diaSemana = this.díasSemana[fecha.getDay()];
    const dia = fecha.getDate();
    const mes = fecha.toLocaleDateString('es-ES', { month: 'long' });
    return `${diaSemana}, ${dia} de ${mes}`;
  }
}

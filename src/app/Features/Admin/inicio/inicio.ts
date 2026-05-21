import { Component } from '@angular/core';
import { signal } from '@angular/core';

@Component({
  selector: 'app-inicio-admin',
  imports: [],
  templateUrl: './inicio.html',
  styleUrl: './inicio.css',
})
export class InicioAdmin {
  filtroActual = signal<'Pendientes' | 'Completadas'>('Pendientes');

  cambiarFiltro(nuevoFiltro: 'Pendientes' | 'Completadas'): void {
    if (this.filtroActual() === nuevoFiltro) return;
    this.filtroActual.set(nuevoFiltro);
  }

  díasSemana: string[] = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
  fechaFormateada = this.getFechaFormateada();

  getFechaFormateada(): string {
    const fecha: Date = new Date();
    const diaSemana: string = this.díasSemana[fecha.getDay()];
    const dia: number = fecha.getDate();
    const mes: string = fecha.toLocaleDateString('es-ES', { month: 'long' });
    return `${diaSemana}, ${dia} de ${mes}`;
  }
}

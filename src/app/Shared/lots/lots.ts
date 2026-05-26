import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { LotService } from '../../Data/Services/lot-service';
import { LotDTO } from '../../Data/Interfaces/Lot';
import { ConfirmModal } from '../Modals/confirm-modal/confirm-modal';
import { RegisterLot } from '../Modals/register-lot/register-lot';

@Component({
  selector: 'app-lots',
  imports: [DatePipe],
  templateUrl: './lots.html',
  styleUrl: './lots.css',
})
export class Lots implements OnInit {
  dialog = inject(Dialog);
  lotService: LotService = inject(LotService);
  lots = signal<LotDTO[]>([]);
  lotsNumber = signal<number>(0);

  ngOnInit(): void {
    this.getLots();
  }

  getLots() {
    this.lotService.getAllLots().subscribe((data) => {
      this.lots.set(data);
    });
    this.lotService.getCountLots().subscribe((data) => {
      this.lotsNumber.set(data);
    });
  }

  registerLot() {
    const dialogRef = this.dialog.open<string>(RegisterLot, {});
    dialogRef.closed.subscribe((result) => {
      if (result === 'Lote registrado') {
        this.getLots();
      }
    });
  }

  deleteLot(lotId: number) {
    const dialogRef = this.dialog.open<string>(ConfirmModal, {
      data: {
        entity: 'lot',
        message: '¿Deseas eliminar este lote?',
        Id: lotId,
      },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Eliminación Exitosa') {
        this.getLots();
      }
    });
  }

  updateLot(lotId: number) {
    const dialogRef = this.dialog.open<string>(RegisterLot, {
      data: { lotId },
    });
    dialogRef.closed.subscribe((result) => {
      if (result === 'Lote actualizado') {
        this.getLots();
      }
    });
  }

  getLotStatusClass(expirationDate: string): 'status-expired' | 'status-soon' | 'status-ok' {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const expiry = new Date(expirationDate);
    expiry.setHours(0, 0, 0, 0);
    const daysLeft = Math.floor((expiry.getTime() - today.getTime()) / 86_400_000);
    if (daysLeft <= 0) return 'status-expired';
    if (daysLeft <= 7) return 'status-soon';
    return 'status-ok';
  }
}

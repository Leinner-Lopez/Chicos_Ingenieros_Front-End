import { Dialog } from '@angular/cdk/dialog';
import { Component, inject, signal } from '@angular/core';
import { LotService } from '../../../Data/Services/lot-service';
import { LotDTO } from '../../../Data/Interfaces/Lot';
import { ConfirmModal } from '../../../Shared/Modals/confirm-modal/confirm-modal';
import { RegisterLot } from '../../../Shared/Modals/register-lot/register-lot';

@Component({
  selector: 'app-lots',
  imports: [],
  templateUrl: './lots.html',
  styleUrl: './lots.css',
})
export class Lots {
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
}

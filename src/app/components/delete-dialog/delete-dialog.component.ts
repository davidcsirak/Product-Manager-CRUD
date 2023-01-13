import { Component, Inject } from '@angular/core';
import { ApiService } from '../../services/api.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-delete-dialog',
  templateUrl: './delete-dialog.component.html',
  styleUrls: ['./delete-dialog.component.css'],
})
export class DeleteDialogComponent {
  constructor(
    private api: ApiService,
    private dialogRef: MatDialogRef<DeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public productData: any,
    private _snackBar: MatSnackBar
  ) {}

  onDeleteProduct() {
    this.api.deleteProduct(this.productData.id).subscribe({
      next: () => {
        this.openSnackBarWith('Termék törölve!');
        this.dialogRef.close('delete');
      },
      error: () => {
        this.openSnackBarWith('Hiba történt a termék törlése közben!');
      },
    });
  }

  onCancel() {
    this.dialogRef.close('cancel');
  }

  openSnackBarWith(message: string) {
    this._snackBar.open(message, 'X', { duration: 3000 });
  }
}

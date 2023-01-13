import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from '../../services/api.service';
import { AuthService } from '../../services/auth.service';
import { Product } from '../../models/product.model';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-dialog',
  templateUrl: './dialog.component.html',
  styleUrls: ['./dialog.component.css'],
})
export class DialogComponent implements OnInit {
  productForm: FormGroup;
  currentUserId: number;
  actionBtn: string = 'Létrehozás';

  constructor(
    private formBuilder: FormBuilder,
    private api: ApiService,
    private authService: AuthService,
    private dialogRef: MatDialogRef<DialogComponent>,
    @Inject(MAT_DIALOG_DATA) public editData: any,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.productForm = this.formBuilder.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.pattern('^[0-9]*$')]],
      description: ['', Validators.required],
      created_at: [new Date(), Validators.required],
    });

    this.authService.user.subscribe((user) => {
      if (user) {
        this.currentUserId = user.id;
      }
    });

    if (this.editData) {
      this.actionBtn = 'Mentés';
      this.productForm.controls['name'].setValue(this.editData.name);
      this.productForm.controls['price'].setValue(this.editData.price);
      this.productForm.controls['description'].setValue(
        this.editData.description
      );
      this.productForm.controls['created_at'].setValue(
        this.editData.created_at
      );
    }
  }

  onCreateProduct() {
    if (!this.editData) {
      if (this.productForm.valid) {
        const createdProduct = new Product(
          this.currentUserId,
          this.productForm.controls['name'].value,
          this.productForm.controls['price'].value,
          this.productForm.controls['description'].value,
          this.productForm.controls['created_at'].value
        );

        this.api.addProduct(createdProduct).subscribe({
          next: () => {
            this.openSnackBarWith('Termék létrehozva!');
            this.productForm.reset();
            this.dialogRef.close('create');
          },
          error: (err) => {
            this.openSnackBarWith('Hiba történt a termék létrehozása közben!');
          },
        });
      }
    } else {
      this.updateProduct();
    }
  }

  updateProduct() {
    this.api
      .putProduct(
        { ...this.productForm.value, owner_id: this.currentUserId },
        this.editData.id
      )
      .subscribe({
        next: () => {
          this.openSnackBarWith('Termék frissítve!');
          this.productForm.reset();
          this.dialogRef.close('update');
        },
        error: () => {
          this.openSnackBarWith('Hiba történt a termék frissítése közben!');
        },
      });
  }

  onCancelBtn() {
    this.dialogRef.close('cancel');
  }

  openSnackBarWith(message: string) {
    this._snackBar.open(message, 'X', { duration: 3000 });
  }
}

import { Component, OnInit, AfterViewInit, Input } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../../services/api.service';

import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../../models/product.model';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { catchError, map, of, startWith, switchMap } from 'rxjs';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit, AfterViewInit {
  displayedColumns: string[] = [
    'name',
    'price',
    'description',
    'created_at',
    'action',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  public totalData: number;
  public dataSource = new MatTableDataSource<Product>();
  public isLoading = false;
  @Input() value: number;
  public searchForm: FormGroup;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private deleteDialog: MatDialog,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    this.setNameTableFilter();

    this.searchForm = this.formBuilder.group({
      filter: [''],
    });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      this.onPaginatorChange();
    });
  }

  openDialog() {
    this.dialog
      .open(DialogComponent)
      .afterClosed()
      .subscribe((value) => {
        if (value === 'create') {
          this.getPaginatedProducts();
        }
      });
  }

  openDeleteDialog(row: any) {
    this.deleteDialog
      .open(DeleteDialogComponent, {
        data: row,
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'delete') {
          this.getPaginatedProducts();
        }
      });
  }

  editProduct(row: any) {
    this.dialog
      .open(DialogComponent, {
        data: row,
      })
      .afterClosed()
      .subscribe((value) => {
        if (value === 'update') {
          this.getPaginatedProducts();
        }
      });
  }

  applyFilter(event: Event) {
    setTimeout(() => {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();

      this.api.getAllProducts().subscribe((products: Product[]) => {
        this.dataSource.data = products;
        this.dataSource.paginator = this.paginator;
      });

      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }, 600);
  }

  setNameTableFilter() {
    this.dataSource.filterPredicate = (
      data: Product,
      filter: string
    ): boolean => {
      return data.name.toLocaleLowerCase().includes(filter);
    };
  }

  getPaginatedProducts() {
    this.isLoading = true;
    this.api
      .getProductsWithPagination(
        this.paginator.pageIndex + 1,
        this.paginator.pageSize
      )
      .pipe(
        catchError(() => of(null)),
        map((res) => {
          if (
            res === null ||
            res.body === null ||
            res.headers.get('X-Total-Count') === '0'
          ) {
            return [];
          }
          this.totalData = +res.headers.get('X-Total-Count')!;
          return res.body;
        })
      )
      .subscribe((products: Product[]) => {
        this.dataSource.data = products;
        this.isLoading = false;
      });
  }

  onPaginatorChange() {
    this.paginator.page
      .pipe(
        startWith({}),
        switchMap(() => {
          this.isLoading = true;
          return this.api
            .getProductsWithPagination(
              this.paginator.pageIndex + 1,
              this.paginator.pageSize
            )
            .pipe(catchError(() => of(null)));
        }),
        map((res) => {
          if (
            res === null ||
            res.body === null ||
            res.headers.get('X-Total-Count') === '0'
          ) {
            return [];
          }
          this.totalData = +res.headers.get('X-Total-Count')!;
          return res.body;
        })
      )
      .subscribe((products: Product[]) => {
        if (!this.searchForm.controls['filter'].value) {
          this.dataSource.data = products;
        }
        this.isLoading = false;
      });
  }
}

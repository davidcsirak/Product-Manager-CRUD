import { Component, OnInit, AfterViewInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { DialogComponent } from '../dialog/dialog.component';
import { ApiService } from '../../services/api.service';

import { ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatTableDataSource } from '@angular/material/table';
import { Product } from '../../models/product.model';
import { DeleteDialogComponent } from '../delete-dialog/delete-dialog.component';
import { catchError, map, of, startWith, switchMap } from 'rxjs';

@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.css'],
})
export class ProductsComponent implements OnInit {
  displayedColumns: string[] = [
    'name',
    'price',
    'description',
    'created_at',
    'action',
  ];

  @ViewChild(MatPaginator) paginator: MatPaginator;
  totalData: number;
  dataSource = new MatTableDataSource<any>();
  isLoading = false;

  constructor(
    private dialog: MatDialog,
    private api: ApiService,
    private deleteDialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.setNameTableFilter();
  }

  ngAfterViewInit() {
    this.onPaginatorChange();
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
    this.dataSource.paginator = this.paginator;
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
          )
            return [];
          this.totalData = +res.headers.get('X-Total-Count')!;
          this.isLoading = false;
          return res.body;
        })
      )
      .subscribe({
        next: (products: Product[]) => {
          this.dataSource = new MatTableDataSource(products);
          this.dataSource.paginator = this.paginator;
        },
        error: () => {
          alert('Error occured while fetching paginated products');
        },
      });
  }

  onPaginatorChange() {
    this.dataSource.paginator = this.paginator;
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
            this.isLoading = false;
            return [];
          }
          this.totalData = +res.headers.get('X-Total-Count')!;
          this.isLoading = false;
          return res.body;
        })
      )
      .subscribe((products: Product[]) => {
        this.dataSource = new MatTableDataSource(products);
      });
  }
}

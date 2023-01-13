import { Component, OnInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { ApiService } from '../../services/api.service';
import { Product } from '../../models/product.model';
import { User } from '../../models/user.model';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.css'],
})
export class UsersComponent implements OnInit {
  displayedColumns: string[] = ['name', 'email', 'permissions'];

  dataSource = new MatTableDataSource<any>();

  constructor(private api: ApiService) {}

  ngOnInit(): void {
    this.getAllUsers();
    this.setNameTableFilter();
  }

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }

  getAllUsers() {
    this.api.getUsers().subscribe({
      next: (users) => {
        this.dataSource = new MatTableDataSource(users);
      },
      error: () => {
        alert('Error while fetching users!');
      },
    });
  }

  setNameTableFilter() {
    this.dataSource.filterPredicate = (data: User, filter: string): boolean => {
      return data.name.toLocaleLowerCase().includes(filter);
    };
  }
}

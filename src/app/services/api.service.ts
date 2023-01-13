import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product.model';
import { AuthService } from './auth.service';
import { exhaustMap, take } from 'rxjs';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  apiURL = 'http://localhost:3000';
  constructor(private http: HttpClient, private authService: AuthService) {}

  addProduct(product: Product) {
    return this.http.post<Product>(this.apiURL + '/products', product);
  }

  putProduct(data: any, id: number) {
    return this.http.put<Product>(this.apiURL + `/products/${id}`, data);
  }

  deleteProduct(id: number) {
    return this.http.delete<Product>(this.apiURL + `/products/${id}`);
  }

  getProductsWithPagination(pageNumber: number, pageSize: number) {
    return this.authService.user.pipe(
      take(1),
      exhaustMap((user) => {
        return this.http.get<Product[]>(
          this.apiURL +
            `/products?owner_id=${
              user!.id
            }&_page=${pageNumber}&_limit=${pageSize}`,
          { observe: 'response' }
        );
      })
    );
  }

  getUsers() {
    return this.http.get<User[]>(this.apiURL + `/users`);
  }
}

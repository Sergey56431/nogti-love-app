import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {

  constructor(private readonly http: HttpClient) {
  }

  public getAllCategories(): Observable<any> {
    return this.http.get<any>(environment.api + 'category');
  }

  public getCategoryById(id: string): Observable<any> {
    return this.http.get<any>(environment.api + 'category', {
      params: {
        id: id,
      },
    });
  }

  public getCategoryByUser(userId: string): Observable<any> {
    return this.http.get<any>(environment.api + 'category', {
      params: {
        userId: userId,
      },
    });
  }

  public createCategory(category: any): Observable<any> {
    return this.http.post<any>(environment.api + 'category', category);
  }

  public updateCategory(category: any, id: string): Observable<any> {
    return this.http.put<any>(environment.api + 'category', {
      params: {
        id: id,
      },
      body: category,
    });
  }

  public deleteCategory(id: string): Observable<any> {
    return this.http.delete<any>(environment.api + 'category', {
      params: {
        id: id,
      },
    });
  }
}

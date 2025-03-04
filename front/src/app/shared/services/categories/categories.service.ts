import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';
import { Observable } from 'rxjs';
import { CategoriesType } from '@shared/types/categories.type';
import { DefaultResponseType } from '@shared/types';

@Injectable({
  providedIn: 'root',
})
export class CategoriesService {

  constructor(private readonly http: HttpClient) {
  }

  public getAllCategories(): Observable<CategoriesType[] | DefaultResponseType> {
    return this.http.get<CategoriesType[] | DefaultResponseType>(environment.api + 'category');
  }

  public getCategoryById(id: string): Observable<CategoriesType | DefaultResponseType> {
    return this.http.get<CategoriesType | DefaultResponseType>(environment.api + 'category', {
      params: {
        id: id,
      },
    });
  }

  public getCategoryByUser(userId: string): Observable<CategoriesType[] | DefaultResponseType> {
    return this.http.get<CategoriesType[] | DefaultResponseType>(environment.api + 'category', {
      params: {
        userId: userId,
      },
    });
  }

  public createCategory(category: CategoriesType): Observable<CategoriesType[] | DefaultResponseType> {
    return this.http.post<CategoriesType[] | DefaultResponseType>(environment.api + 'category', category);
  }

  public updateCategory(category: Partial<CategoriesType>, id: string): Observable<CategoriesType | DefaultResponseType> {
    return this.http.put<CategoriesType | DefaultResponseType>(environment.api + 'category?id=' + id, category);
  }

  public deleteCategory(id: string): Observable<CategoriesType | DefaultResponseType> {
    return this.http.delete<CategoriesType>(environment.api + 'category', {
      params: {
        id: id,
      },
    });
  }
}

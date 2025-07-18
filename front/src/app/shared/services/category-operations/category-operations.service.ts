import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperationCategoryInterface } from '@shared/types/operations';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CategoryOperationsService {

  constructor(private readonly _http: HttpClient) {}

  public getCategoriesByUser(userId: string): Observable<OperationCategoryInterface[]> {
    return this._http.get<OperationCategoryInterface[]>(environment.api + 'categoryOperations', { params: {
      userId: userId }
    });
  }

  public getCategoryById(categoryId: string): Observable<OperationCategoryInterface> {
    return this._http.get<OperationCategoryInterface>(environment.api + 'categoryOperations', {
      params: {
        id: categoryId
      }
    });
  }

  public createCategory(category: OperationCategoryInterface): Observable<OperationCategoryInterface> {
    return this._http.post<OperationCategoryInterface>(environment.api + 'categoryOperations', category);
  }

  public deleteCategory(categoryId: string): Observable<OperationCategoryInterface> {
    return this._http.delete<OperationCategoryInterface>(environment.api + 'categoryOperations', {
      params: {
        id: categoryId
      }
    });
  }

  public editCategory(category: Partial<OperationCategoryInterface>): Observable<OperationCategoryInterface> {
    return this._http.put<OperationCategoryInterface>(environment.api + 'categoryOperations', category , {
      params: {
        id: category.id ?? ''
      }
    });
  }
}

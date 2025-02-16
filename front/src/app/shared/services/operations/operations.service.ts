import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { OperationsInterface } from '@shared/types/operations';
import { DefaultResponseType } from '@shared/types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  constructor(private readonly _http: HttpClient) {
  }

  public fetchAllOperations(): Observable<OperationsInterface[] | DefaultResponseType> {
    return this._http.get<OperationsInterface[] | DefaultResponseType>(environment.api + 'operations');
  }

  public fetchOperationsByUser(userId: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.get<OperationsInterface | DefaultResponseType>(
      environment.api + 'operations/', {
        params: {
          userId: userId,
        },
      },
    );
  }

  public fetchOneOperation(id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.get<OperationsInterface | DefaultResponseType>(environment.api + 'operations/', {
      params: {
        id: id,
      },
    });
  }

  public createOperation(operation: OperationsInterface, userId: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.post<OperationsInterface>(environment.api + 'operations', {
      params: {
        userId: userId,
      },
      body: operation,
    });
  }

  public updateOperation(operation: OperationsInterface, id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.put<OperationsInterface | DefaultResponseType>(environment.api + 'operations/', {
      params: {
        id: id,
      },
      body: operation,
    });
  }

  public deleteOperation(id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.delete<OperationsInterface | DefaultResponseType>(environment.api + 'operations/', {
      params: {
        id: id,
      },
    });
  }
}

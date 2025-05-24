import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateOperationInterface, OperationsInterface } from '@shared/types/operations';
import { DefaultResponseType } from '@shared/types';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class OperationsService {
  constructor(private readonly _http: HttpClient) {
  }

  public fetchAllOperations(): Observable<OperationsInterface[] | DefaultResponseType> {
    return this._http.get<OperationsInterface[] | DefaultResponseType>(environment.api + 'operation');
  }

  //сделать динамические query параметры
  public fetchOperationsByUser(userId: string, query?: {type?: string, period?: string}): Observable<OperationsInterface[] | DefaultResponseType> {
    return this._http.get<OperationsInterface[] | DefaultResponseType>(
      environment.api + 'operation', {
        params: {
          ...query,
          userId: userId,
        },
      },
    );
  }

  public fetchOneOperation(id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.get<OperationsInterface | DefaultResponseType>(environment.api + 'operation/', {
      params: {
        id: id,
      },
    });
  }

  public createOperation(operation: CreateOperationInterface): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.post<OperationsInterface>(environment.api + 'operation', operation);
  }

  public updateOperation(operation: Partial<CreateOperationInterface>, id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.put<OperationsInterface | DefaultResponseType>(environment.api + 'operation', operation, {
      params: {
        id: id,
      },
    });
  }

  public deleteOperation(id: string): Observable<OperationsInterface | DefaultResponseType> {
    return this._http.delete<OperationsInterface | DefaultResponseType>(environment.api + 'operation', {
      params: {
        id: id,
      },
    });
  }
}

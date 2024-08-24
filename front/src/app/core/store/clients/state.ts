import {Action, Selector, State, StateContext} from '@ngxs/store';
import {Inject, Injectable} from '@angular/core';
import {ClientsAction} from './action';
import {ClientsService} from '@shared/services'; //переделать импорты
import {patch} from '@ngxs/store/operators';
import {ClientType} from '@shared/types';

export interface ClientsStateModel {
  clients?: ClientType[]
}

@State<ClientsStateModel>({
  name: 'clients',
  defaults: {
    clients: []
  }
})

@Injectable()
export class ClientsState {
  private readonly _service = Inject(ClientsService);

  @Selector()
  public static getClients(state: ClientsStateModel){
    return state.clients;
  }

  @Action(ClientsAction.LoadClients)
  _loadClients(ctx: StateContext<ClientsStateModel>) {
    const state = ctx.getState();
    if (state.clients !== null){
      return;
    }
    this._service.getClients()
      .subscribe((clients: ClientType[] )=> {
        ctx.setState(patch({
          clients: clients
        }));
        ctx.dispatch(new ClientsAction.LoadClientsSuccess(clients));
      });
  }
}

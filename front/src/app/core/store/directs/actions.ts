import {CalendarResponse} from '@shared/types';

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace Directs {

  export class GetDirects {
    static readonly type = '[Directs] Get Directs';
    constructor(public readonly id: string) {
    }
  }

  export class GetDirectsSuccess {
    static readonly type = '[Directs] Get Directs Success';
    constructor(public readonly payload: CalendarResponse) {
    }
  }
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace CalendarActions {
  export class FetchInterval {
    public static type = '[Calendar] Fetch Interval';
    constructor(public readonly interval: string[], public readonly masterId: string) {
    }
  }
}

import { DirectsClientType } from '@shared/types/directs-client.type';

export type CalendarResponse = {
    id: string,
    date: string,
    state: string,
    userId: string
    directs: DirectsClientType[]
}

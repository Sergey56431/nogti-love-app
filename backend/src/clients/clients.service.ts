import { Injectable } from '@nestjs/common';
import { IClientsService } from './interfaces';

@Injectable()
export class ClientsService implements IClientsService {}

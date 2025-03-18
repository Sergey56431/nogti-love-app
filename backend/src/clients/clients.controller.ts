import { Controller, UseGuards } from '@nestjs/common';
import { TokenGuard } from '../auth';

@UseGuards(TokenGuard)
@Controller('clients')
export class ClientsController {}

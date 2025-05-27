import {
  Controller,
  Post,
  Body,
  Get,
  Query,
  Delete,
  HttpCode,
  HttpStatus,
  Inject,
  Put,
  UseGuards,
} from '@nestjs/common';
import { ReferalService } from './referal.service';
import {
  LinkReferrerDto,
  AwardBonusesDto,
  FindReferralsDto,
  ClientReferralInfo,
} from './interfaces';
import { TokenGuard } from '../auth';

@UseGuards(TokenGuard)
@Controller('referral')
export class ReferalController {
  constructor(
    @Inject(ReferalService)
    private readonly _referalService: ReferalService,
  ) {}

  @Post()
  @HttpCode(HttpStatus.OK)
  async linkReferrer(
    @Body() linkReferrerDto: LinkReferrerDto,
  ): Promise<ClientReferralInfo | null> {
    return this._referalService.create(linkReferrerDto);
  }

  @Get()
  async findReferrals(
    @Query('clientId') clientId: string,
    @Body() findReferralsDto: FindReferralsDto,
  ): Promise<ClientReferralInfo[]> {
    return this._referalService.find(findReferralsDto);
  }

  @Put()
  @HttpCode(HttpStatus.NO_CONTENT)
  async awardBonuses(@Body() awardBonusesDto: AwardBonusesDto): Promise<void> {
    return this._referalService.update(awardBonusesDto);
  }

  @Delete()
  async unlinkReferrer(
    @Query('clientId') clientId: string,
  ): Promise<ClientReferralInfo | null> {
    return this._referalService.remove(clientId);
  }
}

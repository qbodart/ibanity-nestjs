import {
  Controller,
  Get,
  Res,
  Query,
  NotFoundException,
  HttpService,
} from '@nestjs/common';
import { Response } from 'express';
import { IbanityService } from './ibanity.service';

@Controller('ibanity')
export class IbanityController {
  constructor(
    private readonly service: IbanityService,
    private readonly http: HttpService,
  ) {}

  @Get('authorize')
  async authorize(@Res() response: Response) {
    const redirectUrl = await this.service.createAuthorizationCodeRequestUrl();
    return response.redirect(redirectUrl);
  }

  @Get('callback')
  async callback(@Query('code') code: string, @Query('state') state: string) {
    const request = await this.service.findOne({ id: state });
    if (!request) {
      throw new NotFoundException(
        'No request was made with this state!',
        `We could not find a request with the state ${state}`,
      );
    }
    request.authorizationCode = code;
    request.authorizationCodeDate = new Date();
    await this.service.save(request);
    const accessToken = await this.service.getFirstAccessToken(request);
    return this.service.getAccounts(accessToken);
  }

  @Get('accounts')
  async getAccounts() {
    const accessToken = await this.service.getAccessToken();
    const accountsData = await this.service.getAccounts(accessToken);
    const balance = accountsData.data[0].attributes.currentBalance;
    this.http.post(process.env.URL_POST_BALANCE, `${balance}`).subscribe();
    return `${balance}`;
  }
}

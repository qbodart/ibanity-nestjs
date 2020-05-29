/* eslint-disable @typescript-eslint/camelcase */
import {
  Injectable,
  HttpService,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as https from 'https';
import * as qs from 'qs';
import { AuthorizationRequest } from './authorization-request.entity';
import { config } from '../config';
import { BaseEntityService } from '../shared/baseEntity.service';

@Injectable()
export class IbanityService extends BaseEntityService<AuthorizationRequest> {
  httpsAgent: https.Agent;

  constructor(
    @InjectRepository(AuthorizationRequest)
    repository: Repository<AuthorizationRequest>,
    private readonly http: HttpService,
  ) {
    super(repository);
    this.httpsAgent = new https.Agent({
      cert: fs.readFileSync('./secrets/certificate.pem'),
      passphrase: config.ponto.passphraseCertificate,
      key: fs.readFileSync('./secrets/private_key.pem'),
    });
  }

  async createAuthorizationCodeRequestUrl(): Promise<string> {
    const request = new AuthorizationRequest();
    const codeVerifier = this._base64URLEncode(crypto.randomBytes(32));
    request.codeVerifier = codeVerifier;
    request.codeChallenge = this._base64URLEncode(this._sha256(codeVerifier));
    request.creationDate = new Date();
    await this.save(request);
    return `${config.ponto.authorizationUrl}?client_id=${
      config.ponto.clientId
    }&redirect_uri=${
      config.ponto.redirectUrl
    }&response_type=code&scope=${encodeURIComponent(
      config.ponto.scope,
    )}&state=${request.id}&code_challenge=${
      request.codeChallenge
    }&code_challenge_method=S256`;
  }

  async getFirstAccessToken(request: AuthorizationRequest): Promise<string> {
    const authorization = Buffer.from(
      `${config.ponto.clientId}:${config.ponto.clientSecret}`,
    ).toString('base64');
    const response = await this.http
      .post(
        config.ponto.tokenUrl,
        qs.stringify({
          grant_type: 'authorization_code',
          code: request.authorizationCode,
          client_id: config.ponto.clientId,
          redirect_uri: config.ponto.redirectUrl,
          code_verifier: request.codeVerifier,
        }),
        this._prepareHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authorization}`,
        }),
      )
      .toPromise();
    if (response.data.access_token) {
      request.accessToken = response.data.access_token;
      request.accessTokenDate = new Date();
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + response.data.expires_in);
      request.accessTokenExpiryDate = expiryDate;
      request.refreshToken = response.data.refresh_token;
      request.refreshTokenDate = new Date();
      await this.save(request);
      return response.data.access_token;
    } else {
      throw new InternalServerErrorException(response.data);
    }
  }

  async getNewAccessToken(request: AuthorizationRequest): Promise<string> {
    const authorization = Buffer.from(
      `${config.ponto.clientId}:${config.ponto.clientSecret}`,
    ).toString('base64');
    const response = await this.http
      .post(
        config.ponto.tokenUrl,
        qs.stringify({
          grant_type: 'refresh_token',
          refresh_token: request.refreshToken,
          client_id: config.ponto.clientId,
        }),
        this._prepareHeaders({
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${authorization}`,
        }),
      )
      .toPromise();
    if (response.data.access_token) {
      request.accessToken = response.data.access_token;
      request.accessTokenDate = new Date();
      const expiryDate = new Date();
      expiryDate.setSeconds(expiryDate.getSeconds() + response.data.expires_in);
      request.accessTokenExpiryDate = expiryDate;
      request.refreshToken = response.data.refresh_token;
      request.refreshTokenDate = new Date();
      await this.save(request);
      return response.data.access_token;
    } else {
      throw new InternalServerErrorException(response.data);
    }
  }

  async getAccessToken(): Promise<string> {
    const request = await this.findOne({
      order: { accessTokenDate: 'DESC' },
    });
    if (request.accessTokenExpiryDate < new Date()) {
      console.log('Requesting a new access token');
      return await this.getNewAccessToken(request);
    } else {
      console.log('Current access token is still valid');
      return request.accessToken;
    }
  }

  async getAccounts(
    accessToken: string,
  ): Promise<{ meta: any; links: any; data: any[] }> {
    return this.http
      .get(
        `${config.ponto.baseApiUrl}/accounts`,
        this._prepareHeaders({
          Authorization: `Bearer ${accessToken}`,
        }),
      )
      .toPromise()
      .then(axiosResponse => axiosResponse.data);
  }

  private _base64URLEncode(buffer: Buffer): string {
    return buffer
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '');
  }

  private _sha256(text: string): Buffer {
    return crypto
      .createHash('sha256')
      .update(text)
      .digest();
  }

  private _prepareHeaders(additionalHeaders: any): any {
    return {
      httpsAgent: this.httpsAgent,
      headers: {
        ...additionalHeaders,
        Accept: 'application/vnd.api+json',
      },
    };
  }
}

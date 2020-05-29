import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class AuthorizationRequest {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  codeVerifier: string;

  @Column()
  codeChallenge: string;

  @Column()
  creationDate: Date;

  @Column({ nullable: true })
  authorizationCode: string;

  @Column({ nullable: true })
  authorizationCodeDate: Date;

  @Column({ nullable: true })
  accessToken: string;

  @Column({ nullable: true })
  accessTokenDate: Date;

  @Column({ nullable: true })
  accessTokenExpiryDate: Date;

  @Column({ nullable: true })
  refreshToken: string;

  @Column({ nullable: true })
  refreshTokenDate: Date;
}

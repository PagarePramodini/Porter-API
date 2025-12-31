import { IsMobilePhone, IsString } from 'class-validator';

export class LoginDto {
  @IsMobilePhone('en-IN')
  mobile: string;

  @IsString()
  password: string;
}

import { ApiProperty } from '@nestjs/swagger';
import {IsEmail,IsNotEmpty,IsString,IsMobilePhone,MinLength,MaxLength,IsBoolean} from 'class-validator';


import { registerDecorator, ValidationOptions } from 'class-validator';

export function IsTrue(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isTrue',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any) {
          return value === true;
        },
        defaultMessage(): string {
          return 'You must accept terms and conditions';
        },
      },
    });
  };
}

export class CreateCustomerDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  firstName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lastName: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsMobilePhone('en-IN', { strictMode: false }, { message: 'Invalid Indian mobile number' })
  mobile: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  // Password may be optional for multi-step registration; required here for single-step
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  @MinLength(6)
  @MaxLength(12)
  password: string;

  @ApiProperty({ description: 'Customer must accept terms', example: true })
  @IsNotEmpty()
  @IsBoolean()
  @IsTrue({ message: 'You must accept terms and conditions' })
  acceptedTerms: boolean;
}

import {
  IsBoolean,
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsString,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  @IsNotEmpty()
  public email: string;

  @IsString()
  @IsNotEmpty()
  public address: string;

  @IsString()
  @IsNotEmpty()
  public phoneNumber1: string;

  @IsString()
  public phoneNumber2?: string;

  @IsBoolean()
  public isFullTime: boolean;

  @IsNumber()
  public netSalaryPerMonth?: number;

  @IsNumber()
  public netSalaryPerHour?: number;

  @IsNumber()
  public monthlyWorkingHour?: number;
}

export class CreateUserRulesDto {
  @IsString()
  @IsNotEmpty()
  public userId: string;

  @IsString()
  @IsNotEmpty()
  public ruleId: string;
}

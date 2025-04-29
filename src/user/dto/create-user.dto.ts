import { IsBoolean, IsEmail, IsNumber, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public firstName: string;

  @IsString()
  public lastName: string;

  @IsEmail()
  public email: string;

  @IsString()
  public address: string;

  @IsString()
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

import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  @IsNotEmpty()
  public designation: string;
}

export class CreateMenuRuleDto {
  @IsString()
  @IsNotEmpty()
  public ruleId: string;

  @IsString()
  @IsNotEmpty()
  public menuId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

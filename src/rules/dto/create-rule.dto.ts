import { IsJSON, IsString } from 'class-validator';

export class CreateRuleDto {
  @IsString()
  public designation: string;
}

export class CreateMenuRuleDto {
  @IsString()
  public ruleId: string;

  @IsString()
  public menuId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

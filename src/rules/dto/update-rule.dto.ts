import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleDto } from './create-rule.dto';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {}

export class UpdateMenuRulePrivilegeDto {
  @IsString()
  @IsNotEmpty()
  public menuRuleId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

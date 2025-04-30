import { PartialType } from '@nestjs/mapped-types';
import { CreateRuleDto } from './create-rule.dto';
import { IsJSON, IsString } from 'class-validator';

export class UpdateRuleDto extends PartialType(CreateRuleDto) {}

export class UpdateMenuRulePrivilegeDto {
  @IsString()
  public menuRuleId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

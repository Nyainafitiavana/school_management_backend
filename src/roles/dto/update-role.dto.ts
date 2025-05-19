import { PartialType } from '@nestjs/mapped-types';
import { IsJSON, IsNotEmpty, IsString } from 'class-validator';
import { CreateRoleDto } from './create-role.dto';

export class UpdateRoleDto extends PartialType(CreateRoleDto) {}

export class UpdateMenuRolePrivilegeDto {
  @IsString()
  @IsNotEmpty()
  public menuRoleId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

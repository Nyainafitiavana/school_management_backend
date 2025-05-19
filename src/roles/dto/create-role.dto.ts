import { IsJSON, IsNotEmpty, IsString } from 'class-validator';

export class CreateRoleDto {
  @IsString()
  @IsNotEmpty()
  public designation: string;
}

export class CreateMenuRoleDto {
  @IsString()
  @IsNotEmpty()
  public roleId: string;

  @IsString()
  @IsNotEmpty()
  public menuId: string;

  @IsString()
  @IsJSON()
  public privilege: string;
}

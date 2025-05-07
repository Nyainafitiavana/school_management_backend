import { PartialType } from '@nestjs/mapped-types';
import { CreateLevelDto, CreateSubjectsLevelDto } from './create-level.dto';

export class UpdateLevelDto extends PartialType(CreateLevelDto) {}

export class UpdateSubjectsLevelDto extends PartialType(
  CreateSubjectsLevelDto,
) {}

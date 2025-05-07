import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateLevelDto {
  @IsString()
  @IsNotEmpty()
  public designation: string;

  @IsString()
  public teacherInChargeId?: string;
}

export class CreateSubjectsLevelDto {
  @IsString()
  @IsNotEmpty()
  public levelId: string;

  @IsString()
  @IsNotEmpty()
  public subjectId: string;

  @IsString()
  public teacherId?: string;

  @IsNumber()
  @IsNotEmpty()
  public coefficient: number;
}

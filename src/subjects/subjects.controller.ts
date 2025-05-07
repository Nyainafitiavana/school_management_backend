import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Res,
  Next,
  HttpStatus,
  Req,
} from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { AuthGuard } from '../auth/auth.guards';
import { NextFunction, Request, Response } from 'express';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { Subjects } from '@prisma/client';

@Controller('/api/subjects')
export class SubjectsController {
  constructor(private readonly subjectsService: SubjectsService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createSubjectDto: CreateSubjectDto,
  ): Promise<void> {
    try {
      const level: ExecuteResponse =
        await this.subjectsService.create(createSubjectDto);

      res.status(HttpStatus.OK).json(level);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Req() req: Request,
  ): Promise<void> {
    try {
      const limit: number = Number(req.query.limit);
      const page: number = Number(req.query.page);
      const keyword: string = req.query.value
        ? (req.query.value as string)
        : '';
      const status: string = req.query.status
        ? (req.query.status as string)
        : '';

      const subjects: Paginate<Subjects[]> = await this.subjectsService.findAll(
        limit,
        page,
        keyword,
        status,
      );

      res.status(HttpStatus.OK).json(subjects);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid')
  async findOne(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const subject: Subjects = await this.subjectsService.findOne(uuid);
      delete subject.id;

      res.status(HttpStatus.OK).json(subject);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateSubjectDto: UpdateSubjectDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.subjectsService.update(
        uuid,
        updateSubjectDto,
      );

      res.status(HttpStatus.OK).json(updated);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/:uuid')
  async remove(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const deleted: ExecuteResponse = await this.subjectsService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

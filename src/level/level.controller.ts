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
import { LevelService } from './level.service';
import { CreateLevelDto, CreateSubjectsLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto, UpdateSubjectsLevelDto } from './dto/update-level.dto';
import { AuthGuard } from '../auth/auth.guards';
import { NextFunction, Request, Response } from 'express';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { Level } from '@prisma/client';
import { ISubjectLevel } from './subjectLevel.interface';

@Controller('/api/level')
export class LevelController {
  constructor(private readonly levelService: LevelService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createLevelDto: CreateLevelDto,
  ): Promise<void> {
    try {
      const level: ExecuteResponse =
        await this.levelService.create(createLevelDto);

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

      const level: Paginate<Level[]> = await this.levelService.findAll(
        limit,
        page,
        keyword,
        status,
      );

      res.status(HttpStatus.OK).json(level);
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
      const level: Level = await this.levelService.findOne(uuid);
      delete level.id;

      res.status(HttpStatus.OK).json(level);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateLevelDto: UpdateLevelDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.levelService.update(
        uuid,
        updateLevelDto,
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
      const deleted: ExecuteResponse = await this.levelService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/subject')
  async createSubjectLevel(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createSubjectLevelDto: CreateSubjectsLevelDto,
  ): Promise<void> {
    try {
      const subjectLevel: ExecuteResponse =
        await this.levelService.createSubjectsLevel(createSubjectLevelDto);

      res.status(HttpStatus.OK).json(subjectLevel);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid/subjects/')
  async findAllSubjectsLevel(
    @Param('uuid') uuid: string,
    @Req() req: Request,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const status: string = req.query.status
        ? (req.query.status as string)
        : '';
      const result: ISubjectLevel[] =
        await this.levelService.findAllSubjectLevel(uuid, status);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/subject/:uuid')
  async updateSubjectLevel(
    @Param('uuid') uuid: string,
    @Body() updateSubjectsLevelDto: UpdateSubjectsLevelDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const result: ExecuteResponse =
        await this.levelService.updateSubjectsLevel(
          uuid,
          updateSubjectsLevelDto,
        );

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/subject/:uuid')
  async deleteSubjectLevel(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const result: ExecuteResponse =
        await this.levelService.deleteSubjectLevel(uuid);

      res.status(HttpStatus.OK).json(result);
    } catch (error) {
      next(error);
    }
  }
}

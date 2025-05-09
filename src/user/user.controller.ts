import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Res,
  Next,
  HttpStatus,
  Req,
  UseGuards,
} from '@nestjs/common';
import { UserService } from './user.service';
import { CreateUserDto, CreateUserRulesDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { NextFunction, Response, Request } from 'express';
import { AuthGuard } from '../auth/auth.guards';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { Users } from '@prisma/client';
import { IUserRules } from './IUsers';

@Controller('/api/users')
export class UserController {
  constructor(private userService: UserService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createUserDto: CreateUserDto,
  ): Promise<void> {
    try {
      const user: ExecuteResponse =
        await this.userService.create(createUserDto);

      res.status(HttpStatus.OK).json(user);
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
      const limit: number = req.query.limit ? Number(req.query.limit) : null;
      const page: number = req.query.page ? Number(req.query.page) : null;
      const keyword: string = req.query.value
        ? (req.query.value as string)
        : '';
      const status: string = req.query.status
        ? (req.query.status as string)
        : '';

      const users: Paginate<Users[]> = await this.userService.findAll(
        limit,
        page,
        keyword,
        status,
      );

      res.status(HttpStatus.OK).json(users);
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
      const user: Users = await this.userService.findOne(uuid);
      delete user.id;

      res.status(HttpStatus.OK).json(user);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateUserDto: UpdateUserDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.userService.update(
        uuid,
        updateUserDto,
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
      const deleted: ExecuteResponse = await this.userService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/rules')
  async createMenuRule(
    @Body() data: CreateUserRulesDto[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const userRules: ExecuteResponse =
        await this.userService.createUserRules(data);

      res.status(HttpStatus.OK).json(userRules);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid/rules')
  async findAllUserRules(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const userRules: IUserRules[] =
        await this.userService.findAllUserRules(uuid);
      res.status(HttpStatus.OK).json({ data: userRules });
    } catch (error) {
      next(error);
    }
  }
  @UseGuards(AuthGuard)
  @Delete('/rules/:uuid')
  async deleteUserRules(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const deleted: ExecuteResponse =
        await this.userService.deleteUserRule(uuid);
      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

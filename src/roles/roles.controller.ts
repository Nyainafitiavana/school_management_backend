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
import { RolesService } from './roles.service';
import { CreateMenuRoleDto, CreateRoleDto } from './dto/create-role.dto';
import {
  UpdateMenuRolePrivilegeDto,
  UpdateRoleDto,
} from './dto/update-role.dto';
import { AuthGuard } from '../auth/auth.guards';
import { NextFunction, Request, Response } from 'express';
import { Roles } from '@prisma/client';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { IMenuRoles } from './MenuRoles.interface';

@Controller('/api/roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createRoleDto: CreateRoleDto,
  ): Promise<void> {
    try {
      const role: ExecuteResponse =
        await this.rolesService.create(createRoleDto);

      res.status(HttpStatus.OK).json(role);
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
      const limit = req.query.limit ? Number(req.query.limit) : null;
      const page: number = req.query.page ? Number(req.query.page) : null;
      const keyword: string = req.query.value
        ? (req.query.value as string)
        : '';
      const status: string = req.query.status
        ? (req.query.status as string)
        : '';

      const roles: Paginate<Roles[]> = await this.rolesService.findAll(
        limit,
        page,
        keyword,
        status,
      );

      res.status(HttpStatus.OK).json(roles);
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
      const role: Roles = await this.rolesService.findOne(uuid);
      delete role.id;
      res.status(HttpStatus.OK).json(role);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateRoleDto: UpdateRoleDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.rolesService.update(
        uuid,
        updateRoleDto,
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
      const deleted: ExecuteResponse = await this.rolesService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/menu')
  async createMenuRole(
    @Body() data: CreateMenuRoleDto[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRole: ExecuteResponse =
        await this.rolesService.createMenuRole(data);

      res.status(HttpStatus.OK).json(menuRole);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/menu/privilege')
  async updateMenuRolePrivilege(
    @Body() data: UpdateMenuRolePrivilegeDto[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRole: ExecuteResponse =
        await this.rolesService.updateMenuRolePrivilege(data);

      res.status(HttpStatus.OK).json(menuRole);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid/menu')
  async findAllMenuRoles(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRole: IMenuRoles[] =
        await this.rolesService.findAllMenuRole(uuid);
      res.status(HttpStatus.OK).json({ data: menuRole });
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/menu/:uuid')
  async deleteMenuRoles(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const deleted: ExecuteResponse =
        await this.rolesService.deleteMenuRole(uuid);
      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

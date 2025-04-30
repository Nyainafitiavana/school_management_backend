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
import { RulesService } from './rules.service';
import { CreateMenuRuleDto, CreateRuleDto } from './dto/create-rule.dto';
import {
  UpdateMenuRulePrivilegeDto,
  UpdateRuleDto,
} from './dto/update-rule.dto';
import { AuthGuard } from '../auth/auth.guards';
import { NextFunction, Request, Response } from 'express';
import { Rules } from '@prisma/client';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { IMenuRules } from './MenuRules.interface';

@Controller('/api/rules')
export class RulesController {
  constructor(private readonly rulesService: RulesService) {}

  @UseGuards(AuthGuard)
  @Post()
  async create(
    @Res() res: Response,
    @Next() next: NextFunction,
    @Body() createRuleDto: CreateRuleDto,
  ): Promise<void> {
    try {
      const rule: ExecuteResponse =
        await this.rulesService.create(createRuleDto);

      res.status(HttpStatus.OK).json(rule);
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

      const rules: Paginate<Rules[]> = await this.rulesService.findAll(
        limit,
        page,
        keyword,
        status,
      );

      res.status(HttpStatus.OK).json(rules);
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
      const rule: Rules = await this.rulesService.findOne(uuid);
      delete rule.id;
      res.status(HttpStatus.OK).json(rule);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/:uuid')
  async update(
    @Param('uuid') uuid: string,
    @Body() updateRuleDto: UpdateRuleDto,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const updated: ExecuteResponse = await this.rulesService.update(
        uuid,
        updateRuleDto,
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
      const deleted: ExecuteResponse = await this.rulesService.remove(uuid);

      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Post('/menu')
  async createMenuRule(
    @Body() data: CreateMenuRuleDto[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRule: ExecuteResponse =
        await this.rulesService.createMenuRule(data);

      res.status(HttpStatus.OK).json(menuRule);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Patch('/menu/privilege')
  async updateMenuRulePrivilege(
    @Body() data: UpdateMenuRulePrivilegeDto[],
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRule: ExecuteResponse =
        await this.rulesService.updateMenuRulePrivilege(data);

      res.status(HttpStatus.OK).json(menuRule);
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Get('/:uuid/menu')
  async findAllMenuRules(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menuRule: IMenuRules[] =
        await this.rulesService.findAllMenuRule(uuid);
      res.status(HttpStatus.OK).json({ data: menuRule });
    } catch (error) {
      next(error);
    }
  }

  @UseGuards(AuthGuard)
  @Delete('/menu/:uuid')
  async deleteMenuRules(
    @Param('uuid') uuid: string,
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const deleted: ExecuteResponse =
        await this.rulesService.deleteMenuRule(uuid);
      res.status(HttpStatus.OK).json(deleted);
    } catch (error) {
      next(error);
    }
  }
}

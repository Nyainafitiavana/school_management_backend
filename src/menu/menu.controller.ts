import {
  Controller,
  Get,
  HttpStatus,
  Next,
  Res,
  UseGuards,
} from '@nestjs/common';
import { MenuService } from './menu.service';
import { NextFunction, Response } from 'express';
import { Menu } from '@prisma/client';
import { AuthGuard } from '../auth/auth.guards';
import { IMenu } from './menu.interface';

@Controller('/api/menu')
export class MenuController {
  constructor(private readonly menuService: MenuService) {}

  @UseGuards(AuthGuard)
  @Get()
  async findAll(
    @Res() res: Response,
    @Next() next: NextFunction,
  ): Promise<void> {
    try {
      const menu: IMenu[] = await this.menuService.findAllMenu();
      res.status(HttpStatus.OK).json({ data: menu });
    } catch (error) {
      next(error);
    }
  }
}

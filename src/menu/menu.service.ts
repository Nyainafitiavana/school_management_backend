import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { IMenu } from './menu.interface';

@Injectable()
export class MenuService {
  constructor(private prisma: PrismaService) {}

  async findAllMenu(): Promise<IMenu[]> {
    return this.prisma.menu.findMany({
      select: {
        uuid: true,
        designation: true,
        code: true,
        path: true,
        order: true,
      },
      orderBy: {
        order: 'asc',
      },
    });
  }
}

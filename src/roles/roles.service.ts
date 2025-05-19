import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMenuRoleDto, CreateRoleDto } from './dto/create-role.dto';
import {
  UpdateMenuRolePrivilegeDto,
  UpdateRoleDto,
} from './dto/update-role.dto';
import { Menu, MenuRoles, Prisma, Roles, Status } from '@prisma/client';
import { MESSAGE, STATUS } from '../utils/constant';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { CustomException } from '../utils/ExeptionCustom';
import { PrismaService } from '../prisma/prisma.service';
import Helper from '../utils/helper';
import { IMenuRoles } from './MenuRoles.interface';

@Injectable()
export class RolesService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}

  async create(createRoleDto: CreateRoleDto): Promise<ExecuteResponse> {
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    await this.prisma.roles.create({
      data: {
        ...createRoleDto,
        statusId: findStatusByCode.id,
        uuid: await this.helper.generateUuid(),
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async findAll(
    limit: number = null,
    page: number = null,
    keyword: string,
    status: string,
  ): Promise<Paginate<Roles[]>> {
    const offset: number = await this.helper.calculateOffset(limit, page);

    const query: Prisma.RolesFindManyArgs = {
      take: limit,
      skip: offset,
      where: {
        designation: {
          contains: keyword,
          mode: 'insensitive',
        },
        status: {
          code: status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.DELETED,
        },
      },
      select: {
        uuid: true,
        designation: true,
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
      },
    };

    const [data, count] = await this.prisma.$transaction([
      this.prisma.roles.findMany(query),
      this.prisma.roles.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOne(uuid: string): Promise<Roles> {
    const role: Roles = await this.prisma.roles.findUnique({
      where: {
        uuid: uuid,
      },
      include: {
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
      },
    });

    if (!role) {
      throw new CustomException(
        `Role ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    return role;
  }

  async update(
    uuid: string,
    updateRoleDto: UpdateRoleDto,
  ): Promise<ExecuteResponse> {
    const findRole: Roles = await this.findOne(uuid);

    await this.prisma.roles.update({
      where: {
        uuid: findRole.uuid,
      },
      data: {
        ...updateRoleDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findRole: Roles = await this.findOne(uuid);

    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.roles.update({
      where: {
        uuid: findRole.uuid,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async createMenuRole(
    bodyRequest: CreateMenuRoleDto[],
  ): Promise<ExecuteResponse> {
    for (const data of bodyRequest) {
      const findMenu: Menu = await this.prisma.menu.findUnique({
        where: { uuid: data.menuId },
      });

      if (!findMenu) {
        throw new CustomException(
          `Menu ID ${data.menuId} not found in database.`,
          HttpStatus.CONFLICT,
        );
      }

      const findRole: Roles = await this.findOne(data.roleId);
      //Find if exist menu for the current role
      const findExist: MenuRoles = await this.prisma.menuRoles.findFirst({
        where: {
          menuId: findMenu.id,
          roleId: findRole.id,
        },
      });

      if (findExist) {
        throw new CustomException(
          `Le menu "${findMenu.designation}" est déjà ajouté pour ce rôle.`,
          HttpStatus.CONFLICT,
        );
      }

      await this.prisma.menuRoles.create({
        data: {
          menuId: findMenu.id,
          roleId: findRole.id,
          privilege: data.privilege,
          uuid: await this.helper.generateUuid(),
        },
      });
    }

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async updateMenuRolePrivilege(
    bodyRequest: UpdateMenuRolePrivilegeDto[],
  ): Promise<ExecuteResponse> {
    for (const data of bodyRequest) {
      const menuRole: MenuRoles = await this.prisma.menuRoles.findUnique({
        where: { uuid: data.menuRoleId },
      });

      if (!menuRole) {
        throw new CustomException(MESSAGE.ID_NOT_FOUND, HttpStatus.CONFLICT);
      }

      await this.prisma.menuRoles.update({
        where: { id: menuRole.id },
        data: {
          privilege: data.privilege,
        },
      });
    }

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async findAllMenuRole(roleId: string): Promise<IMenuRoles[]> {
    await this.findOne(roleId);

    return this.prisma.menuRoles.findMany({
      where: {
        roles: {
          uuid: roleId,
        },
      },
      select: {
        uuid: true,
        menu: {
          select: {
            uuid: true,
            designation: true,
            path: true,
          },
        },
      },
    });
  }

  async deleteMenuRole(uuid: string): Promise<ExecuteResponse> {
    const menuRoles: MenuRoles = await this.prisma.menuRoles.findUnique({
      where: { uuid: uuid },
    });

    if (!menuRoles) {
      throw new CustomException(
        `Menu role ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.menuRoles.delete({
      where: { id: menuRoles.id },
    });
    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateMenuRuleDto, CreateRuleDto } from './dto/create-rule.dto';
import {
  UpdateMenuRulePrivilegeDto,
  UpdateRuleDto,
} from './dto/update-rule.dto';
import { Menu, MenuRules, Prisma, Rules, Status } from '@prisma/client';
import { MESSAGE, STATUS } from '../utils/constant';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { CustomException } from '../utils/ExeptionCustom';
import { PrismaService } from '../prisma/prisma.service';
import Helper from '../utils/helper';
import { IMenuRules } from './MenuRules.interface';

@Injectable()
export class RulesService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}

  async create(createRuleDto: CreateRuleDto): Promise<ExecuteResponse> {
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    await this.prisma.rules.create({
      data: {
        ...createRuleDto,
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
  ): Promise<Paginate<Rules[]>> {
    const offset: number = await this.helper.calculateOffset(limit, page);

    const query: Prisma.RulesFindManyArgs = {
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
      this.prisma.rules.findMany(query),
      this.prisma.rules.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOne(uuid: string): Promise<Rules> {
    const rule: Rules = await this.prisma.rules.findUnique({
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

    if (!rule) {
      throw new CustomException(
        `Rule ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    return rule;
  }

  async update(
    uuid: string,
    updateRuleDto: UpdateRuleDto,
  ): Promise<ExecuteResponse> {
    const findRule: Rules = await this.findOne(uuid);

    await this.prisma.rules.update({
      where: {
        uuid: findRule.uuid,
      },
      data: {
        ...updateRuleDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findRule: Rules = await this.findOne(uuid);

    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.rules.update({
      where: {
        uuid: findRule.uuid,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async createMenuRule(
    bodyRequest: CreateMenuRuleDto[],
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

      const findRule: Rules = await this.findOne(data.ruleId);
      //Find if exist menu for the current rule
      const findExist: MenuRules = await this.prisma.menuRules.findFirst({
        where: {
          menuId: findMenu.id,
          ruleId: findRule.id,
        },
      });

      if (findExist) {
        throw new CustomException(
          `Le menu "${findMenu.designation}" est déjà ajouté pour ce rôle.`,
          HttpStatus.CONFLICT,
        );
      }

      await this.prisma.menuRules.create({
        data: {
          menuId: findMenu.id,
          ruleId: findRule.id,
          privilege: data.privilege,
          uuid: await this.helper.generateUuid(),
        },
      });
    }

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async updateMenuRulePrivilege(
    bodyRequest: UpdateMenuRulePrivilegeDto[],
  ): Promise<ExecuteResponse> {
    for (const data of bodyRequest) {
      const menuRule: MenuRules = await this.prisma.menuRules.findUnique({
        where: { uuid: data.menuRuleId },
      });

      if (!menuRule) {
        throw new CustomException(MESSAGE.ID_NOT_FOUND, HttpStatus.CONFLICT);
      }

      await this.prisma.menuRules.update({
        where: { id: menuRule.id },
        data: {
          privilege: data.privilege,
        },
      });
    }

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async findAllMenuRule(ruleId: string): Promise<IMenuRules[]> {
    await this.findOne(ruleId);

    return this.prisma.menuRules.findMany({
      where: {
        rules: {
          uuid: ruleId,
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

  async deleteMenuRule(uuid: string): Promise<ExecuteResponse> {
    const menuRules: MenuRules = await this.prisma.menuRules.findUnique({
      where: { uuid: uuid },
    });

    if (!menuRules) {
      throw new CustomException(
        `Menu rule ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.menuRules.delete({
      where: { id: menuRules.id },
    });
    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}

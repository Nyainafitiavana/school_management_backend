import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto, CreateUserRolesDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Roles, Status, Users, UsersRoles } from '@prisma/client';
import { CustomException } from '../utils/ExeptionCustom';
import Helper from '../utils/helper';
import { MESSAGE, STATUS } from '../utils/constant';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { IUserRoles } from './IUsers';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<ExecuteResponse> {
    const findUserEmail: Users = await this.prisma.users.findUnique({
      where: { email: createUserDto.email },
    });

    if (findUserEmail) {
      throw new CustomException(MESSAGE.EMAIL_FOUND, HttpStatus.CONFLICT);
    }

    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    const hashedPassword: string = await this.helper.hashPassword('1234');

    await this.prisma.users.create({
      data: {
        ...createUserDto,
        password: hashedPassword,
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
  ): Promise<Paginate<Users[]>> {
    const query: Prisma.UsersFindManyArgs = {
      where: {
        OR: [
          {
            firstName: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            lastName: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            email: {
              contains: keyword,
              mode: 'insensitive',
            },
          },
          {
            phoneNumber1: { contains: keyword },
          },
          {
            phoneNumber2: { contains: keyword },
          },
        ],
        status: {
          code: status === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.DELETED,
        },
      },
      select: {
        uuid: true,
        firstName: true,
        lastName: true,
        email: true,
        phoneNumber1: true,
        phoneNumber2: true,
        isFullTime: true,
        netSalaryPerMonth: true,
        netSalaryPerHour: true,
        monthlyWorkingHour: true,
        status: {
          select: {
            designation: true,
            code: true,
            uuid: true,
          },
        },
        UsersRoles: {
          select: {
            uuid: true,
            roles: {
              select: {
                uuid: true,
                designation: true,
              },
            },
          },
        },
      },
    };

    if (limit && page) {
      const offset: number = await this.helper.calculateOffset(limit, page);
      query.take = limit;
      query.skip = offset;
    }
    const [data, count] = await this.prisma.$transaction([
      this.prisma.users.findMany(query),
      this.prisma.users.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOneByEmail(email: string): Promise<Users> {
    return this.prisma.users.findUnique({
      where: {
        email: email,
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
  }

  async findOne(uuid: string): Promise<Users> {
    const user: Users = await this.prisma.users.findUnique({
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
        UsersRoles: {
          select: {
            roles: {
              select: {
                uuid: true,
                designation: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      throw new CustomException(
        `User ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    delete user.password;
    delete user.statusId;
    return user;
  }

  async update(
    uuid: string,
    updateUserDto: UpdateUserDto,
  ): Promise<ExecuteResponse> {
    const findUser: Users = await this.findOne(uuid);

    await this.prisma.users.update({
      where: {
        uuid: findUser.uuid,
      },
      data: {
        ...updateUserDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findUser: Users = await this.findOne(uuid);
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.users.update({
      where: {
        uuid: findUser.uuid,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async createUserRoles(
    bodyRequest: CreateUserRolesDto[],
  ): Promise<ExecuteResponse> {
    for (const data of bodyRequest) {
      const findRole: Roles = await this.prisma.roles.findUnique({
        where: { uuid: data.roleId },
      });

      if (!findRole) {
        throw new CustomException(
          `Role ID ${data.roleId} not found in database.`,
          HttpStatus.CONFLICT,
        );
      }

      const findUser: Users = await this.findOne(data.userId);
      //Find if exist role for the current user
      const findExist: UsersRoles = await this.prisma.usersRoles.findFirst({
        where: {
          userId: findUser.id,
          roleId: findRole.id,
        },
      });

      if (findExist) {
        throw new CustomException(
          `Le rôle "${findRole.designation}" est déjà ajouté pour cet utilisateur.`,
          HttpStatus.CONFLICT,
        );
      }

      await this.prisma.usersRoles.create({
        data: {
          userId: findUser.id,
          roleId: findRole.id,
          uuid: await this.helper.generateUuid(),
        },
      });
    }

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async findAllUserRoles(userId: string): Promise<IUserRoles[]> {
    await this.findOne(userId);

    return this.prisma.usersRoles.findMany({
      where: {
        users: {
          uuid: userId,
        },
      },
      select: {
        uuid: true,
        roles: {
          select: {
            uuid: true,
            designation: true,
            MenuRoles: {
              select: {
                menu: {
                  select: {
                    uuid: true,
                    designation: true,
                    path: true,
                    code: true,
                  },
                },
              },
            },
          },
        },
      },
    });
  }

  async deleteUserRole(uuid: string): Promise<ExecuteResponse> {
    const userRoles: UsersRoles = await this.prisma.usersRoles.findUnique({
      where: { uuid: uuid },
    });

    if (!userRoles) {
      throw new CustomException(
        `UserRole ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    await this.prisma.usersRoles.delete({
      where: { id: userRoles.id },
    });
    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}

import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { PrismaService } from '../prisma/prisma.service';
import { Prisma, Status, Users } from '@prisma/client';
import { CustomException } from '../utils/ExeptionCustom';
import Helper from '../utils/helper';
import { MESSAGE, STATUS } from '../utils/constant';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';

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
    const offset: number = await this.helper.calculateOffset(limit, page);

    const query: Prisma.UsersFindManyArgs = {
      take: limit,
      skip: offset,
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
      },
    };

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
      },
    });

    if (!user) {
      throw new CustomException(MESSAGE.ID_NOT_FOUND, HttpStatus.CONFLICT);
    }

    delete user.id;
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
}

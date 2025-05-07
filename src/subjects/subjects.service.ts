import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PrismaService } from '../prisma/prisma.service';
import Helper from '../utils/helper';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { Prisma, Status, Subjects } from '@prisma/client';
import { MESSAGE, STATUS } from '../utils/constant';
import { CustomException } from '../utils/ExeptionCustom';

@Injectable()
export class SubjectsService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
  ) {}

  async create(createSubjectDto: CreateSubjectDto): Promise<ExecuteResponse> {
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    await this.prisma.subjects.create({
      data: {
        designation: createSubjectDto.designation,
        uuid: await this.helper.generateUuid(),
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async findAll(
    limit: number = null,
    page: number = null,
    keyword: string,
    status: string,
  ): Promise<Paginate<Subjects[]>> {
    const offset: number = await this.helper.calculateOffset(limit, page);

    const query: Prisma.SubjectsFindManyArgs = {
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
      this.prisma.subjects.findMany(query),
      this.prisma.subjects.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOne(uuid: string): Promise<Subjects> {
    const subject: Subjects = await this.prisma.subjects.findUnique({
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

    if (!subject) {
      throw new CustomException(
        `Subject ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    delete subject.statusId;
    return subject;
  }

  async update(
    uuid: string,
    updateSubjectDto: UpdateSubjectDto,
  ): Promise<ExecuteResponse> {
    const findSubject: Subjects = await this.findOne(uuid);

    await this.prisma.subjects.update({
      where: {
        uuid: findSubject.uuid,
      },
      data: {
        ...updateSubjectDto,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findSubject: Subjects = await this.findOne(uuid);
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.level.update({
      where: {
        uuid: findSubject.uuid,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}

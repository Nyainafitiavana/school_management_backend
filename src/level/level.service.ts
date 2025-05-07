import { HttpStatus, Injectable } from '@nestjs/common';
import { CreateLevelDto, CreateSubjectsLevelDto } from './dto/create-level.dto';
import { UpdateLevelDto, UpdateSubjectsLevelDto } from './dto/update-level.dto';
import { PrismaService } from '../prisma/prisma.service';
import Helper from '../utils/helper';
import { UserService } from '../user/user.service';
import {
  Level,
  Prisma,
  Status,
  Subjects,
  SubjectsLevel,
  Users,
} from '@prisma/client';
import { MESSAGE, STATUS } from '../utils/constant';
import { ExecuteResponse, Paginate } from '../utils/custom.interface';
import { CustomException } from '../utils/ExeptionCustom';
import { SubjectsService } from '../subjects/subjects.service';
import { ISubjectLevel } from './subjectLevel.interface';

@Injectable()
export class LevelService {
  constructor(
    private prisma: PrismaService,
    private helper: Helper,
    private userService: UserService,
    private subjectService: SubjectsService,
  ) {}
  async create(createLevelDto: CreateLevelDto): Promise<ExecuteResponse> {
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    let findUser: Users = null;
    if (createLevelDto.teacherInChargeId) {
      findUser = await this.userService.findOne(
        createLevelDto.teacherInChargeId,
      );
    }

    await this.prisma.level.create({
      data: {
        designation: createLevelDto.designation,
        teacherInChargeId: findUser ? findUser.id : null,
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
  ): Promise<Paginate<Level[]>> {
    const offset: number = await this.helper.calculateOffset(limit, page);

    const query: Prisma.LevelFindManyArgs = {
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
        user: {
          select: {
            firstName: true,
            lastName: true,
            uuid: true,
          },
        },
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
      this.prisma.level.findMany(query),
      this.prisma.level.count({ where: query.where }),
    ]);

    return { data: data, totalRows: count, page: page };
  }

  async findOne(uuid: string): Promise<Level> {
    const level: Level = await this.prisma.level.findUnique({
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
        user: {
          select: {
            firstName: true,
            lastName: true,
            uuid: true,
          },
        },
      },
    });

    if (!level) {
      throw new CustomException(
        `Level ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    delete level.statusId;
    delete level.teacherInChargeId;
    return level;
  }

  async update(
    uuid: string,
    updateLevelDto: UpdateLevelDto,
  ): Promise<ExecuteResponse> {
    const findLevel: Level = await this.findOne(uuid);
    const findUser: Users = await this.userService.findOne(
      updateLevelDto.teacherInChargeId,
    );

    delete updateLevelDto.teacherInChargeId;
    await this.prisma.level.update({
      where: {
        uuid: findLevel.uuid,
      },
      data: {
        ...updateLevelDto,
        teacherInChargeId: findUser.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async remove(uuid: string): Promise<ExecuteResponse> {
    const findLevel: Level = await this.findOne(uuid);
    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.level.update({
      where: {
        uuid: findLevel.uuid,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async createSubjectsLevel(
    createSubjectsLevelDto: CreateSubjectsLevelDto,
  ): Promise<ExecuteResponse> {
    const findLevel: Level = await this.findOne(createSubjectsLevelDto.levelId);
    const findSubject: Subjects = await this.subjectService.findOne(
      createSubjectsLevelDto.subjectId,
    );
    //Check if subject already exist for the level
    await this.checkExistSubjectLevel(findSubject, findLevel);

    const findTeacher: Users = createSubjectsLevelDto.teacherId
      ? await this.userService.findOne(createSubjectsLevelDto.teacherId)
      : null;

    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.ACTIVE },
    });

    await this.prisma.subjectsLevel.create({
      data: {
        uuid: await this.helper.generateUuid(),
        levelId: findLevel.id,
        subjectId: findSubject.id,
        teacherId: findTeacher ? findTeacher.id : null,
        coefficient: createSubjectsLevelDto.coefficient,
        statusId: findStatusByCode.id,
      },
    });
    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async checkExistSubjectLevel(
    subject: Subjects,
    level: Level,
  ): Promise<boolean> {
    const subjectLevel: SubjectsLevel =
      await this.prisma.subjectsLevel.findFirst({
        where: { subjectId: subject.id, levelId: level.id },
      });

    if (subjectLevel) {
      throw new CustomException(
        `La matière "${subject.designation}" est déjà ajouté pour la classe de ${level.designation}.`,
        HttpStatus.CONFLICT,
      );
    }

    return false;
  }
  async findAllSubjectLevel(
    levelId: string,
    statusCode: string,
  ): Promise<ISubjectLevel[]> {
    const level: Level = await this.findOne(levelId);

    return this.prisma.subjectsLevel.findMany({
      where: {
        levelId: level.id,
        status: {
          code: statusCode === STATUS.ACTIVE ? STATUS.ACTIVE : STATUS.DELETED,
        },
      },
      select: {
        uuid: true,
        subjects: {
          select: {
            designation: true,
            uuid: true,
          },
        },
        users: {
          select: {
            firstName: true,
            lastName: true,
            uuid: true,
          },
        },
        coefficient: true,
        status: {
          select: {
            designation: true,
            uuid: true,
          },
        },
      },
    });
  }

  async findOneSubjectLevel(uuid: string): Promise<SubjectsLevel> {
    const subjectLevel: SubjectsLevel =
      await this.prisma.subjectsLevel.findUnique({
        where: { uuid: uuid },
      });

    if (!subjectLevel) {
      throw new CustomException(
        `Subject Level ID ${uuid} not found in database.`,
        HttpStatus.CONFLICT,
      );
    }

    return subjectLevel;
  }

  async updateSubjectsLevel(
    uuid: string,
    updateSubjectsLevelDto: UpdateSubjectsLevelDto,
  ): Promise<ExecuteResponse> {
    const findSubjectLevel: SubjectsLevel =
      await this.findOneSubjectLevel(uuid);

    const findLevel: Level = await this.findOne(updateSubjectsLevelDto.levelId);
    const findSubject: Subjects = await this.subjectService.findOne(
      updateSubjectsLevelDto.subjectId,
    );
    const findTeacher: Users = updateSubjectsLevelDto.teacherId
      ? await this.userService.findOne(updateSubjectsLevelDto.teacherId)
      : null;

    await this.prisma.subjectsLevel.update({
      where: { id: findSubjectLevel.id },
      data: {
        levelId: findLevel.id,
        subjectId: findSubject.id,
        teacherId: findTeacher ? findTeacher.id : null,
        coefficient: updateSubjectsLevelDto.coefficient,
      },
    });
    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }

  async deleteSubjectLevel(uuid: string): Promise<ExecuteResponse> {
    const findSubjectLevel: SubjectsLevel =
      await this.findOneSubjectLevel(uuid);

    const findStatusByCode: Status = await this.prisma.status.findUnique({
      where: { code: STATUS.DELETED },
    });

    await this.prisma.subjectsLevel.update({
      where: {
        id: findSubjectLevel.id,
      },
      data: {
        statusId: findStatusByCode.id,
      },
    });

    return { message: MESSAGE.OK, statusCode: HttpStatus.OK };
  }
}

export const MESSAGE = {
  ID_NOT_FOUND: 'ID not found in database.',
  EMAIL_FOUND: 'E-mail already exists.',
  EMAIL_NOT_FOUND: 'E-mail not found in database.',
  OK: 'The operation was successful.',
  KO: 'The operation was not successful.',
};

export const STATUS = {
  ACTIVE: 'ACT',
  DELETED: 'SPR',
  IN_PROGRESS: 'ENC',
  CLOSED: 'CLT',
  OLD: 'ANC',
  SUSPENDED: 'SPD',
  UNPAID: 'NOP',
  PAID: 'PAY',
  EXPELLED: 'EXP',
};

export const PRIVILEGE = {
  CREATE: 1,
  READ: 2,
  UPDATE: 3,
  DELETE: 2,
};

export const TYPE_PAYMENT = {
  TUITION: 'ECL',
  SCHOOL_FEES: 'DRS',
};

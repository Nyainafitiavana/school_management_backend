export interface ISubjectLevel {
  uuid: string;
  subjects: { uuid: string; designation: string };
  users?: { uuid: string; firstName: string; lastName: string };
  coefficient: number;
  status: { uuid: string; designation: string };
}

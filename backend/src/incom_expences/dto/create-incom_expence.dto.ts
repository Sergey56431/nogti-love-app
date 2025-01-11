export class CreateIncomeExpencesDto {
  category: string;
  value: number;
  type: string;
}

export type UpdateIncomeExpences = Partial<CreateIncomeExpencesDto>;

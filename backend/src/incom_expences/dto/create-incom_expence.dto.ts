import { TypeOperation } from "@prisma/client"

export class CreateIncomeExpencesDto {
  category: string ;
  value: number;
  type: TypeOperation;
}

export type UpdateIncomeExpences = Partial<CreateIncomeExpencesDto>;

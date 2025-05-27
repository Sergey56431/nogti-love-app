export interface ClientReferralInfo {
  id: string;
  name: string;
  lastName?: string | null;
  phoneNumber: string;
  score: number;
}

export interface LinkReferrerDto {
  clientId: string; // кого привязываем
  referrerId: string; // кто его пригласил
}

export interface AwardBonusesDto {
  buyerId: string;
  purchaseAmount: number;
}

export interface FindReferralsDto {
  clientId: string;
  direction: 'upline' | 'downline_direct';
  maxLevels?: number;
}

export interface IReferalService {
  create(data: LinkReferrerDto): Promise<ClientReferralInfo | null>;

  find(params: FindReferralsDto): Promise<ClientReferralInfo[]>;

  update(data: AwardBonusesDto): Promise<void>;

  remove(clientId: string): Promise<ClientReferralInfo | null>;
}

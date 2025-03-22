import { LoginDto } from '../client-dto/login-dto';
import { CreateClientsDto } from '../../clients/dto';

interface User {
  id: string;
  name: string;
  role: string;
}

export interface IAuthService {
  login(loginDto: LoginDto): Promise<{
    access_token: string;
    userId: string;
    name: string;
    role: string;
  }>;
  refreshToken(userId: string): Promise<{ accessToken: string }>;
  logout(userId: string);
  validateUser(body: LoginDto | CreateClientsDto): Promise<User | null>;
  generateAccessToken(user: User);
  generateRefreshToken(user: User);
}

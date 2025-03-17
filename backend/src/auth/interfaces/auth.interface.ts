import { LoginDto, SignupDto } from '../auth-dto';
import { UserCreateDto } from '../../users';

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
  signUp(user: SignupDto): Promise<UserCreateDto>;
  refreshToken(userId: string): Promise<{ accessToken: string }>;
  logout(userId: string);
  validateUser(body: LoginDto | UserCreateDto): Promise<User | null>;
  generateAccessToken(user: User);
  generateRefreshToken(user: User);
}

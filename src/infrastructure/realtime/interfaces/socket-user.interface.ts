import type { Socket } from 'socket.io';
import type { AuthUser } from '@modules/auth/interfaces/auth-user.interface';

export interface AuthenticatedSocket extends Socket {
  data: { user: AuthUser };
}

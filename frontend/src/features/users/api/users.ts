import { apiRequest } from '../../../api/client';
import { userSchema } from '../types/user';

export function getUsers(signal?: AbortSignal) {
  return apiRequest('/api/users', userSchema.array(), { signal });
}

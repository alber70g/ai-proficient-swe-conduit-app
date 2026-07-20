import { request } from './client';
import type { ProfileResponse } from './types';

export function getProfile(username: string): Promise<ProfileResponse> {
  return request<ProfileResponse>(`/profiles/${encodeURIComponent(username)}`);
}

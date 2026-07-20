import { request } from './client';
import type { TagsResponse } from './types';

export function getTags(): Promise<TagsResponse> {
  return request<TagsResponse>('/tags');
}

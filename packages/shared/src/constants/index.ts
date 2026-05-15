export const POLL_STATUS = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  CLOSED: 'closed',
  PUBLISHED: 'published',
} as const;

export const API_ROUTES = {
  HEALTH: '/api/health',
  POLLS: '/api/polls',
  USERS_ME: '/api/users/me',
} as const;

export const SOCKET_EVENTS = {
  JOIN_POLL: 'poll:join',
  LEAVE_POLL: 'poll:leave',
  RESPONSE_COUNT: 'poll:response_count',
  ANALYTICS_UPDATE: 'poll:analytics_update',
} as const;

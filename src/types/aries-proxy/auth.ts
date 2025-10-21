export interface AriesAuthToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: 'Bearer' | 'Basic';
}

export type AriesGrantType = 'password' | 'refresh_token';

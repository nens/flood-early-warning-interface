// Types for API responses

// Note that if a field is not in here, that means we don't use it
export interface Bootstrap {
  user: {
    authenticated: boolean;
    username: string;
    first_name: string;
  },
  sso: {
    login: string;
  }
}

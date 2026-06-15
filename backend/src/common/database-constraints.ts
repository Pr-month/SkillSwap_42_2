export enum DatabaseConstraints {
  UQ_USER_EMAIL = 'UQ_user_email',
  UQ_REQUEST_SKILLS = 'UQ_request_skills',
}

export const CONSTRAINTS_MESSAGES: Record<DatabaseConstraints, string> = {
  [DatabaseConstraints.UQ_USER_EMAIL]: 'Email already in use',
  [DatabaseConstraints.UQ_REQUEST_SKILLS]: 'Request already exists',
};

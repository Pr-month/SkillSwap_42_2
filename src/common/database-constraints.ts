export enum DatabaseConstraints {
  UQ_USER_EMAIL = 'UQ_user_email',
}

export const CONSTRAINTS_MESSAGES: Record<DatabaseConstraints, string> = {
  [DatabaseConstraints.UQ_USER_EMAIL]: 'Email already in use',
};

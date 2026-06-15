export class PaginatedResponseDto<T> {
  data: T[];
  page: number;
  totalPages: number;
}

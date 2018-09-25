// src/app/material/spanish-paginator-intl.ts
import { MatPaginatorIntl } from '@angular/material';

const spanishRangeLabel = (page: number, pageSize: number, length: number) => {
  return (
    page * pageSize + 1 + ' - ' + (page * pageSize + pageSize) + ' de ' + length
  );
};

export function getSpanishPaginatorIntl() {
  const paginatorIntl = new MatPaginatorIntl();

  paginatorIntl.itemsPerPageLabel = 'Elementos por página:';
  paginatorIntl.nextPageLabel = 'Siguiente página';
  paginatorIntl.previousPageLabel = 'Página anterior';
  paginatorIntl.getRangeLabel = spanishRangeLabel;

  return paginatorIntl;
}

export const BOOK_ROUTE = '#/book-a-speaker';
export const FIND_ROUTE = '#/find-speakers';

export const bookUrl = (name?: string) =>
  name ? `${BOOK_ROUTE}?speaker=${encodeURIComponent(name)}` : BOOK_ROUTE;

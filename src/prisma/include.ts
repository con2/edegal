/**
 * Narrows a refined to-one include. The ORM types every to-one include that takes a callback
 * as nullable, because a `where` in the callback could exclude the related row; a callback
 * that only selects columns cannot, so the row is there whenever the relation is required.
 */
export function required<T>(row: T | null): T {
  if (row === null) {
    throw new Error("A required relation was not loaded");
  }
  return row;
}

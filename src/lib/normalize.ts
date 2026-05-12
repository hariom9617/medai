/** Maps MongoDB _id to id on any plain object or array of objects. */
export function normalizeId<T extends Record<string, any>>(item: T): T {
  if (!item || typeof item !== 'object') return item;
  const _id = (item as any)._id;
  const id = item.id;

  // Helper to convert ObjectId or any object to string
  const toStr = (val: any): string => {
    if (!val) return '';
    if (typeof val === 'string') return val;
    if (typeof val === 'object' && val.toString && typeof val.toString === 'function') {
      return val.toString();
    }
    return String(val);
  };

  // Convert _id to id if id doesn't exist, or if id is an object (ObjectId)
  if (_id && (!id || typeof id === 'object')) {
    return { ...item, id: toStr(_id) } as T;
  }
  // If id exists but is an object, convert it to string
  if (id && typeof id === 'object') {
    return { ...item, id: toStr(id) } as T;
  }
  return item;
}

export function normalizeIds<T extends Record<string, any>>(items: T[]): T[] {
  return items.map(normalizeId);
}

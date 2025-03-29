/**
 * Clone the object
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  // Handle Date objects
  if (obj instanceof Date) {
    return new Date(obj.getTime()) as unknown as T;
  }

  // Handle Arrays
  if (Array.isArray(obj)) {
    const arrCopy = [] as unknown[];
    for (const item of obj) {
      arrCopy.push(deepClone(item));
    }
    return arrCopy as unknown as T;
  }

  // Handle Objects
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const objCopy = {} as { [key: string]: any };
  for (const key in obj) {
    if (Object.prototype.hasOwnProperty.call(obj, key)) {
      objCopy[key] = deepClone(obj[key]);
    }
  }
  return objCopy as T;
}

/**
 * Check if a value is a valid date
 * @param date - The object to check
 * @returns True if the object is a valid date
 */
export function isValidDate(date: unknown): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

/**
 * Check if a string represents a valid date
 * @param dateString - The string to check
 * @returns True if the string is a valid date
 */
export function isValidDateString(dateString: string | number | Date): boolean {
  if (dateString instanceof Date) {
    return isValidDate(dateString);
  }
  if (typeof dateString === 'number') {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  if (typeof dateString === 'string') {
    const date = new Date(dateString);
    return !isNaN(date.getTime());
  }
  return false;
}

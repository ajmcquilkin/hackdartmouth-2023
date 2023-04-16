export function toSQLiteDateTime(date: Date): string {
    const isoDateTime = date.toISOString();
    const sqliteDateTime = isoDateTime.replace('T', ' ').slice(0, -5);
    return sqliteDateTime;
  }
  
export function fromSQLiteDateTime(sqliteDateTime: string): Date {
    const isoDateTime = `${sqliteDateTime}.000Z`;
    const date = new Date(isoDateTime);
    return date;
  }
  
export function generateRandomDate(): Date {
    const today = new Date();
    const twoYearsAgo = new Date(today.getTime() - 1000 * 60 * 60 * 24 * 365 * 2);
    const randomTime = twoYearsAgo.getTime() + Math.random() * (today.getTime() - twoYearsAgo.getTime());
    const randomDate = new Date(randomTime);
    return randomDate;
  }
  
 export function naturalDateFormat(date: Date): string {
    const options = { month: 'long', day: 'numeric', year: 'numeric' };
    return date.toLocaleDateString('en-US', options as any);
  }
  
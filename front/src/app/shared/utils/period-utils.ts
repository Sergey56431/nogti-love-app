export class PeriodUtils {
  static convertMonths(month: number, year: number): string[] {
    const date = new Date(year, month + 1, 0).getDate();
    return [`${year}-${(month + 1).toString().padStart(2, '0')}-01 `, ` ${year}-${(month + 1).toString().padStart(2, '0')}-${date}`];
  }

  static convertYears(year: number): string[] {
    try {
      return [`${year}-01-01`, `${year}-12-31`];
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  static convertDays(date: Date): string[] {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();

    return [`${year}-${month}-${day}`, ` ${year}-${month}-${day}`];
  }

  static convertWeek(): string[] {
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
      const year = date.getFullYear();
      return `${year}-${month}-${day}`;
    };


    const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));

    return [`${formatDate(startOfWeek)}`, `${formatDate(endOfWeek)}`];
  }

  static convertPeriod(period: string) {

    switch (period) {
      case 'month':
         return this.convertMonths(new Date().getMonth(), new Date().getFullYear());
      case 'year':
        return this.convertYears(new Date().getFullYear());
      case 'today':
        return this.convertDays(new Date());
      case 'week':
        return this.convertWeek();
      case 'all':
        return [];
      default:
        return [];
    }
  }
}

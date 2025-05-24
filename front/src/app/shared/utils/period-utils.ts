export class PeriodUtils {
  static convertMonths(month: number, year: number): string {
    const date = new Date(year, month + 1, 0).getDate();
    return `${year}-${(month + 1).toString().padStart(2, '0')}-01 - ${year}-${(month + 1).toString().padStart(2, '0')}-${date}`;
  }

  static convertYears(year: number): string {
    try {
      return `${year}-01-01 - ${year}-12-31`;
    } catch (error) {
      console.log(error);
      return '';
    }
  }

  static convertDays(date: Date): string {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
    const year = date.getFullYear();

    return `${day}-${month}-${year} - ${day}-${month}-${year}`;
  }

  static convertWeek(): string {
    const formatDate = (date: Date) => {
      const day = String(date.getDate()).padStart(2, '0');
      const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
      const year = date.getFullYear();
      return `${day}-${month}-${year}`;
    };


    const today = new Date();
    const dayOfWeek = today.getDay();

    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - dayOfWeek + 1);

    const endOfWeek = new Date(today);
    endOfWeek.setDate(today.getDate() + (7 - dayOfWeek));

    return `${formatDate(startOfWeek)} - ${formatDate(endOfWeek)}`;

  }

  static convertPeriod(period: string, interval?: string) {
    let selectTime = null;
    if (interval) {
      return selectTime;
    }

    switch (period) {
      case 'month':
        selectTime = this.convertMonths(new Date().getMonth(), new Date().getFullYear());
        break;
      case 'year':
        selectTime = this.convertYears(new Date().getFullYear());
        break;
      case 'today':
        selectTime = this.convertDays(new Date());
        break;
      case 'week':
        selectTime = this.convertWeek();
        break;
      default:
        selectTime = '';
        break;
    }

    return selectTime;
  }
}

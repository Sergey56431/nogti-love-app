import { ToastMessageOptions } from 'primeng/api';


export class SnackStatusesUtil {
  static getStatuses(status: string, message?: string): ToastMessageOptions {
    if (status === 'success') {
      return {
        severity: 'success',
        summary: 'Успешно',
        detail: message ?? 'Запрос выполнен успешно', // Сюда можно будет подставлять свою строку
        life: 3000
      };
    }
    if (status === 'error') {
      return {
        severity: 'error',
        summary: 'Ошибка',
        detail: message ?? 'Произошла ошибка при отправке запроса', // Сюда можно будет подставлять свою строку
        life: 3000
      };
    } else {
      return {
        severity: 'secondary',
        summary: 'Ничего не произошло',
        detail: message ?? 'Неизвестная ошибка', // Сюда можно будет подставлять свою строку
        life: 3000
      };
    }
  }
}

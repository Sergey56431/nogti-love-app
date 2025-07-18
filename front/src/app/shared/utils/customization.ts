import { definePreset } from '@primeng/themes';
import Aura from '@primeng/themes/aura';

export const MyPreset = definePreset(Aura, {
  semantic: {
    primary: {
      50: '#fbe5ff',
      100: '#F9EDFB',
      200: '#EABAF0',
      300: '#DB81E5',
      400: '#BE4FC8',
      500: '#8B3792',
      600: '#5A215F',
      700: '#2E0D31',
      800: '#200623',
      900: '#1e0520',
      950: '#1e0420'
    }
  }
});

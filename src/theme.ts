import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

const config: ThemeConfig = {
  initialColorMode: 'dark',
  useSystemColorMode: false,
};

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#ffe5e5',
      100: '#fbb8b8',
      200: '#f48a8a',
      300: '#ed5c5c',
      400: '#e62e2e',
      500: '#cc1414',
      600: '#a00f0f',
      700: '#730a0a',
      800: '#460505',
      900: '#1d0000',
    },
    light: {
      primary: '#F8F9FA',
      secondary: '#E9ECEF',
      text: {
        primary: '#212529',
        secondary: '#6C757D',
      },
      accent: '#ff9404'
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'light.primary',
        color: props.colorMode === 'dark' ? 'white' : 'light.text.primary',
      },
    }),
  },
  components: {
    Button: {
      variants: {
        solid: (props: any) => ({
          bg: 'brand.500',
          color: 'white',
          _hover: {
            bg: 'brand.600',
          },
          _active: {
            bg: 'brand.700',
          },
        }),
      },
    },
  },
});

export default theme;
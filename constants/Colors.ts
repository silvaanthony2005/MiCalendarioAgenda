/**
 * Below are the colors that are used in the app. The colors are defined in the light and dark mode.
 * There are many other ways to style your app. For example, [Nativewind](https://www.nativewind.dev/), [Tamagui](https://tamagui.dev/), [unistyles](https://reactnativeunistyles.vercel.app), etc.
 */

const tintColorLight = '#FFA500'; // Anaranjado
const tintColorDark = '#FFA500'; // Anaranjado

export const Colors = {
  light: {
    text: '#000000', // Negro
    background: '#FFFFFF', // Blanco
    tint: tintColorLight,
    icon: '#000000', // Negro
    tabIconDefault: '#000000', // Negro
    tabIconSelected: tintColorLight,
  },
  dark: {
    text: '#FFFFFF', // Blanco
    background: '#000000', // Negro
    tint: tintColorDark,
    icon: '#FFFFFF', // Blanco
    tabIconDefault: '#FFFFFF', // Blanco
    tabIconSelected: tintColorDark,
  },
};

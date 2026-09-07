import { router as expoRouter, type ImperativeRouter } from 'expo-router';

// Expo SDK 57 currently generates `/folder/index` for index routes. Keep the
// runtime router intact while accepting the canonical `/folder` URL as well.
export const router = expoRouter as Omit<ImperativeRouter, 'push'> & {
  push: (href: string) => void;
};

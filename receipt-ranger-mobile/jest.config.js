// Extend (not replace) jest-expo's transformIgnorePatterns so additional
// untranspiled packages (lucide-react-native) are still run through Babel.
const preset = require('jest-expo/jest-preset');

const [defaultIgnore, ...restIgnore] = preset.transformIgnorePatterns;

module.exports = {
  preset: 'jest-expo',
  setupFilesAfterEnv: ['./jest.setup.js'],
  testPathIgnorePatterns: ['/node_modules/', '/\\.agents/'],
  transformIgnorePatterns: [
    defaultIgnore.replace('standard-navigation))', 'standard-navigation|lucide-react-native))'),
    ...restIgnore,
  ],
};

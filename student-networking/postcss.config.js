module.exports = {
  content: [
    './src/**/*.{html,js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

module.exports = {
  plugins: [
    require('tailwindcss'),
    require('autoprefixer'),
  ],
};

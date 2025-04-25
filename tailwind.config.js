module.exports = {
  content: [
    './src/**/*.{js,jsx,ts,tsx}',
    './index.html',
  ],
  theme: {
    extend: {
      maxWidth: {
        '4xl': '840px', // 25% larger than the default max-w-3xl (672px)
      },
    },
  },
  plugins: [],
}
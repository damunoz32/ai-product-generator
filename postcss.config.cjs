// postcss.config.cjs
module.exports = {
  plugins: [
    // Explicitly require the tailwindcss plugin
    require('tailwindcss'),
    // Explicitly require the autoprefixer plugin
    require('autoprefixer'),
  ],
};

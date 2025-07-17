// postcss.config.cjs
module.exports = {
  plugins: {
    // This is the key change: use the specific PostCSS plugin package
    '@tailwindcss/postcss': {}, 
    autoprefixer: {},
  },
};

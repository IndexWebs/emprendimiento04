export default {
  mode: "universal",
  // Global page headers: https://go.nuxtjs.dev/config-head
  head: {
    title: "Melo Todo",
    htmlAttrs: {
      lang: "en",
    },
    meta: [
      { charset: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { hid: "description", name: "description", content: "" },
      { name: "format-detection", content: "telephone=no" },
    ],
    link: [
      { rel: "icon", type: "image/x-icon", href: "/favicon.png" },
      { rel: 'stylesheet', href: 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css' },
      {
        rel: 'stylesheet',
        href: 'https://fonts.googleapis.com/css2?family=Salsa&display=swap',
      },
    ],
  },

  // Global CSS: https://go.nuxtjs.dev/config-css
  css: ["@/assets/main.css"],

  // Plugins to run before rendering page: https://go.nuxtjs.dev/config-plugins
  plugins: [],

  // Auto import components: https://go.nuxtjs.dev/config-components
  components: true,

  // Modules for dev and build (recommended): https://go.nuxtjs.dev/config-modules
  buildModules: [
    // https://go.nuxtjs.dev/typescript
    "@nuxt/typescript-build",
  ],
  // Modules: https://go.nuxtjs.dev/config-modules
  modules: ["@nuxtjs/tailwindcss", "@nuxtjs/axios"],

  publicRuntimeConfig: {
    wompiPublicKey: process.env.WOMPI_PUBLIC_KEY || "",
  },

  // Build Configuration: https://go.nuxtjs.dev/config-build
  build: {},
};

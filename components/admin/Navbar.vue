<template>
  <header class="bg-white static lg:absolute left-0 top-0 w-full">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      aria-label="Global"
    >
      <div class="flex">
        <nuxt-link to="/admin" class="-m-1.5 p-1.5">
          <img
            class="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt=""
          />
        </nuxt-link>
      </div>
      <div class="flex space-x-3 uppercase text-xs">
        <nuxt-link
          to="/admin"
          class="flex items-center gap-x-1 font-semibold leading-6 text-gray-900"
        >
          Productos
        </nuxt-link>
        <nuxt-link
          to="/admin/categories"
          class="flex items-center gap-x-1 font-semibold leading-6 text-gray-900"
        >
          Categorías
        </nuxt-link>
        <nuxt-link
          to="/admin/pedidos"
          class="flex items-center gap-x-1 font-semibold leading-6 text-gray-900"
        >
          Pedidos
        </nuxt-link>
        <nuxt-link
          to="/admin/create"
          class="font-semibold leading-6 text-gray-900"
          >Crear</nuxt-link
        >
      </div>
      <button
        @click="logOut"
        class="flex items-center space-x-2 text-xs uppercase font-semibold leading-6 text-gray-900"
      >
        <LogOutIcon class="w-4 h-4 mr-2" />
        Log Out
      </button>

      <div class="flex lg:hidden">
        <button @click="showMobileMenu = true">
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
            />
          </svg>
        </button>
      </div>
    </nav>

    <nav
      v-if="showMobileMenu"
      class="w-full min-h-screen bg-white absolute z-30 top-0 px-8 py-4"
    >
      <div>
        <button class="absolute top-6 right-6" @click="showMobileMenu = false">
          <svg
            class="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
        <nuxt-link to="/admin" class="-m-1.5 p-1.5">
          <img
            class="h-8 w-auto"
            src="https://tailwindui.com/img/logos/mark.svg?color=indigo&shade=600"
            alt=""
          />
        </nuxt-link>
        <div
          class="flex flex-col space-y-5 text-lg font-semibold leading-6 text-gray-900"
        >
          <nuxt-link to="/admin"> Productos </nuxt-link>
          <nuxt-link to="/admin/categories">Categorías</nuxt-link>
          <nuxt-link to="/admin/pedidos">Pedidos</nuxt-link>
          <nuxt-link to="/admin/create">Crear</nuxt-link>
        </div>
      </div>
    </nav>
  </header>
</template>

<script>
import { firebase } from "@/plugins/firebase";
import LogOutIcon from "../shared/icons/LogOutIcon.vue";
export default {
  components: { LogOutIcon },
  name: "Header",
  data() {
    return {
      showMobileMenu: false,
    };
  },

  methods: {
    logOut() {
      firebase.auth().signOut();
      this.$router.push("/");
    },
  },
};
</script>

<style></style>

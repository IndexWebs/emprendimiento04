<template>
  <header class="bg-primary sticky z-20 px-0 md:px-14">
    <nav
      class="mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8"
      aria-label="Global"
    >
      <div class="flex lg:flex-1">
        <nuxt-link to="/" class="flex space-x-2 items-center -m-1.5 p-1.5">
          <img class="w-14" src="@/assets/images/Logo.png" alt="" />
          <!-- <span class="text-lg font-semibold">Doggy Stickers</span> -->
        </nuxt-link>
      </div>

      <div class="flex lg:flex-1 lg:justify-end">
        <button
          @click="toggleCart"
          class="relative text-xs uppercase font-semibold leading-6 text-opacity-60"
        >
          <CartIcon class="w-6 h-6 text-white" />
          <span
            v-if="cartCount"
            class="cart-badge"
          >
            {{ cartCount }}
          </span>
        </button>
      </div>
    </nav>
  </header>
</template>

<script>
import CartIcon from "@/components/shared/icons/CartIcon.vue";

export default {
  name: "Header",
  components: {
    CartIcon,
  },
  computed: {
    cartCount() {
      return this.$store.getters.cartItems.length;
    },
  },
  methods: {
    toggleCart() {
      this.$emit("click");
    },
  },
};
</script>

<style scoped>
.cart-badge {
  position: absolute;
  top: -0.25rem;
  right: -0.35rem;
  min-width: 1.25rem;
  height: 1.25rem;
  border-radius: 999px;
  background: #f472b6;
  color: #fff;
  font-size: 0.7rem;
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.25rem;
}
</style>

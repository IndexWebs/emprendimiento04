<template>
  <transition name="cart-overlay">
    <section v-if="showCart" class="cart-overlay" @click.self="close">
      <div class="cart-panel flex flex-col overflow-y-auto" @click.stop>
        <div class="flex-1 px-4 py-6 sm:px-6 overflow-scroll h-20">
        <div class="flex items-start justify-between">
          <h4 id="slide-over-title text-primary">Tu pedido</h4>
          <div class="ml-3 flex h-7 items-center">
            <button @click="close" type="button" class="-m-2 p-2 text-gray-400 hover:text-gray-500">
              <span @click="close" class="sr-only">Close panel</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor"
                aria-hidden="true">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="mt-8">
          <div class="flow-root">
            <ul role="list" class="-my-6 divide-y divide-gray-200">
              <li v-for="item in items" :key="item.uid" class="flex py-6">
                <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                  <img :src="item.image" alt="Imagen del producto" class="h-full w-full object-cover object-center" />
                </div>

                <div class="ml-4 flex flex-1 flex-col">
                  <div>
                    <h4 class="max-w-xs mb-1">
                      <a href="#">{{ item.name }}</a>
                    </h4>
                    <h4 class="max-w-lg text-xs mb-3"><span class="font-bold">COP</span> {{ formatPrice(item.price) }}</h4>
                    <p class="text-sm text-gray-500">{{ item.category }}</p>
                  </div>
                  <div class="flex items-center justify-between text-sm">
                    <p class="text-gray-500">Cantidad: {{ item.qty }}</p>
                    <div class="flex">
                      <button @click="removeFromCart(item)" type="button"
                        class="font-medium text-primary text-opacity-70 hover:text-opacity-50 transition-all duration-300 ease-in-out">
                        Remove
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>

        <div class="border-t border-gray-200 px-4 py-6 sm:px-6">
        <div class="flex justify-between text-base font-medium text-gray-900">
          <p>Subtotal</p>
          <p>${{ subtotalFormateado }}</p>
        </div>
        <div class="flex justify-between text-base font-medium text-gray-900">
          <p>Descuento</p>
          <p>${{ descuentoFormateado }}</p>
        </div>
        <div class="flex justify-between text-base font-medium text-gray-900">
          <p>Total</p>
          <p>${{ totalFormateado }}</p>
        </div>
        <p class="mt-0.5 text-sm text-gray-500">
          Envío e impuestos calculados al finalizar la compra.
        </p>
        <div class="mt-6">
          <PrimaryButton @click="goToCheckout" text="Checkout" class="w-full" />
        </div>
        <div class="mt-6 flex justify-center text-center text-sm text-gray-500">
          <p>
            o
            <nuxt-link @click="close" to="/"
              class="font-medium text-primary text-opacity-70 hover:text-opacity-50 transition-all duration-300 ease-in-out">
              Seguir comprando
              <span aria-hidden="true"> &rarr;</span>
            </nuxt-link>
          </p>
        </div>
      </div>
      </div>
    </section>
  </transition>
</template>

<script>
import Checkout from "./Checkout.vue";
import PrimaryButton from "./PrimaryButton.vue";
import { formatPrice } from '@/utils/formatPrice';

export default {
  components: { PrimaryButton, Checkout },
  props: {
    showCart: { type: Boolean },
  },
  data() {
    return {
      referencia: `pedido-${new Date().toISOString().replace(/[:.]/g, '-')}`,
    };
  },
  computed: {
    items() {
      return this.$store.getters.cartItems;
    },
    subtotal() {
      return this.$store.getters.cartSubtotal;
    },
    descuento() {
      return this.$store.getters.cartDiscount;
    },
    total() {
      return this.$store.getters.cartTotalWithDiscount;
    },
    subtotalFormateado() {
      return this.formatPrice(this.subtotal);
    },
    descuentoFormateado() {
      return this.formatPrice(this.descuento);
    },
    totalFormateado() {
      return this.formatPrice(this.total);
    }
  },
  methods: {
    formatPrice,
    close() {
      this.$emit("click");
    },
    goToCheckout() {
      this.$emit("click"); // Cierra el carrito
      this.$router.push('/checkout');
    },
    removeFromCart(item) {
      this.$store.commit("removeItem", item);
    },
  },
};
</script>

<style scoped>
.cart-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  justify-content: flex-end;
  background: rgba(0, 0, 0, 0.45);
  z-index: 80;
}

.cart-panel {
  background: #fff;
  width: min(420px, 100%);
  max-width: 100%;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  box-shadow: -12px 0 30px rgba(15, 23, 42, 0.2);
}

.cart-overlay-enter-active,
.cart-overlay-leave-active {
  transition: opacity 0.18s ease;
}

.cart-overlay-enter,
.cart-overlay-leave-to {
  opacity: 0;
}

.cart-overlay-enter-active .cart-panel {
  animation: cart-slide-in 0.25s ease forwards;
}

.cart-overlay-leave-active .cart-panel {
  animation: cart-slide-out 0.25s ease forwards;
}

@keyframes cart-slide-in {
  from {
    transform: translateX(20%);
  }
  to {
    transform: translateX(0);
  }
}

@keyframes cart-slide-out {
  from {
    transform: translateX(0);
  }
  to {
    transform: translateX(20%);
  }
}

@media (max-width: 640px) {
  .cart-panel {
    width: 100%;
  }
}
</style>

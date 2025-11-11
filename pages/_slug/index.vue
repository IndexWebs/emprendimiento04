<template>
  <div class="w-full max-w-md mx-auto px-2 md:max-w-6xl md:px-10 pb-8">
    <div class="pt-0 md:pt-6 overflow-hidden">
      <nav aria-label="Breadcrumb" class="hidden md:flex justify-between">
        <ol class="flex max-w-2xl items-center space-x-2 lg:max-w-7xl">
          <li>
            <div class="flex items-center">
              <a href="#" class="mr-2 text-sm font-medium text-gray-900">Productos</a>
              <svg class="h-5 w-4 text-gray-300" fill="currentColor" viewBox="0 0 16 20">
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </div>
          </li>
          <li>
            <div class="flex items-center">
              <a href="#" class="mr-2 text-sm font-medium text-gray-900">{{ product.category }}</a>
              <svg class="h-5 w-4 text-gray-300" fill="currentColor" viewBox="0 0 16 20">
                <path d="M5.697 4.34L8.98 16.532h1.327L7.025 4.341H5.697z" />
              </svg>
            </div>
          </li>
          <li class="text-sm">
            <a href="#" class="font-medium text-gray-500 hover:text-gray-600">{{ product.name }}</a>
          </li>
        </ol>
        <nuxt-link to="/"
          class="text-secondary text-opacity-70 hover:text-opacity-50 text-xs uppercase">Volver</nuxt-link>
      </nav>

      <div class="grid grid-cols-1 md:grid-cols-12 gap-2 md:gap-8 pt-0 md:pt-8">
        <!-- Carousel IZQUIERDA -->
        <div class="col-span-1 md:col-span-6">
          <div class="relative w-full">
            <div class="relative h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg bg-gray-100">
              <div v-for="(image, index) in product.images" :key="index"
                :class="index === activeIndex ? 'block' : 'hidden'">
                <img :src="image" class="h-full w-full object-contain object-center" />
              </div>

              <!-- Flechas -->
              <button @click="prevImage" class="absolute top-1/2 left-0 -translate-y-1/2 px-4">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 6 10">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4" />
                </svg>
              </button>
              <button @click="nextImage" class="absolute top-1/2 right-0 -translate-y-1/2 px-4">
                <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 6 10">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4" />
                </svg>
              </button>
            </div>

            <!-- Miniaturas -->
            <div class="flex mt-4 space-x-2 overflow-x-auto">
              <div v-for="(thumb, i) in product.images" :key="i" @click="activeIndex = i"
                :class="['w-16 h-16 rounded overflow-hidden cursor-pointer border-2', activeIndex === i ? 'border-secondary' : 'border-gray-200']">
                <img :src="thumb" class="object-cover w-full h-full" />
              </div>
            </div>
          </div>
        </div>

        <!-- LADO DERECHO -->
        <div class="col-span-1 md:col-span-6 flex flex-col gap-4 px-1 md:px-0 md:overflow-y-auto md:max-h-screen md:pr-2">
          <!-- Personas viendo -->
          <div class="mt-4 md:mt-0 bg-red-100 rounded-xl flex items-center px-4 py-3 text-xs">
            <svg class="w-4 h-4 text-red-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            <span class="font-bold text-xs text-gray-800 mr-1">{{ personasViendo }}</span>
            <span class="text-gray-700 font-medium">Personas viendo este producto ahora!</span>
          </div>

          <!-- Precio -->
          <p class="text-3xl font-semibold text-gray-900 mt-2">${{ precioFormateado }}</p>

          <!-- Rating -->
          <div class="flex items-center gap-2 text-sm text-gray-700">
            <div class="flex gap-1 text-yellow-400 text-lg">
              <i class="fas fa-star" />
              <i class="fas fa-star" />
              <i class="fas fa-star" />
              <i class="fas fa-star" />
              <i class="fas fa-star-half-alt" />
            </div>
            <span>4.8/5 Calificación</span>
          </div>

          <!-- Título del producto -->
          <h1 class="text-2xl font-bold text-gray-900">
            {{ product.name }}
          </h1>

          <!-- Descripción corta -->
          <p class="text-sm text-gray-700" v-if="product.description">
            {{ product.description }}
          </p>

          <div v-if="product.variantes && product.variantes.length" class="mt-4">
            <label for="variantes" class="block text-sm font-medium text-gray-700 mb-1">Seleccionar color</label>
            <select id="color" v-model="selectedColor"
              class="block w-full border border-gray-300 rounded px-3 py-2 pr-10 shadow-sm focus:ring-black focus:border-black sm:text-sm text-gray-900">
              <option disabled value="">Selecciona un color</option>
              <option v-for="variante in product.variantes" :key="variante" :value="variante">
                {{ variante }}
              </option>
            </select>
          </div>
          <!-- Selector de cantidad y botón de agregar -->
          <div class="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center mt-4">
            <div class="flex border w-full sm:w-5/12 rounded overflow-hidden">
              <button @click="decreaseQuantity" class="px-3 py-1 text-xl text-gray-800 hover:bg-gray-100">−</button>
              <div class="px-4 py-1 text-base font-medium text-gray-900">{{ cantidad }}</div>
              <button @click="increaseQuantity" class="px-3 py-1 text-xl text-gray-800 hover:bg-gray-100">+</button>
            </div>

            <PrimaryButton
              class="w-full"
              @click="handleAddToCart"
              text="Agregar al carrito"
              variant="secondary"
              variantStyle="light"
            />
          </div>

          <!-- Botón de compra directa -->
          <PrimaryButton class="w-full" @click="comprarAhora" text="Comprar ahora"/>

          <!-- We Accept -->
          <div class="mt-6">
            <p class="text-sm text-gray-700 font-medium mb-1">Aceptamos</p>
            <!-- Visa -->
            <img src="@/assets/images//metodos/visa.svg" class="inline mr-2 w-5" alt="Visa">

            <!-- Mastercard -->
            <img src="@/assets/images/metodos/master.svg" class="inline mr-2 w-5" alt="Mastercard">

            <!-- American Express -->
            <img src="@/assets/images/metodos/american.svg" class="inline mr-2 w-5" alt="American Express">

            <!-- Bancolombia -->
            <img src="@/assets/images/metodos/bancolombia.svg" class="inline mr-2 w-5" alt="Bancolombia">

            <!-- Nequi -->
            <img src="@/assets/images/metodos/nequi.png" class="inline mr-2 w-5" alt="Nequi">

            <!-- PSE -->
            <img src="@/assets/images/metodos/pse.png" class="inline mr-2 w-5" alt="PSE">

            <!-- Efectivo -->
            <img src="@/assets/images/metodos/efectivo.svg" class="inline w-5" alt="Efectivo">

            <img src="@/assets/images/metodos/credito.svg" class="inline w-5" alt="Credito">
          </div>
          
          <!-- Detalles -->
          <div class="mt-6" v-if="product.detalles && product.detalles.length">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Detalles</h3>
            <ul class="text-sm text-gray-700 list-disc pl-5 space-y-1">
              <li v-for="(detalle, i) in product.detalles" :key="i">{{ detalle }}</li>
            </ul>
          </div>

          <!-- Shipping -->
          <div class="mt-4">
            <h3 class="text-sm font-semibold text-gray-800 mb-2">Envíos y Devoluciones</h3>
            <!-- Podés hacer un toggle aquí si querés ocultarlo -->
            <p class="text-sm text-gray-600">
              Ofrecemos envío gratis en pedidos superiores a $50 y devoluciones fáciles en 30 días.
            </p>
          </div>
        </div>

      </div>
    </div>
  </div>
</template>

<script>
import eventBus from "@/plugins/eventBus";
// import InputNumber from "@/components/shared/inputs/InputNumber.vue";
import PrimaryButton from "~/components/shared/PrimaryButton.vue";
import { formatPrice } from '@/utils/formatPrice';

export default {
  async fetch({ store, params }) {
    await store.dispatch("fetchProductBySlug", params.slug);
  },
  data() {
    return {
      activeIndex: 0,
      cantidad: 1,
      selectedColor: '',
      personasViendo: Math.floor(Math.random() * 11) + 10 // 10 a 20
    };
  },
  computed: {
    product() {
      return this.$store.state.product;
    },
    precioFormateado() {
      return formatPrice(Number(this.product.price));
    }
  },
  components: { PrimaryButton },
  methods: {
    updaeValue(newOne) {
      this.cantidad = newOne;
    },
    handleAddToCart() {
      if (this.product.color && this.product.color.length && !this.selectedColor) {
        alert("Por favor seleccioná un color.");
        return;
      }

      this.$store.dispatch("addToCart", {
        product: this.product,
        quantity: this.cantidad,
        color: this.selectedColor,
      });

      eventBus.$emit("addToCart");
    },
    nextImage() {
      this.activeIndex =
        (this.activeIndex + 1) % this.product.images.length;
    },
    prevImage() {
      this.activeIndex =
        (this.activeIndex - 1 + this.product.images.length) %
        this.product.images.length;
    },
    increaseQuantity() {
      this.cantidad++
    },
    decreaseQuantity() {
      if (this.cantidad > 1) this.cantidad--
    },
    comprarAhora() {
      if (this.product.color && this.product.color.length && !this.selectedColor) {
        alert("Por favor selecciona un color.");
        return;
      }
      this.$store.dispatch("addToCart", {
        product: this.product,
        quantity: this.cantidad,
        color: this.selectedColor,
      });
      this.$router.push("/checkout");
    },
  },
};
</script>
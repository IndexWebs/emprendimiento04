<template>
  <div>
    <form>
      <div class="grid md:grid-cols-2 md:gap-6">
        <div class="relative z-0 w-full mb-6 group">
          <input type="text" v-model="product.name"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" " required />
          <label for="floating_repeat_password"
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Nombre</label>
        </div>
      </div>
      <div class="grid md:grid-cols-2 md:gap-6">
        <div class="relative z-0 w-full mb-6 group">
          <select v-model="product.category"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            required>
            <option value="" disabled selected>Selecciona una categoría</option>
            <option v-for="category in categories" :key="category.id">
              {{ category.name }}
            </option>
          </select>
          <label
            class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Categoría</label>
        </div>
        <div class="relative z-0 w-full mb-6 group">
          <input type="text" v-model="slug"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" " required />
          <label
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Enlace</label>
        </div>
      </div>
      <div class="grid md:grid-cols-2 md:gap-6">
        <div class="relative z-0 w-full mb-6 group">
          <input type="text" v-model="formattedPrice" @keypress="allowOnlyNumbers"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" " required />
          <label
            class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Precio</label>
        </div>

        <div class="relative z-0 w-full mb-6 group">
          <input type="file" multiple @change="onFileChange"
            class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
            placeholder=" " required />
          <label
            class="peer-focus:font-medium absolute text-sm text-gray-500 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">
            Images
          </label>
        </div>
      </div>
      <div class="relative z-0 w-full mb-6 group">
        <textarea type="text" v-model="product.description"
          class="block py-2.5 px-0 w-full text-sm text-gray-900 bg-transparent border-0 border-b-2 border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
          placeholder=" " required />
        <label
          class="peer-focus:font-medium absolute text-sm text-gray-500 dark:text-gray-400 duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:left-0 peer-focus:text-blue-600 peer-focus:dark:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6">Texto</label>
      </div>
      <div class="relative z-0 w-full mb-6 group">
        <label class="block text-sm font-medium text-gray-700 mb-2">Detalles del producto</label>
        <div v-for="(detalle, i) in product.detalles" :key="i" class="flex items-center mb-2 gap-2">
          <input type="text" v-model="product.detalles[i]" class="flex-1 py-2 px-3 border rounded" placeholder="Detalle..." />
          <button type="button" @click="product.detalles.splice(i, 1)" class="text-red-500 text-lg">✕</button>
        </div>
        <button type="button" @click="product.detalles.push('')" class="mt-2 px-3 py-1 bg-blue-100 text-blue-700 rounded">Agregar detalle</button>
      </div>
      <button type="submit" @click.prevent="onSubmitButton"
        class="text-white bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm w-full sm:w-auto px-5 py-2.5 text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800">
        {{ isLoading ? 'Cargando...' : 'Crear' }}
      </button>
    </form>
  </div>
</template>

<script>
import { mapState, mapActions } from "vuex";
import { formatPrice } from '@/utils/formatPrice';

export default {
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      product: {
        name: null,
        description: null,
        images: [],
        handle: "",
        price: '',
        category: null,
        stock: true,
        detalles: []
      },
      isLoading: false
    };
  },
  computed: {
    ...mapState(["categories"]),
    slug() {
      if (this.product.name) {
        this.product.handle = this.product.name.replace(/ /g, "-");
        return this.product.handle;
      } else {
        return "";
      }
    },
    formattedPrice: {
      get() {
        if (!this.product.price) return '';
        return formatPrice(Number(this.product.price));
      },
      set(value) {
        const rawValue = String(value || '').replace(/\D/g, '');
        this.product.price = rawValue ? Number(rawValue) : 0;
      }
    },
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    ...mapActions(["fetchCategories", "addProduct"]),
    allowOnlyNumbers(event) {
      const charCode = event.key.charCodeAt(0);
      if (charCode < 48 || charCode > 57) {
        event.preventDefault();
      }
    },
    onFileChange(event) {
      this.product.images = Array.from(event.target.files);
    },
    async onSubmitButton() {
      try {
        this.isLoading = true;
        await this.addProduct(this.product);
      } catch (error) {
        console.error("Error al cargar el producto:", error);
      } finally {
        this.isLoading = false;
        this.$router.back();
      }
    }
  }
};
</script>

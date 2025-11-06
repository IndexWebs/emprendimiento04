<template>
  <div class="space-y-4">
    <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Productos</h1>
        <p class="text-sm text-gray-500">Gestiona tu catálogo y mantén la información al día.</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <nuxt-link to="/admin/create"
          class="inline-flex items-center gap-2 rounded-lg bg-secondary px-4 py-2 text-sm font-semibold text-white hover:bg-secondary/90 transition">
          <span class="text-lg leading-none">+</span>
          Nuevo producto
        </nuxt-link>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-3">
      <div class="md:col-span-2">
        <div class="relative">
          <input v-model.trim="searchTerm" type="search" placeholder="Buscar por nombre o categoría"
            class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 placeholder-gray-400 shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20" />
          <button v-if="searchTerm" @click="searchTerm = ''"
            class="absolute inset-y-0 right-3 text-xs text-gray-400 hover:text-gray-600">
            Limpiar
          </button>
        </div>
      </div>
      <div class="flex gap-2">
        <select v-model="categoryFilter"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20">
          <option value="all">Todas las categorías</option>
          <option v-for="category in categories" :key="category.id" :value="category.name">
            {{ category.name }}
          </option>
        </select>
        <select v-model="statusFilter"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20">
          <option value="all">Todo el stock</option>
          <option value="in">En stock</option>
          <option value="out">Sin stock</option>
        </select>
      </div>
    </div>

    <div class="rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left text-gray-500">
        <thead class="text-xs font-semibold text-white uppercase bg-secondary">
          <tr>
            <th scope="col" class="px-6 py-3">Nombre</th>
            <th scope="col" class="px-6 py-3">Categoría</th>
            <th scope="col" class="px-6 py-3">Precio</th>
            <th scope="col" class="px-6 py-3 text-center">Stock</th>
            <th scope="col" class="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!displayProducts.length">
            <td colspan="5" class="px-6 py-10 text-center text-sm text-gray-500">
              No se encontraron productos con los filtros aplicados.
            </td>
          </tr>
          <tr v-for="product in displayProducts" :key="product.id"
            class="bg-white border-b border-gray-100 transition hover:bg-gray-50">
            <th scope="row" class="px-6 py-4 font-medium text-gray-900">
              <div class="flex flex-col">
                <span>{{ product.name }}</span>
                <span class="text-xs text-gray-400">ID: {{ product.id }}</span>
              </div>
            </th>
            <td class="px-6 py-4 capitalize">{{ product.category || '—' }}</td>
            <td class="px-6 py-4 font-semibold text-gray-800">${{ formatPrice(product.price) }}</td>
            <td class="px-6 py-4 text-center">
              <span
                :class="product.stock ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'"
                class="inline-flex items-center justify-center rounded-full px-3 py-1 text-xs font-medium">
                {{ product.stock ? 'En stock' : 'Sin stock' }}
              </span>
            </td>
            <td class="px-6 py-4">
              <div class="flex items-center justify-end gap-3">
                <nuxt-link :to="`/admin/${product.handle}`"
                  class="inline-flex items-center rounded-full bg-white p-2 shadow hover:bg-gray-100 transition"
                  title="Editar producto">
                  <EditIcon class="w-4 h-4 text-secondary" />
                </nuxt-link>
                <button @click="deleteDocument(product.id)"
                  class="inline-flex items-center rounded-full bg-white p-2 shadow hover:bg-gray-100 transition"
                  title="Eliminar producto">
                  <TrashIcon class="w-4 h-4 text-primary" />
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import EditIcon from "~/components/shared/icons/EditIcon.vue";
import TrashIcon from "~/components/shared/icons/TrashIcon.vue";
import { mapState, mapActions } from 'vuex';
import { formatPrice } from '@/utils/formatPrice';

export default {
  components: { EditIcon, TrashIcon },
  middleware: "auth",
  layout: "admin",
  data() {
    return {
      searchTerm: "",
      statusFilter: "all",
      categoryFilter: "all",
    };
  },
  computed: {
    ...mapState(['filteredProducts', 'categories']),
    displayProducts() {
      const term = this.searchTerm.trim().toLowerCase();
      return (this.filteredProducts || []).filter((product) => {
        const matchesSearch =
          !term ||
          product.name?.toLowerCase().includes(term) ||
          product.category?.toLowerCase().includes(term);

        const matchesCategory =
          this.categoryFilter === 'all' ||
          product.category === this.categoryFilter;

        const matchesStock =
          this.statusFilter === 'all' ||
          (this.statusFilter === 'in' && product.stock) ||
          (this.statusFilter === 'out' && !product.stock);

        return matchesSearch && matchesCategory && matchesStock;
      });
    },
  },
  created() {
    this.fetchProducts();
    if (!this.categories.length) {
      this.fetchCategories();
    }
  },
  methods: {
    ...mapActions(['fetchProducts', 'fetchCategories', 'deleteProduct']),
    formatPrice,
    async deleteDocument(id) {
      const confirmDelete = window.confirm(
        "¿Estás seguro de que quieres eliminar este documento?"
      );
      if (!confirmDelete) {
        return;
      }
      await this.deleteProduct(id);
    }
  },
};
</script>

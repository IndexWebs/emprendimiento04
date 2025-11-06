<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Categorías</h1>
        <p class="text-sm text-gray-500">Organiza las categorías que se muestran en la tienda.</p>
      </div>
    </div>

    <form @submit.prevent="onAddCategory" class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
      <div class="flex flex-col gap-3 md:flex-row md:items-center">
        <input
          v-model="newCategory"
          type="text"
          placeholder="Nombre de la categoría"
          class="w-full rounded-md border border-gray-200 px-4 py-2 text-sm text-gray-700 placeholder-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
        <button
          type="submit"
          class="inline-flex items-center justify-center rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
          :disabled="!newCategory.trim() || saving"
        >
          {{ saving ? 'Guardando...' : 'Agregar categoría' }}
        </button>
      </div>
      <p v-if="errorMessage" class="text-sm text-red-500">{{ errorMessage }}</p>
    </form>

    <div class="rounded-lg border border-gray-100 shadow-sm overflow-hidden">
      <table class="w-full text-sm text-left text-gray-600">
        <thead class="bg-secondary text-xs font-semibold uppercase text-white">
          <tr>
            <th class="px-6 py-3">Nombre</th>
            <th class="px-6 py-3">Slug</th>
            <th class="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!categories.length">
            <td colspan="3" class="px-6 py-10 text-center text-sm text-gray-500">
              Aún no hay categorías cargadas.
            </td>
          </tr>
          <tr
            v-for="category in categories"
            :key="category.id"
            class="border-b border-gray-100 bg-white transition hover:bg-gray-50"
          >
            <td class="px-6 py-3 font-medium text-gray-900">
              <div v-if="editingId === category.id" class="flex gap-2">
                <input
                  v-model="editingName"
                  type="text"
                  class="w-full rounded-md border border-gray-200 px-3 py-1.5 text-sm text-gray-700 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                />
              </div>
              <span v-else>{{ category.name }}</span>
            </td>
            <td class="px-6 py-3 text-gray-500">
              {{ category.handle || generarHandle(category.name) }}
            </td>
            <td class="px-6 py-3">
              <div class="flex justify-end gap-2">
                <template v-if="editingId === category.id">
                  <button
                    @click="saveEdit(category)"
                    class="rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition"
                  >
                    Guardar
                  </button>
                  <button
                    @click="cancelEdit"
                    class="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600 hover:bg-gray-200 transition"
                  >
                    Cancelar
                  </button>
                </template>
                <template v-else>
                  <button
                    @click="startEdit(category)"
                    class="rounded-full bg-white p-2 shadow hover:bg-gray-100 transition"
                    title="Editar"
                  >
                    ✏️
                  </button>
                  <button
                    @click="onDeleteCategory(category)"
                    class="rounded-full bg-white p-2 shadow hover:bg-gray-100 transition text-red-500"
                    title="Eliminar"
                  >
                    🗑️
                  </button>
                </template>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex';

export default {
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      newCategory: '',
      editingId: null,
      editingName: '',
      saving: false,
      errorMessage: '',
    };
  },
  computed: {
    ...mapState(['categories']),
  },
  created() {
    if (!this.categories.length) {
      this.fetchCategories();
    }
  },
  methods: {
    ...mapActions(['fetchCategories', 'addCategory', 'updateCategory', 'deleteCategory']),
    generarHandle(nombre) {
      return (nombre || '').toLowerCase().trim().replace(/\s+/g, '-');
    },
    async onAddCategory() {
      try {
        this.saving = true;
        this.errorMessage = '';
        await this.addCategory(this.newCategory);
        this.newCategory = '';
      } catch (error) {
        this.errorMessage = error.message || 'No se pudo crear la categoría';
      } finally {
        this.saving = false;
      }
    },
    startEdit(category) {
      this.editingId = category.id;
      this.editingName = category.name;
      this.errorMessage = '';
    },
    cancelEdit() {
      this.editingId = null;
      this.editingName = '';
    },
    async saveEdit(category) {
      if (!this.editingName.trim()) {
        this.errorMessage = 'El nombre no puede quedar vacío';
        return;
      }
      try {
        this.saving = true;
        this.errorMessage = '';
        await this.updateCategory({ id: category.id, name: this.editingName });
        this.cancelEdit();
      } catch (error) {
        this.errorMessage = error.message || 'No se pudo actualizar la categoría';
      } finally {
        this.saving = false;
      }
    },
    async onDeleteCategory(category) {
      const confirmDelete = window.confirm(`¿Eliminar la categoría "${category.name}"?`);
      if (!confirmDelete) return;
      try {
        await this.deleteCategory(category.id);
      } catch (error) {
        this.errorMessage = error.message || 'No se pudo eliminar la categoría';
      }
    },
  },
};
</script>

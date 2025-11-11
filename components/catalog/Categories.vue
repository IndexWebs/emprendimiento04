<template>
  <section class="catalog-filters">
    <div class="catalog-filters__field">
      <label for="catalog-search">Buscar producto</label>
      <input
        id="catalog-search"
        type="text"
        v-model="searchTerm"
        @input="emitSearch"
        placeholder="Escribe el nombre"
      />
    </div>
    <DropdownSelect
      class="catalog-filters__dropdown"
      :options="dropdownOptions"
      v-model="selectedCategory"
      label="Categoría"
      placeholder="Todas las categorías"
      @change="handleCategoryChange"
    />
  </section>
</template>

<script>
import { mapState, mapActions } from "vuex";
import DropdownSelect from "~/components/ui/DropdownSelect.vue";

export default {
  components: {
    DropdownSelect,
  },
  data() {
    return {
      selectedCategory: "",
      searchTerm: "",
    };
  },
  computed: {
    ...mapState(["categories"]),
    dropdownOptions() {
      const options = this.categories.map((category) => ({
        label: category.name,
        value: category.name,
      }));
      return [{ label: "Todas las categorías", value: "" }, ...options];
    },
  },
  created() {
    this.fetchCategories();
  },
  methods: {
    ...mapActions(["fetchCategories"]),
    emitSearch() {
      this.$emit("search-change", this.searchTerm);
    },
    handleCategoryChange() {
      this.$emit("category-selected", this.selectedCategory);
    },
  },
};
</script>

<style scoped>
.catalog-filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  padding: 1.5rem;
  background: #fff;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(15, 23, 42, 0.08);
}

.catalog-filters__field {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.catalog-filters__field label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.catalog-filters__field input {
  border: 1px solid #e5e7eb;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  font-size: 0.95rem;
  color: #111827;
  background: #f9fafb;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

.catalog-filters__field input:focus {
  outline: none;
  border-color: #111827;
  box-shadow: 0 0 0 2px rgba(17, 24, 39, 0.15);
}

.catalog-filters__dropdown {
  width: 100%;
}
</style>

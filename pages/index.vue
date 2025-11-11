<template>
  <div class="pb-8">
    <div class="relative left-1/2 right-1/2 -mx-[50vw] w-screen overflow-hidden">
      <section class="hero-simple px-24 bg-secondary relative">
        <div class="hero-simple__content">
          <p class="hero-simple__eyebrow text-black">{{ hero.highlight }}</p>
          <h1 class="text-white">{{ hero.title }}</h1>
          <p class="hero-simple__description text-gray-700">{{ hero.description }}</p>
        </div>
          <img class="absolute right-0 w-[50%]" :src="hero.image" :alt="hero.imageAlt" />
      </section>
    </div>
    <section id="catalogo" class="-mt-[3rem] px-2 sm:px-4 md:px-8 relative z-50">
      <Categories @category-selected="onCategorySelected" @search-change="onSearch" />
      <Catalog :products="visibleProducts" />
    </section>
  </div>
</template>

<script>
import Categories from "~/components/catalog/Categories.vue";
import Catalog from "~/components/home/Catalog.vue";
import { mapState, mapActions } from 'vuex';
import carro from '@/assets/images/banner/KEVIAJEILUSTRATION.svg';

export default {
  components: {
    Catalog,
    Categories,
  },
  computed: {
    ...mapState(['filteredProducts']),
    visibleProducts() {
      const term = this.searchTerm.trim().toLowerCase();
      if (!term) {
        return this.filteredProducts;
      }
      return this.filteredProducts.filter((product = {}) => {
        const name = String(product.name || '').toLowerCase();
        return name.includes(term);
      });
    }
  },
  data() {
    return {
      hero: {
        title: 'KE VIAJE DE ROPA!',
        highlight: 'Envíos a todo el país',
        description: 'Aprovecha nuestras promos de esta semana y recibe tus prendas pagando contra entrega. Fácil, rápido y seguro.',
        image: carro,
        imageAlt: 'Producto destacado',
        background: '#f7f1ee'
      },
      searchTerm: ''
    };
  },
  created() {
    this.fetchProducts();
    this.fetchCategories();
  },
  methods: {
    ...mapActions(['fetchProducts', 'filterProducts', 'fetchCategories']),

    // Método para manejar la selección de la categoría
    onCategorySelected(category) {
      if (!category) {
        this.fetchProducts();
      } else {
        this.filterProducts(category);
      }
    },
    onSearch(term = '') {
      this.searchTerm = term;
    }
  },
};
</script>

<style>
.hero-simple {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 2rem;
  width: 100%;
  min-height: 320px;
}

.hero-simple__content {
  flex: 1;
  max-width: 560px;
}

.hero-simple__content h1 {
  font-size: clamp(2.25rem, 4vw, 3.5rem);
  font-weight: 800;
  margin-bottom: 1rem;
}

.hero-simple__eyebrow {
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.12em;
  margin-bottom: 0.75rem;
}

.hero-simple__description {
  font-size: 1.05rem;
  max-width: 46ch;
}

.hero-simple__media {
  flex: 1;
  display: flex;
  justify-content: flex-end;
}

.hero-simple__media img {
  max-width: min(420px, 45vw);
  width: 100%;
  height: auto;
}

@media (max-width: 900px) {
  .hero-simple {
    flex-direction: column;
    text-align: center;
  }

  .hero-simple__content,
  .hero-simple__media {
    width: 100%;
    justify-content: center;
  }

  .hero-simple__media img {
    max-width: min(320px, 70vw);
  }
}
</style>

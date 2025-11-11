<template>
  <div class="dropdown-select" ref="wrapper">
    <label v-if="label" class="dropdown-select__label">{{ label }}</label>
    <button type="button" class="dropdown-select__trigger" @click="toggle" :aria-expanded="isOpen" :aria-haspopup="true">
      <span>{{ selectedLabel }}</span>
      <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M6 8l4 4 4-4" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </button>
    <transition name="dropdown-fade">
      <ul v-if="isOpen" class="dropdown-select__list">
        <li v-for="option in normalizedOptions" :key="option.value" @click="select(option.value)" :class="['dropdown-select__item', { 'is-active': option.value === value }]">
          {{ option.label }}
        </li>
      </ul>
    </transition>
  </div>
</template>

<script>
export default {
  name: 'DropdownSelect',
  props: {
    value: {
      type: [String, Number, null],
      default: '',
    },
    options: {
      type: Array,
      default: () => [],
    },
    placeholder: {
      type: String,
      default: 'Selecciona',
    },
    label: {
      type: String,
      default: '',
    },
  },
  data() {
    return {
      isOpen: false,
    };
  },
  computed: {
    normalizedOptions() {
      return this.options.map((option) =>
        typeof option === 'string'
          ? { label: option, value: option }
          : { label: option.label, value: option.value }
      );
    },
    selectedLabel() {
      const current = this.normalizedOptions.find((option) => option.value === this.value);
      return current ? current.label : this.placeholder;
    },
  },
  mounted() {
    document.addEventListener('click', this.handleOutside);
  },
  beforeDestroy() {
    document.removeEventListener('click', this.handleOutside);
  },
  methods: {
    toggle() {
      this.isOpen = !this.isOpen;
    },
    select(value) {
      this.$emit('input', value);
      this.$emit('change', value);
      this.isOpen = false;
    },
    handleOutside(event) {
      if (this.$refs.wrapper && !this.$refs.wrapper.contains(event.target)) {
        this.isOpen = false;
      }
    },
  },
};
</script>

<style scoped>
.dropdown-select {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}

.dropdown-select__label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #6b7280;
}

.dropdown-select__trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
  width: 100%;
  border: 1px solid #e5e7eb;
  border-radius: 0.9rem;
  padding: 0.75rem 1rem;
  background: #f9fafb;
  font-size: 0.95rem;
  color: #111827;
}

.dropdown-select__trigger svg {
  width: 1rem;
  height: 1rem;
}

.dropdown-select__list {
  position: absolute;
  top: calc(100% + 0.4rem);
  left: 0;
  width: 100%;
  background: #fff;
  border-radius: 0.9rem;
  box-shadow: 0 15px 35px rgba(15, 23, 42, 0.18);
  padding: 0.5rem;
  z-index: 10;
}

.dropdown-select__item {
  padding: 0.6rem 0.75rem;
  border-radius: 0.65rem;
  cursor: pointer;
  color: #111827;
}

.dropdown-select__item:hover {
  background: #f3f4f6;
}

.dropdown-select__item.is-active {
  background: #111827;
  color: #fff;
}

.dropdown-fade-enter-active,
.dropdown-fade-leave-active {
  transition: opacity 0.15s ease, transform 0.2s ease;
}

.dropdown-fade-enter,
.dropdown-fade-leave-to {
  opacity: 0;
  transform: translateY(-4px);
}
</style>

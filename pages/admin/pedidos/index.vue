<template>
  <div class="space-y-6">
    <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pedidos</h1>
        <p class="text-sm text-gray-500">Controla el estado de cada pedido y su método de pago.</p>
      </div>
      <div class="flex items-center gap-2">
        <button
          @click="refreshOrders"
          class="inline-flex items-center gap-2 rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 shadow-sm transition hover:bg-gray-100"
          :disabled="loading"
        >
          <svg class="h-4 w-4" fill="none" stroke="currentColor" stroke-width="1.5" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-.001M20.016 4.356A9.716 9.716 0 0012 2.25c-5.385 0-9.75 4.365-9.75 9.75 0 2.296.784 4.414 2.095 6.09m0 0H2.25m2.095 0A9.716 9.716 0 0012 21.75c5.385 0 9.75-4.365 9.75-9.75 0-2.296-.784-4.414-2.095-6.09" />
          </svg>
          {{ loading ? 'Actualizando...' : 'Actualizar' }}
        </button>
      </div>
    </div>

    <div class="grid gap-3 md:grid-cols-4">
      <div class="md:col-span-2">
        <input
          v-model.trim="searchTerm"
          type="search"
          placeholder="Buscar por referencia o cliente"
          class="w-full rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm text-gray-700 shadow-sm placeholder-gray-400 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </div>
      <div class="flex gap-2">
        <select
          v-model="paymentFilter"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          <option value="all">Todos los métodos</option>
          <option value="Wompi">Pagos Wompi</option>
          <option value="ContraEntrega">Contra entrega</option>
        </select>
        <select
          v-model="statusFilter"
          class="w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
        >
          <option value="all">Todos los estados</option>
          <option v-for="estado in estadosDisponibles" :key="estado" :value="estado">
            {{ capitalizar(estado) }}
          </option>
        </select>
      </div>
    </div>

    <div class="overflow-hidden rounded-lg border border-gray-100 shadow-sm">
      <table class="w-full text-sm text-left text-gray-600">
        <thead class="bg-secondary text-xs font-semibold uppercase text-white">
          <tr>
            <th class="px-6 py-3">Referencia</th>
            <th class="px-6 py-3">Cliente</th>
            <th class="px-6 py-3">Método</th>
            <th class="px-6 py-3">Total</th>
            <th class="px-6 py-3 text-center">Estado</th>
            <th class="px-6 py-3">Fecha</th>
            <th class="px-6 py-3 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="!displayOrders.length">
            <td colspan="7" class="px-6 py-10 text-center text-sm text-gray-500">
              No se encontraron pedidos con los filtros seleccionados.
            </td>
          </tr>
          <tr
            v-for="pedido in displayOrders"
            :key="pedido.id"
            class="border-b border-gray-100 bg-white transition hover:bg-gray-50"
          >
            <td class="px-6 py-3 font-semibold text-gray-900">
              {{ pedido.referencia || pedido.id }}
            </td>
            <td class="px-6 py-3">
              <div class="flex flex-col">
                <span class="font-medium text-gray-800">{{ pedido.nombres }} {{ pedido.apellidos }}</span>
                <span class="text-xs text-gray-400">{{ pedido.telefono }}</span>
              </div>
            </td>
            <td class="px-6 py-3">
              <span
                :class="pedido.metodoPago === 'Wompi' ? 'bg-emerald-100 text-emerald-700' : 'bg-sky-100 text-sky-700'"
                class="inline-flex items-center rounded-full px-3 py-1 text-xs font-medium"
              >
                {{ pedido.metodoPago === 'Wompi' ? 'Pago en línea' : 'Contra entrega' }}
              </span>
            </td>
            <td class="px-6 py-3 font-semibold text-gray-900">
              {{ formatPrice(pedido.total || 0) }}
            </td>
            <td class="px-6 py-3 text-center">
              <select
                :disabled="updatingId === pedido.id"
                class="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium uppercase tracking-wide focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
                :value="pedido.estado"
                @change="onChangeEstado(pedido, $event.target.value)"
              >
                <option v-for="estado in estadosDisponibles" :key="estado" :value="estado">
                  {{ capitalizar(estado) }}
                </option>
              </select>
            </td>
            <td class="px-6 py-3 text-gray-500">
              {{ formatFecha(pedido.fecha) }}
            </td>
            <td class="px-6 py-3 text-right">
              <div class="flex justify-end gap-3">
                <nuxt-link
                  :to="`/admin/pedidos/${pedido.id}`"
                  class="inline-flex items-center gap-1 rounded-full bg-white px-3 py-1 text-xs font-semibold text-secondary shadow hover:bg-gray-100 transition"
                >
                  Ver detalle
                </nuxt-link>
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
import { formatPrice } from '@/utils/formatPrice';

const ESTADOS = ['pendiente', 'enviado', 'entregado', 'cancelado'];

export default {
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      searchTerm: '',
      paymentFilter: 'all',
      statusFilter: 'all',
      loading: false,
      updatingId: null,
    };
  },
  computed: {
    ...mapState(['orders']),
    displayOrders() {
      const term = this.searchTerm.trim().toLowerCase();
      return (this.orders || []).filter((pedido) => {
        const matchesSearch =
          !term ||
          (pedido.referencia || '').toLowerCase().includes(term) ||
          `${pedido.nombres || ''} ${pedido.apellidos || ''}`.toLowerCase().includes(term);
        const matchesPayment =
          this.paymentFilter === 'all' || pedido.metodoPago === this.paymentFilter;
        const matchesStatus =
          this.statusFilter === 'all' || pedido.estado === this.statusFilter;
        return matchesSearch && matchesPayment && matchesStatus;
      });
    },
    estadosDisponibles() {
      return ESTADOS;
    },
  },
  created() {
    this.refreshOrders();
  },
  methods: {
    ...mapActions(['fetchOrders', 'actualizarEstadoPedido']),
    formatPrice,
    capitalizar(texto) {
      if (!texto) return '';
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    },
    formatFecha(timestamp) {
      if (!timestamp) return '—';
      const fecha = typeof timestamp === 'number' ? new Date(timestamp) : timestamp.toDate?.() || new Date();
      return fecha.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    async refreshOrders() {
      try {
        this.loading = true;
        await this.fetchOrders();
      } finally {
        this.loading = false;
      }
    },
    async onChangeEstado(pedido, estado) {
      if (pedido.estado === estado) return;
      this.updatingId = pedido.id;
      try {
        await this.actualizarEstadoPedido({ id: pedido.id, estado });
        await this.refreshOrders();
      } catch (error) {
        console.error('No se pudo actualizar el pedido:', error);
        alert('No se pudo actualizar el estado del pedido.');
      } finally {
        this.updatingId = null;
      }
    },
  },
};
</script>

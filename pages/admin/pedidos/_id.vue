<template>
  <div class="space-y-6" v-if="pedido">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Pedido #{{ pedido.referencia || pedido.id }}</h1>
        <p class="text-sm text-gray-500">
          Creado el {{ formatFecha(pedido.fecha) }} •
          <span class="font-semibold">{{ pedido.metodoPago === 'Wompi' ? 'Pago en línea' : 'Contra entrega' }}</span>
        </p>
      </div>
      <nuxt-link
        to="/admin/pedidos"
        class="inline-flex items-center rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-700 shadow hover:bg-gray-100 transition"
      >
        ← Volver a pedidos
      </nuxt-link>
    </div>

    <div class="grid gap-4 md:grid-cols-3">
      <section class="md:col-span-2 space-y-4">
        <article class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3">
          <h2 class="text-sm font-semibold text-gray-900 uppercase">Datos del cliente</h2>
          <div class="grid gap-3 md:grid-cols-2 text-sm text-gray-600">
            <div>
              <p class="font-medium text-gray-800">Nombre completo</p>
              <p>{{ pedido.nombres }} {{ pedido.apellidos }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-800">Teléfono</p>
              <p>{{ pedido.telefono }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-800">Correo</p>
              <p>{{ pedido.email || '—' }}</p>
            </div>
            <div>
              <p class="font-medium text-gray-800">Dirección</p>
              <p>{{ pedido.direccion }}, {{ pedido.ciudad }} - {{ pedido.departamento }}</p>
            </div>
          </div>
        </article>

        <article class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div class="flex items-center justify-between">
            <h2 class="text-sm font-semibold text-gray-900 uppercase">Productos</h2>
            <span class="text-xs font-medium text-gray-500">
              {{ pedido.productos?.length || 0 }} ítems
            </span>
          </div>
          <div class="space-y-3">
            <div
              v-for="producto in pedido.productos"
              :key="producto.uid || `${producto.id}-${producto.name}`"
              class="flex items-start justify-between rounded-md border border-gray-100 bg-gray-50 p-3"
            >
              <div class="flex flex-col text-sm">
                <span class="font-semibold text-gray-900">{{ producto.name || producto.nombre }}</span>
                <span class="text-xs text-gray-500">
                  Cantidad: {{ producto.qty }} • {{ producto.category || 'Sin categoría' }}
                </span>
                <span v-if="producto.color" class="text-xs text-gray-500">Color: {{ producto.color }}</span>
              </div>
              <div class="text-sm font-semibold text-gray-800">
                {{ formatPrice(Number(producto.price) * Number(producto.qty || 1)) }}
              </div>
            </div>
          </div>
        </article>
      </section>

      <aside class="space-y-4">
        <article class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-4">
          <div>
            <h2 class="text-sm font-semibold text-gray-900 uppercase">Estado del pedido</h2>
            <p class="text-xs text-gray-500">Actualiza el estado para mantener informado al cliente.</p>
          </div>
          <div class="space-y-3">
            <select
              v-model="estadoSeleccionado"
              class="w-full rounded-md border border-gray-200 px-3 py-2 text-sm text-gray-700 focus:border-secondary focus:outline-none focus:ring-2 focus:ring-secondary/20"
            >
              <option v-for="estado in estadosDisponibles" :key="estado" :value="estado">
                {{ capitalizar(estado) }}
              </option>
            </select>
            <button
              @click="guardarEstado"
              class="w-full rounded-md bg-secondary px-4 py-2 text-sm font-semibold text-white transition hover:bg-secondary/90 disabled:cursor-not-allowed disabled:opacity-60"
              :disabled="guardando || pedido.estado === estadoSeleccionado"
            >
              {{ guardando ? 'Guardando...' : 'Guardar estado' }}
            </button>
            <p v-if="mensaje" :class="mensajeTipo === 'error' ? 'text-red-500' : 'text-emerald-600'" class="text-sm">
              {{ mensaje }}
            </p>
          </div>
        </article>

        <article class="rounded-lg border border-gray-100 bg-white p-4 shadow-sm space-y-3 text-sm text-gray-600">
          <h2 class="text-sm font-semibold text-gray-900 uppercase">Resumen</h2>
          <div class="flex justify-between">
            <span>Subtotal</span>
            <span>{{ formatPrice(pedido.subtotal || 0) }}</span>
          </div>
          <div class="flex justify-between">
            <span>Descuento</span>
            <span>- {{ formatPrice(pedido.descuento || 0) }}</span>
          </div>
          <div class="flex justify-between text-base font-semibold text-gray-900">
            <span>Total</span>
            <span>{{ formatPrice(pedido.total || 0) }}</span>
          </div>
          <div class="flex justify-between text-xs text-gray-500">
            <span>Última actualización</span>
            <span>{{ formatFecha(pedido.updatedAt) }}</span>
          </div>
        </article>
      </aside>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex';
import { formatPrice } from '@/utils/formatPrice';

const ESTADOS = ['pendiente', 'enviado', 'entregado', 'cancelado'];

export default {
  middleware: 'auth',
  layout: 'admin',
  data() {
    return {
      pedido: null,
      estadoSeleccionado: 'pendiente',
      guardando: false,
      mensaje: '',
      mensajeTipo: 'success',
    };
  },
  computed: {
    estadosDisponibles() {
      return ESTADOS;
    },
  },
  async created() {
    await this.cargarPedido();
  },
  methods: {
    ...mapActions(['actualizarEstadoPedido']),
    formatPrice,
    capitalizar(texto) {
      if (!texto) return '';
      return texto.charAt(0).toUpperCase() + texto.slice(1);
    },
    formatFecha(timestamp) {
      if (!timestamp) return '—';
      const fecha = typeof timestamp === 'number' ? new Date(timestamp) : timestamp?.toDate?.() || new Date();
      return fecha.toLocaleString('es-CO', {
        dateStyle: 'medium',
        timeStyle: 'short',
      });
    },
    async cargarPedido() {
      try {
        const id = this.$route.params.id;
        const response = await fetch(`/.netlify/functions/get-order?orderId=${encodeURIComponent(id)}`);
        if (!response.ok) {
          throw new Error('No se pudo cargar el pedido');
        }
        const data = await response.json();
        this.pedido = data.order;
        this.pedido.id = data.id;
        this.estadoSeleccionado = this.pedido.estado || 'pendiente';
      } catch (error) {
        console.error('Error al cargar el pedido:', error);
        this.mensaje = 'No se pudo cargar el pedido.';
        this.mensajeTipo = 'error';
      }
    },
    async guardarEstado() {
      if (!this.pedido) return;
      if (this.estadoSeleccionado === this.pedido.estado) {
        this.mensaje = 'El pedido ya está en ese estado.';
        this.mensajeTipo = 'success';
        return;
      }
      this.guardando = true;
      this.mensaje = '';
      try {
        await this.actualizarEstadoPedido({
          id: this.pedido.id,
          estado: this.estadoSeleccionado,
        });
        this.pedido.estado = this.estadoSeleccionado;
        this.mensaje = 'Estado actualizado correctamente.';
        this.mensajeTipo = 'success';
      } catch (error) {
        console.error('Error al actualizar el estado del pedido:', error);
        this.mensaje = 'No se pudo actualizar el estado del pedido.';
        this.mensajeTipo = 'error';
      } finally {
        this.guardando = false;
      }
    },
  },
};
</script>

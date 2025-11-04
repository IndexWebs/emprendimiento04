<template>
    <div class="checkout-container flex-col md:grid grid-cols-1 lg:grid-cols-12 gap-6 p-4 max-w-5xl mx-auto space-y-3 md:space-y-0">
        <!-- Formulario de pago -->
        <div class="payment-form bg-white rounded-2xl shadow p-6 col-span-8">
            <h2 class="text-xl font-semibold mb-4">Datos de envío</h2>
            
            <!-- Mensajes de error -->
            <div v-if="errores.length" class="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <ul class="text-red-600 text-sm">
                    <li v-for="error in errores" :key="error" class="mb-1">{{ error }}</li>
                </ul>
            </div>

            <section class="space-y-4">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input 
                            v-model="form.nombres" 
                            type="text" 
                            placeholder="Nombres" 
                            class="input" 
                            :class="{ 'border-red-500': errores.includes('El nombre es requerido') }"
                            required 
                        />
                    </div>
                    <div>
                        <input 
                            v-model="form.apellidos" 
                            type="text" 
                            placeholder="Apellidos" 
                            class="input"
                            :class="{ 'border-red-500': errores.includes('Los apellidos son requeridos') }"
                            required 
                        />
                    </div>
                </div>

                <div>
                    <input 
                        v-model="form.telefono" 
                        type="tel" 
                        placeholder="Número de WhatsApp (ej: 3001234567)" 
                        class="input"
                        :class="{ 'border-red-500': errores.includes('Teléfono inválido') }"
                        required 
                    />
                </div>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <input 
                            v-model="form.departamento" 
                            type="text" 
                            placeholder="Departamento" 
                            class="input"
                            :class="{ 'border-red-500': errores.includes('El departamento es requerido') }"
                            required 
                        />
                    </div>
                    <div>
                        <input 
                            v-model="form.ciudad" 
                            type="text" 
                            placeholder="Ciudad" 
                            class="input"
                            :class="{ 'border-red-500': errores.includes('La ciudad es requerida') }"
                            required 
                        />
                    </div>
                </div>
                <div>
                    <input 
                        v-model="form.direccion" 
                        type="text" 
                        placeholder="Direccion" 
                        class="input"
                        :class="{ 'border-red-500': errores.includes('La dirección es requerida') }"
                        required 
                    />
                </div>

                <div class="mt-6">
                    <!-- Métodos de pago -->
                    <img src="@/assets/images//metodos/visa.svg" class="inline mr-2 w-5" alt="Visa">
                    <img src="@/assets/images/metodos/master.svg" class="inline mr-2 w-5" alt="Mastercard">
                    <img src="@/assets/images/metodos/american.svg" class="inline mr-2 w-5" alt="American Express">
                    <img src="@/assets/images/metodos/bancolombia.svg" class="inline mr-2 w-5" alt="Bancolombia">
                    <img src="@/assets/images/metodos/nequi.png" class="inline mr-2 w-5" alt="Nequi">
                    <img src="@/assets/images/metodos/pse.png" class="inline mr-2 w-5" alt="PSE">
                    <img src="@/assets/images/metodos/efectivo.svg" class="inline w-5" alt="Efectivo">
                    <img src="@/assets/images/metodos/credito.svg" class="inline w-5" alt="Credito">
                </div>

                <Checkout 
                    :monto="montoFormateado" 
                    :referencia="referencia" 
                    @pago-aceptado="onPagoAceptadoWompi" 
                />
                <PrimaryButton 
                    class="w-full" 
                    @click="procesarPago('Contra entrega')" 
                    text="Pago contra entrega"
                    :disabled="cargando || enviando"
                />
            </section>
        </div>

        <!-- Resumen del pedido -->
        <div class="order-summary bg-white rounded-2xl shadow p-6 col-span-4">
            <h2 class="text-xl font-semibold mb-4">Resumen del pedido</h2>
            <div class="flow-root">
                <ul role="list" class="-my-6 divide-y divide-gray-200">
                    <li v-for="item in items" :key="item.uid" class="flex py-6">
                        <div class="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border border-gray-200">
                            <img :src="item.image" alt="Imagen del producto"
                                class="h-full w-full object-cover object-center" />
                        </div>

                        <div class="ml-4 flex flex-1 flex-col">
                            <div>
                                <h4 class="max-w-xs mb-1">
                                    <a href="#">{{ item.name }}</a>
                                </h4>
                                <h4 class="max-w-lg text-xs mb-3"><span class="font-bold">COP</span> {{ item.price }}
                                </h4>
                                <p class="text-sm text-gray-500">{{ item.category }}</p>
                                <p class="text-sm text-gray-500">{{ item.color }}</p>
                            </div>
                            <div class="flex items-center justify-between text-sm">
                                <p class="text-gray-500">Cantidad: {{ item.qty }}</p>
                            </div>
                        </div>
                    </li>
                </ul>
            </div>
            <div class="border-t pt-4 mt-4 space-y-2 text-xs">
                <div class="flex justify-between">
                    <span>Subtotal</span>
                    <span>${{ subtotalFormateado }}</span>
                </div>
                <div v-if="descuento && descuento > 0" class="flex justify-between">
                    <span>Descuento</span>
                    <span>-{{ descuentoFormateado }}</span>
                </div>
                <div class="flex justify-between">
                    <span>Envío</span>
                    <span>GRATIS</span>
                </div>
                <div class="flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>${{ totalFormateado }}</span>
                </div>
            </div>
        </div>

        <!-- Overlay de carga -->
        <div v-if="cargando" class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-6 rounded-lg shadow-xl text-center">
                <div class="spinner mb-4"></div>
                <p class="text-gray-700">Procesando tu pago...</p>
            </div>
        </div>
    </div>
</template>

<script>
import Checkout from '~/components/shared/Checkout.vue';
import PrimaryButton from '~/components/shared/PrimaryButton.vue';
import { formatPrice } from '@/utils/formatPrice';

export default {
    name: "CheckoutLayout",
    components: { Checkout, PrimaryButton },
    data() {
        return {
            referencia: `pedido-${new Date().toISOString().replace(/[:.]/g, '-')}`,
            form: {
                nombres: "",
                apellidos: "",
                telefono: "",
                departamento: "",
                ciudad: "",
                direccion: "",
            },
            errores: [],
            cargando: false,
            enviando: false,
        };
    },
    computed: {
        montoFormateado() {
            return Number(this.total) * 100;
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
            return formatPrice(this.subtotal);
        },
        totalFormateado() {
            return formatPrice(this.total);
        },
        descuentoFormateado() {
            return formatPrice(this.descuento);
        },
        items() {
            return this.$store.getters.cartItems;
        }
    },
    created() {
        // Recuperar datos guardados si existen
        const datosGuardados = localStorage.getItem('checkoutData');
        if (datosGuardados) {
            this.form = JSON.parse(datosGuardados);
        }
    },
    watch: {
        form: {
            handler(newValue) {
                // Guardar datos en localStorage
                localStorage.setItem('checkoutData', JSON.stringify(newValue));
            },
            deep: true
        }
    },
    methods: {
        validarFormulario() {
            this.errores = [];
            
            if (!this.form.nombres?.trim()) this.errores.push("El nombre es requerido");
            if (!this.form.apellidos?.trim()) this.errores.push("Los apellidos son requeridos");
            if (!this.validarTelefono(this.form.telefono)) this.errores.push("Teléfono inválido");
            if (!this.form.departamento?.trim()) this.errores.push("El departamento es requerido");
            if (!this.form.ciudad?.trim()) this.errores.push("La ciudad es requerida");
            if (!this.form.direccion?.trim()) this.errores.push("La dirección es requerida");

            return this.errores.length === 0;
        },

        validarTelefono(telefono) {
            return /^[0-9]{10}$/.test(telefono);
        },

        async procesarPago(metodoPago) {
            if (this.enviando) return;
            
            if (!this.validarFormulario()) {
                return;
            }

            // Guardar datos antes de iniciar cualquier pago
            localStorage.setItem('checkoutData', JSON.stringify(this.form));
            localStorage.setItem('carritoData', JSON.stringify(this.items.map(item => ({ ...item }))));

            this.enviando = true;
            this.cargando = true;

            try {
                const datosPedido = {
                    ...this.form,
                    referencia: this.referencia,
                };

                await this.$store.dispatch("crearPedidoContraEntrega", datosPedido);
                localStorage.removeItem('checkoutData');
                localStorage.removeItem('carritoData');
                this.$router.push("/thanks");
            } catch (error) {
                this.manejarError(error);
            } finally {
                this.cargando = false;
                this.enviando = false;
            }
        },

        async onPagoAceptadoWompi(eventoPago) {
            if (!this.validarFormulario()) {
                this.errores = ["Por favor completa todos los campos antes de pagar"];
                return;
            }
            // Guardar datos antes de crear el pedido
            localStorage.setItem('checkoutData', JSON.stringify(this.form));
            localStorage.setItem('carritoData', JSON.stringify(this.items.map(item => ({ ...item }))));
            this.enviando = true;
            this.cargando = true;
            try {
                const transaccion = eventoPago?.detail?.transaction;
                if (!transaccion?.id) {
                    throw new Error("No se recibió confirmación válida de Wompi");
                }
                const datosPedido = {
                    ...this.form,
                    transactionId: transaccion.id,
                    transaction: transaccion,
                    referencia: transaccion.reference || this.referencia,
                };
                await this.$store.dispatch("crearPedidoWompi", datosPedido);
                localStorage.removeItem('checkoutData');
                localStorage.removeItem('carritoData');
                this.$router.push("/thanks");
            } catch (error) {
                this.manejarError(error);
            } finally {
                this.cargando = false;
                this.enviando = false;
            }
        },

        manejarError(error) {
            console.error('Error en el proceso de pago:', error);
            
            let mensaje = "Ha ocurrido un error en el proceso de pago";
            
            if (error.response) {
                switch (error.response.status) {
                    case 400:
                        mensaje = "Datos de pago inválidos";
                        break;
                    case 401:
                        mensaje = "Sesión expirada, por favor inicia sesión nuevamente";
                        break;
                    case 500:
                        mensaje = "Error en el servidor, por favor intenta más tarde";
                        break;
                }
            }
            
            this.errores = [mensaje];
        }
    },
};
</script>

<style scoped>
.input {
    @apply w-full border border-gray-300 rounded-xl px-4 py-3 text-sm;
}

.spinner {
    @apply w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto;
}
</style>

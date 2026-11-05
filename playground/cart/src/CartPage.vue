<script setup lang="ts">
import { onMounted, ref, version } from 'vue'
import type { CartPageProps } from '@polka/contracts'
import { items, total, start, removeAt, clear } from './store.ts'

// navigate — контракт от Shell: «переведи пользователя по этому адресу».
// Корзина не знает, кто отрисует /catalog/…, она знает только формат адреса (это и есть контракт маршрутов).
const props = defineProps<CartPageProps>()
onMounted(start)

// Учебная поломка (урок 5): ошибка во время рендера Vue. React error boundary Shell её не увидит.
const crash = ref(false)
const boom = (): string => { throw new Error('Корзина: учебная ошибка рендера') }
</script>

<template>
  <section class="mf mf-cart page">
    <span class="mf-label">Страница корзины · Vue {{ version }}</span>
    <h2>Ваша корзина</h2>
    <p v-if="!items.length" class="muted">Пусто.</p>
    <ul v-else>
      <li v-for="(item, i) in items" :key="i">
        <a :href="`/catalog/book/${item.sku}`" @click.prevent="props.navigate(`/catalog/book/${item.sku}`)">{{ item.title }}</a>
        <span>{{ item.price }} ₽ <button @click="removeAt(i)">убрать</button></span>
      </li>
    </ul>
    <p><b>Итого: {{ total }} ₽</b> <button v-if="items.length" @click="clear">очистить</button></p>
    <a href="/catalog" @click.prevent="props.navigate('/catalog')">← Продолжить покупки</a>
    <p class="muted">Учебная поломка: <button class="danger" @click="crash = true">💥 ошибка рендера</button></p>
    <p v-if="crash">{{ boom() }}</p>
  </section>
</template>

<style scoped>
/* scoped: Vue добавит атрибут data-v-… и допишет его к селектору — правило не выйдет за пределы компонента. */
.danger { border-color: var(--bad); color: var(--bad); }
</style>

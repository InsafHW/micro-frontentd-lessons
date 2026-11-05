<script setup>
import { onMounted, version } from 'vue'
import { items, total, start, removeAt, clear } from './store.js'

// navigate — контракт от Shell: «переведи пользователя по этому адресу».
// Корзина не знает, кто отрисует /catalog/…, она знает только формат адреса (это и есть контракт маршрутов).
const props = defineProps({ navigate: { type: Function, required: true } })
onMounted(start)
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
  </section>
</template>

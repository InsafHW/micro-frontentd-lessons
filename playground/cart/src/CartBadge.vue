<script setup>
import { onMounted, version } from 'vue'
import { items, total, start } from './store.js'

const props = defineProps({ navigate: Function })
onMounted(start)
const go = () => props.navigate ? props.navigate('/cart') : window.location.assign('/cart')
</script>

<template>
  <div class="mf mf-cart">
    <span class="mf-label">Корзина · Vue {{ version }}</span>
    <a href="/cart" @click.prevent="go">
      Корзина: <b>{{ items.length }}</b> · {{ total }} ₽
    </a>
  </div>
</template>

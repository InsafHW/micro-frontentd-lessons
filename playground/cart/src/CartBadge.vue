<script setup lang="ts">
import { onMounted, version } from 'vue'
import type { CartBadgeProps } from '@polka/contracts'
import { items, total, start } from './store.ts'

const props = defineProps<CartBadgeProps>()
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

<script setup lang="ts">
const data = ref<Record<'titulos', string>[]>([{
  titulos: 'No se ha realizado la búsqueda'
}])
const open = async () => {
  data.value = await $fetch('/api/puppeteer');
  console.log(data.value)
}
</script>
 
<template>
  <div class="m-1">
    <u-button label="ESCRAPEAR TITULOS" @click="open" />
    <div>
      <u-table :data="data" />
    </div>
  </div>
</template>

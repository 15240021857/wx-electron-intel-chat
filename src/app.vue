<template>
  <div class="flex flex-dir-row w-full h-screen">
    <router-view />
  </div>
</template>

<script setup>
import { useProvider } from '@/db/hooks/useProvider'
import { bootstrapDBProviders } from '@/db/bootstrapDB'
import { onMounted } from 'vue'

const { providers } = useProvider()
const bootstrapDB = async () => {
  if (providers.value?.length === 0) {
    await bootstrapDBProviders()
  }
}
onMounted(() => {
  bootstrapDB()
})
</script>

<style lang="scss" scoped></style>

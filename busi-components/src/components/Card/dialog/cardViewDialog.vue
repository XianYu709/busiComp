<template>
  <el-dialog draggable overflow >
<!--    <img :src="props.capturedImage" alt="截图预览">-->
    <el-image

        style="width: 950px; height: 1400px"
        :src="props.capturedImage"
        :preview-src-list="[props.capturedImage]"
    />
  </el-dialog>
</template>

<script setup lang="ts">
  import { ref } from 'vue'

  const props = defineProps({
    capturedImage:{
      type:String
    }
  })
  //const imgUrl = ref(props.capturedImage);

  console.log(props.capturedImage);



</script>

<style scoped lang="scss">

</style>
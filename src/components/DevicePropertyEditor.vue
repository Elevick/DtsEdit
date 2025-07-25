<template>
  <el-card class="property-editor" shadow="never">
    <div class="property-title">属性编辑器</div>
    <el-divider />
    <div v-if="!node">请选择画布上的器件</div>
    <el-form v-else label-width="60px" @input="emitUpdate">
      <el-form-item label="名称">
        <el-input v-model="editNode.label" @input="emitUpdate" />
      </el-form-item>
      <!-- 可扩展更多属性 -->
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch, toRefs } from 'vue'
import { ElCard, ElDivider, ElForm, ElFormItem, ElInput } from 'element-plus'
const props = defineProps<{ node: any }>()
const emit = defineEmits(['update'])
const editNode = ref({ ...props.node })
watch(() => props.node, (val) => {
  editNode.value = { ...val }
})
function emitUpdate() {
  emit('update', { ...editNode.value })
}
</script>

<style scoped>
.property-editor {
  margin-top: 16px;
  padding: 12px 8px 8px 8px;
  font-size: 15px;
}
.property-title {
  font-weight: bold;
  font-size: 16px;
  margin-bottom: 4px;
}
</style> 
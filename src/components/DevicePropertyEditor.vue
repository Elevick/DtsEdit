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
  margin: 0;
  padding: 8px;
  font-size: 14px;
  flex-shrink: 0;
  height: 50%;
  min-height: 200px;
  max-height: 400px;
  overflow-y: auto;
}
.property-title {
  font-weight: bold;
  font-size: 14px;
  margin-bottom: 4px;
  color: #2c3e50;
}
.property-editor :deep(.el-form-item) {
  margin-bottom: 8px;
}
.property-editor :deep(.el-form-item__label) {
  font-size: 12px;
  color: #666;
}
.property-editor :deep(.el-input__inner) {
  font-size: 12px;
  height: 28px;
}
</style> 
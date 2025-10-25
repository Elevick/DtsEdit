<template>
  <el-card class="property-editor" shadow="never">
    <div class="property-title">属性编辑器</div>
    <el-divider />
    <div v-if="!node" class="empty-hint">请选择画布上的器件</div>
    <el-form v-else label-width="100px" size="small" @input="emitUpdate">
      <el-form-item label="名称">
        <el-input v-model="editNode.label" @input="emitUpdate" placeholder="节点名称" />
      </el-form-item>
      
 
      
      <el-form-item label="compatible">
        <el-input 
          v-model="editNode.compatible" 
          @input="emitUpdate" 
          placeholder="vendor,device-name"
        />
      </el-form-item>
      
      <el-form-item label="#address-cells">
        <el-input-number 
          v-model="editNode['address-cells']" 
          @input="emitUpdate"
          :min="0"
          :max="2"
          controls-position="right"
        />
      </el-form-item>
      
      <el-form-item label="#size-cells">
        <el-input-number 
          v-model="editNode['size-cells']" 
          @input="emitUpdate"
          :min="0"
          :max="2"
          controls-position="right"
        />
      </el-form-item>
      
      <el-form-item label="reg">
        <el-input 
          v-model="editNode.reg" 
          @input="emitUpdate"
          placeholder="0x0 或 0x10000000 0x1000"
        />
      </el-form-item>
      
      <el-form-item label="描述">
        <el-input 
          v-model="editNode.description" 
          @input="emitUpdate"
          type="textarea"
          :rows="2"
          placeholder="设备描述信息"
        />
      </el-form-item>
    </el-form>
  </el-card>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { ElCard, ElDivider, ElForm, ElFormItem, ElInput, ElInputNumber } from 'element-plus'

const props = defineProps<{ node: any }>()
const emit = defineEmits(['update'])
const editNode = ref({ 
  label: '',
  compatible: '',
  'address-cells': 1,
  'size-cells': 0,
  reg: '',
  description: '',
  ...props.node 
})

watch(() => props.node, (val) => {
  if (val) {
    editNode.value = { 
      label: '',
      compatible: '',
      'address-cells': 1,
      'size-cells': 0,
      reg: '',
      description: '',
      ...val 
    }
  }
}, { deep: true })

function emitUpdate() {
  emit('update', { ...editNode.value })
}
</script>

<style scoped>
.property-editor {
  margin: 0;
  padding: 12px;
  font-size: 14px;
  flex-shrink: 0;
  height: 50%;
  min-height: 200px;
  max-height: 50%;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.property-title {
  font-weight: 600;
  font-size: 14px;
  margin-bottom: 4px;
  color: #2c3e50;
  text-align: center;
}

.empty-hint {
  color: #909399;
  font-size: 13px;
  text-align: center;
  padding: 20px 0;
}

.divider-text {
  font-size: 12px;
  font-weight: 500;
  color: #909399;
}

.property-editor :deep(.el-divider) {
  margin: 12px 0;
}

.property-editor :deep(.el-divider__text) {
  padding: 0 8px;
  background-color: #f7f7f7;
}

.property-editor :deep(.el-form) {
  flex: 1;
  overflow-y: auto;
}

.property-editor :deep(.el-form-item) {
  margin-bottom: 12px;
}

.property-editor :deep(.el-form-item__label) {
  font-size: 12px;
  color: #606266;
  font-weight: 500;
  line-height: 28px;
}

.property-editor :deep(.el-input__inner) {
  font-size: 12px;
}

.property-editor :deep(.el-textarea__inner) {
  font-size: 12px;
  font-family: 'Monaco', 'Menlo', 'Consolas', monospace;
}

.property-editor :deep(.el-input-number) {
  width: 100%;
}

.property-editor :deep(.el-input-number .el-input__inner) {
  text-align: left;
}

/* 滚动条样式 */
.property-editor::-webkit-scrollbar {
  width: 6px;
}

.property-editor::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.property-editor::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.property-editor::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style> 
<template>
  <el-card class="palette-list" shadow="never">
    <div class="palette-title">设备树元件库</div>
    <el-divider />
    <el-space direction="vertical" fill>
      <el-card
        v-for="item in items"
        :key="item.type"
        class="palette-item"
        shadow="hover"
        body-style="padding: 8px 12px; display: flex; align-items: center;"
        draggable="true"
        @dragstart="onDragStart(item, $event)"
      >
        <span>{{ item.label }}</span>
      </el-card>
    </el-space>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard, ElDivider, ElSpace } from 'element-plus'
const items = [
  { type: 'node', label: '节点' },
  { type: 'property', label: '属性' },
  { type: 'interrupt', label: '中断' },
  { type: 'reg', label: '寄存器' },
]
function onDragStart(item: { type: string; label: string }, e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/x-dts-item', JSON.stringify(item))
    // 创建自定义拖拽预览
    const dragPreview = document.createElement('div')
    dragPreview.style.position = 'absolute'
    dragPreview.style.pointerEvents = 'none'
    dragPreview.style.zIndex = '9999'
    dragPreview.style.minWidth = '80px'
    dragPreview.style.minHeight = '40px'
    dragPreview.style.background = '#fff'
    dragPreview.style.border = '1.5px solid #409eff'
    dragPreview.style.borderRadius = '8px'
    dragPreview.style.boxShadow = '0 2px 8px rgba(64,158,255,0.08)'
    dragPreview.style.color = '#222'
    dragPreview.style.display = 'flex'
    dragPreview.style.alignItems = 'center'
    dragPreview.style.justifyContent = 'center'
    dragPreview.style.fontSize = '16px'
    dragPreview.style.opacity = '0.7'
    dragPreview.textContent = item.label
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 40, 20)
    // 拖拽结束后移除
    setTimeout(() => document.body.removeChild(dragPreview), 0)
  }
}
</script>

<style scoped>
.palette-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 0;
}
.palette-title {
  font-weight: bold;
  margin-bottom: 0;
  font-size: 16px;
  padding: 8px 0 0 0;
}
.palette-item {
  cursor: grab;
  user-select: none;
  font-size: 15px;
  transition: box-shadow 0.2s;
  margin-bottom: 0;
}
.palette-item:hover {
  box-shadow: 0 2px 12px #b3d8fd;
}
</style>
<template>
  <el-card class="canvas-area" shadow="never"
    @dragover.prevent
    @drop="onDrop"
  >
    <div v-if="nodes.length === 0" class="canvas-placeholder">将设备树元件拖拽到此处</div>
    <div v-for="(node, idx) in nodes" :key="node.id"
      class="canvas-node"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      @mousedown="onNodeMouseDown(idx, $event)"
      @click.stop="emitSelectNode(node)"
    >
      {{ node.label }}
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard } from 'element-plus'
import { ref, onMounted, onBeforeUnmount, defineEmits } from 'vue'

interface CanvasNode {
  id: number
  type: string
  label: string
  x: number
  y: number
}
const nodes = ref<CanvasNode[]>([])
let nodeId = 1

function onDrop(e: DragEvent) {
  if (e.dataTransfer) {
    const data = e.dataTransfer.getData('application/x-dts-item')
    if (data) {
      const item = JSON.parse(data)
      // 获取画布相对坐标
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      nodes.value.push({
        id: nodeId++,
        type: item.type,
        label: item.label,
        x: x - 40, // 居中偏移
        y: y - 20
      })
    }
  }
}

// 拖动逻辑
let draggingIdx: number | null = null
let offsetX = 0, offsetY = 0

function onNodeMouseDown(idx: number, e: MouseEvent) {
  draggingIdx = idx
  offsetX = e.offsetX
  offsetY = e.offsetY
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}
function onMouseMove(e: MouseEvent) {
  if (draggingIdx !== null) {
    const canvas = document.querySelector('.canvas-area') as HTMLElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - offsetX
    const y = e.clientY - rect.top - offsetY
    nodes.value[draggingIdx].x = Math.max(0, Math.min(x, rect.width - 80))
    nodes.value[draggingIdx].y = Math.max(0, Math.min(y, rect.height - 40))
  }
}
function onMouseUp() {
  draggingIdx = null
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}
onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
})

const emit = defineEmits(['selectNode'])
function emitSelectNode(node: any) {
  emit('selectNode', node)
}
</script>

<style scoped>
.canvas-area {
  width: 100%;
  height: 90%;
  min-height: 600px;
  background: #f9fafb;
  border: 2px dashed #b3d8fd;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}
.canvas-placeholder {
  color: #b3b3b3;
  font-size: 18px;
}
.canvas-node {
  position: absolute;
  min-width: 80px;
  min-height: 40px;
  background: #fff;
  border: 1.5px solid #409eff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(64,158,255,0.08);
  color: #222;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  user-select: none;
  font-size: 16px;
  z-index: 2;
  transition: box-shadow 0.2s;
}
.canvas-node:active {
  box-shadow: 0 4px 16px #b3d8fd;
}
</style>
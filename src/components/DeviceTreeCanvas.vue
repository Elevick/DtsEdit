<template>
  <el-card class="canvas-area" :class="{ 'canvas-grabbing': isDraggingCanvas }" shadow="never"
    @dragover.prevent
    @drop="onDrop"
    @mousedown.self="onCanvasMouseDown"
    @click.self="clearSelection"
  >
    
    <div v-if="nodes.length === 0" class="canvas-placeholder">
      <div class="placeholder-content">
        <el-icon size="48" color="#c0c4cc"><Collection /></el-icon>
        <p>将设备树元件拖拽到此处</p>
        <small>从左侧元件库选择元件并拖拽到画布上</small>
      </div>
    </div>
    
    <div v-for="(node, idx) in nodes" :key="node.id"
      class="canvas-node"
      :class="[
        `canvas-node-${node.category || 'default'}`,
        { 
          'node-selected': selectedNodeId === node.id, 
          'node-dragging': draggingIdx === idx,
          'node-created': node.isNew
        }
      ]"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      :data-node-id="node.id"
      @mousedown="onNodeMouseDown(idx, $event)"
      @click.stop="emitSelectNode(node)"
    >
      <!-- 节点背景装饰 -->
      <div class="node-bg-decoration"></div>
      
      <!-- 节点图标 -->
      <div class="node-icon">
        <el-icon :size="20" :color="getNodeColor(node)">
          <component :is="getNodeIcon(node)" />
        </el-icon>
      </div>
      
      <!-- 节点标签 -->
      <div class="node-label">
        <span class="label-text">{{ node.label }}</span>
        <span class="label-type" v-if="node.type">{{ getNodeTypeLabel(node.type) }}</span>
      </div>
      
      
      <!-- 节点状态指示器 -->
      <div class="node-status" v-if="node.status">
        <div class="status-indicator" :class="`status-${node.status}`">
          <div class="status-pulse"></div>
        </div>
      </div>
      
      <!-- 节点操作按钮 -->
      <div class="node-actions" v-if="selectedNodeId === node.id">
        <el-button size="small" circle @click.stop="deleteNode(node.id)">
          <el-icon><Delete /></el-icon>
        </el-button>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard, ElIcon, ElButton } from 'element-plus'
import { ref, computed, onMounted, onBeforeUnmount, watch } from 'vue'
import { 
  Cpu, 
  Connection, 
  DataLine, 
  Monitor,
  Setting,
  Link,
  Collection,
  Delete
} from '@element-plus/icons-vue'

interface CanvasNode {
  id: number
  type: string
  label: string
  category?: string
  icon?: any
  x: number
  y: number
  status?: 'active' | 'inactive' | 'error'
  isNew?: boolean
}


const nodes = ref<CanvasNode[]>([])
let nodeId = 1

const selectedNodeId = ref<number | null>(null)

// 清除选择
function clearSelection() {
  selectedNodeId.value = null
}

// 获取节点颜色
function getNodeColor(node: CanvasNode): string {
  const colorMap: Record<string, string> = {
    'soc': '#409eff',
    'cpu': '#67c23a',
    'i2c-bridge': '#e6a23c',
    'channel': '#f56c6c',
    'sensor': '#909399',
    'default': '#409eff'
  }
  return colorMap[node.category || 'default'] || '#409eff'
}

// 获取节点图标
function getNodeIcon(node: CanvasNode): any {
  const iconMap: Record<string, any> = {
    'soc': Cpu,
    'cpu': Setting,
    'i2c-bridge': Connection,
    'channel': DataLine,
    'sensor': Monitor,
    'default': Cpu
  }
  return iconMap[node.category || 'default'] || Cpu
}

// 获取节点类型标签
function getNodeTypeLabel(type: string): string {
  const typeMap: Record<string, string> = {
    'soc-main': '主控制器',
    'soc-cpu': 'CPU核心',
    'soc-memory': '内存控制器',
    'cpu-arm': 'ARM核心',
    'cpu-riscv': 'RISC-V核心',
    'i2c-controller': 'I2C控制器',
    'i2c-mux': 'I2C多路复用器',
    'i2c-channel': 'I2C通道',
    'spi-channel': 'SPI通道',
    'uart-channel': 'UART通道',
    'sensor-temp': '温度传感器',
    'sensor-humidity': '湿度传感器',
    'sensor-pressure': '压力传感器',
    'sensor-accelerometer': '加速度计'
  }
  return typeMap[type] || type
}

// 删除节点
function deleteNode(nodeId: number) {
  const index = nodes.value.findIndex(n => n.id === nodeId)
  if (index > -1) {
    nodes.value.splice(index, 1)
    selectedNodeId.value = null
  }
}



function onDrop(e: DragEvent) {
  if (e.dataTransfer) {
    const data = e.dataTransfer.getData('application/x-dts-item')
    if (data) {
      const item = JSON.parse(data)
      
      // 获取画布元素，确保获取正确的画布位置
      const canvas = document.querySelector('.canvas-area') as HTMLElement
      const rect = canvas.getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      console.log('Drop position:', { x, y, clientX: e.clientX, clientY: e.clientY, rectLeft: rect.left, rectTop: rect.top })
      
      const newNode: CanvasNode = {
        id: nodeId++,
        type: item.type,
        label: item.label,
        category: item.category,
        icon: item.icon,
        x: x - 70, // 节点宽度的一半 (140/2)
        y: y - 30, // 节点高度的一半 (60/2)
        status: 'active',
        isNew: true
      }
      
      console.log('New node position:', { x: newNode.x, y: newNode.y })
      
      nodes.value.push(newNode)
      
      // 添加创建动画
      setTimeout(() => {
        const nodeElement = document.querySelector(`[data-node-id="${newNode.id}"]`) as HTMLElement
        if (nodeElement) {
          nodeElement.classList.add('node-created')
        }
        // 移除新建标记
        newNode.isNew = false
      }, 10)
    }
  }
}

// 节点拖动逻辑
let draggingIdx: number | null = null
let isNodeDragging = false
let startMouseX = 0, startMouseY = 0
let startNodeX = 0, startNodeY = 0

function onNodeMouseDown(idx: number, e: MouseEvent) {
  e.stopPropagation() // 阻止事件冒泡到画布
  draggingIdx = idx
  selectedNodeId.value = nodes.value[idx].id
  
  // 记录开始拖拽时的鼠标位置和节点位置
  startMouseX = e.clientX
  startMouseY = e.clientY
  startNodeX = nodes.value[idx].x
  startNodeY = nodes.value[idx].y
  isNodeDragging = false
  
  window.addEventListener('mousemove', onMouseMove)
  window.addEventListener('mouseup', onMouseUp)
}

// 画布拖动逻辑
let isDraggingCanvas = false
let lastMouseX = 0
let lastMouseY = 0
let canvasOffsetX = 0
let canvasOffsetY = 0

function onCanvasMouseDown(e: MouseEvent) {
  // 只有在点击画布背景时才触发拖拽
  if (e.target === e.currentTarget) {
    isDraggingCanvas = true
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    window.addEventListener('mousemove', onCanvasMouseMove)
    window.addEventListener('mouseup', onCanvasMouseUp)
  }
}


function onMouseMove(e: MouseEvent) {
  if (draggingIdx !== null) {
    // 检查是否真的在拖拽（移动距离超过阈值）
    const deltaX = Math.abs(e.clientX - startMouseX)
    const deltaY = Math.abs(e.clientY - startMouseY)
    
    if (deltaX > 5 || deltaY > 5) {
      isNodeDragging = true
    }
    
    if (isNodeDragging) {
      // 计算鼠标移动的距离
      const mouseDeltaX = e.clientX - startMouseX
      const mouseDeltaY = e.clientY - startMouseY
      
      // 新位置 = 开始位置 + 鼠标移动距离
      const newX = startNodeX + mouseDeltaX
      const newY = startNodeY + mouseDeltaY
      
      // 应用边界限制
      const canvas = document.querySelector('.canvas-area') as HTMLElement
      const rect = canvas.getBoundingClientRect()
      const nodeWidth = 140
      const nodeHeight = 60
      
      // 允许节点部分超出画布，但不要完全消失
      const minX = -nodeWidth + 20
      const minY = -nodeHeight + 20
      const maxX = rect.width - 20
      const maxY = rect.height - 20
      
      nodes.value[draggingIdx].x = Math.max(minX, Math.min(newX, maxX))
      nodes.value[draggingIdx].y = Math.max(minY, Math.min(newY, maxY))
    }
  }
}

function onMouseUp() {
  if (draggingIdx !== null && !isNodeDragging) {
    // 如果没有拖拽，只是点击，则选择节点
    selectedNodeId.value = nodes.value[draggingIdx].id
  }
  
  draggingIdx = null
  isNodeDragging = false
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
}

function onCanvasMouseMove(e: MouseEvent) {
  if (isDraggingCanvas) {
    const deltaX = e.clientX - lastMouseX
    const deltaY = e.clientY - lastMouseY
    lastMouseX = e.clientX
    lastMouseY = e.clientY
    
    // 移动所有节点
    nodes.value.forEach(node => {
      node.x += deltaX
      node.y += deltaY
    })
  }
}

function onCanvasMouseUp() {
  isDraggingCanvas = false
  document.body.style.cursor = 'auto'
  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', onCanvasMouseUp)
}

onBeforeUnmount(() => {
  window.removeEventListener('mousemove', onMouseMove)
  window.removeEventListener('mouseup', onMouseUp)
  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', onCanvasMouseUp)
})

const emit = defineEmits(['selectNode', 'nodesChange'])
function emitSelectNode(node: any) {
  selectedNodeId.value = node.id
  emit('selectNode', node)
}

// 监听节点变化并通知父组件
watch(nodes, (newNodes) => {
  emit('nodesChange', newNodes)
}, { deep: true })
</script>

<style scoped>
.canvas-area {
  width: 100%;
  height: 90%;
  min-height: 600px;
  background-color: #f9fafb;
  background-image: linear-gradient(#e4e9f2 1px, transparent 1px), linear-gradient(90deg, #e4e9f2 1px, transparent 1px);
  background-size: 20px 20px;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: grab;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.05);
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
}

/* 确保画布内容区域正确定位 */
.canvas-content {
  position: relative;
  width: 100%;
  height: 100%;
}


.canvas-placeholder {
  color: #b3b3b3;
  font-size: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
}

.placeholder-content {
  text-align: center;
  padding: 40px;
}

.placeholder-content p {
  margin: 16px 0 8px 0;
  font-size: 18px;
  color: #909399;
}

.placeholder-content small {
  color: #c0c4cc;
  font-size: 14px;
}

/* 确保节点正确定位 */
.canvas-node {
  position: absolute;
  min-width: 140px;
  min-height: 60px;
  background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
  border: 2px solid #e1e5e9;
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12);
  color: #2c3e50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: move;
  user-select: none;
  font-size: 14px;
  font-weight: 600;
  z-index: 2;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  backdrop-filter: blur(20px);
  position: absolute;
  overflow: hidden;
}

.canvas-node::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #409eff, #67c23a, #e6a23c, #f56c6c, #909399);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.canvas-node:hover::before {
  opacity: 1;
}

.canvas-node:hover {
  box-shadow: 0 16px 48px rgba(0, 0, 0, 0.2);
  border-color: #409eff;
}

.canvas-node:active {
  box-shadow: 0 12px 40px rgba(64, 158, 255, 0.3);
}

.node-selected {
  border-color: #409eff !important;
  box-shadow: 0 0 0 4px rgba(64, 158, 255, 0.2) !important;
}

.node-dragging {
  transform: scale(1.05);
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
  z-index: 10;
}

.node-created {
  animation: node-create 0.3s ease-out;
}

@keyframes node-create {
  0% {
    transform: scale(0);
    opacity: 0;
  }
  100% {
    transform: scale(1);
    opacity: 1;
  }
}

/* 不同分类的节点样式 */
.canvas-node-soc {
  border-color: #409eff;
  background: linear-gradient(135deg, #e3f2fd 0%, #ffffff 100%);
}

.canvas-node-soc:hover {
  border-color: #1976d2;
  box-shadow: 0 16px 48px rgba(64, 158, 255, 0.25);
}

.canvas-node-cpu {
  border-color: #67c23a;
  background: linear-gradient(135deg, #e8f5e8 0%, #ffffff 100%);
}

.canvas-node-cpu:hover {
  border-color: #4caf50;
  box-shadow: 0 16px 48px rgba(103, 194, 58, 0.25);
}

.canvas-node-i2c-bridge {
  border-color: #e6a23c;
  background: linear-gradient(135deg, #fff3e0 0%, #ffffff 100%);
}

.canvas-node-i2c-bridge:hover {
  border-color: #ff9800;
  box-shadow: 0 16px 48px rgba(230, 162, 60, 0.25);
}

.canvas-node-channel {
  border-color: #f56c6c;
  background: linear-gradient(135deg, #ffebee 0%, #ffffff 100%);
}

.canvas-node-channel:hover {
  border-color: #f44336;
  box-shadow: 0 16px 48px rgba(245, 108, 108, 0.25);
}

.canvas-node-sensor {
  border-color: #909399;
  background: linear-gradient(135deg, #f5f5f5 0%, #ffffff 100%);
}

.canvas-node-sensor:hover {
  border-color: #607d8b;
  box-shadow: 0 16px 48px rgba(144, 147, 153, 0.25);
}

.node-bg-decoration {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: radial-gradient(circle at 20% 20%, rgba(64, 158, 255, 0.05) 0%, transparent 50%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.canvas-node:hover .node-bg-decoration {
  opacity: 1;
}

.node-icon {
  position: absolute;
  left: 12px;
  top: 50%;
  transform: translateY(-50%);
  z-index: 3;
  width: 32px;
  height: 32px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.node-label {
  text-align: center;
  width: 100%;
  padding: 0 50px 0 55px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
}

.label-text {
  font-weight: 700;
  letter-spacing: 0.5px;
  color: #2c3e50;
}

.label-type {
  font-size: 11px;
  color: #909399;
  font-weight: 500;
  background: rgba(144, 147, 153, 0.1);
  padding: 2px 8px;
  border-radius: 10px;
}


.node-status {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 3;
}

.status-indicator {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  position: relative;
  animation: status-pulse 2s infinite;
}

.status-active {
  background: #67c23a;
}

.status-inactive {
  background: #909399;
}

.status-error {
  background: #f56c6c;
}

.status-pulse {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  border-radius: 50%;
  background: inherit;
  animation: pulse-ring 2s infinite;
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 1;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

@keyframes status-pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: 0.6;
  }
}

.node-actions {
  position: absolute;
  top: 8px;
  right: 8px;
  z-index: 5;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.node-selected .node-actions {
  opacity: 1;
}

.canvas-grabbing {
  cursor: grabbing !important;
}
</style>
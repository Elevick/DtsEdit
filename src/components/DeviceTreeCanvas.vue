<template>
  <el-card class="canvas-area" :class="{ 'canvas-grabbing': isDraggingCanvas }" shadow="never"
    @dragover.prevent
    @drop="onDrop"
    @mousedown.self="onCanvasMouseDown"
    @click.self="clearSelection"
  >
    <svg class="connections-layer">
      <!-- 连接线阴影层 -->
      <defs>
        <filter id="connection-shadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="2" stdDeviation="3" flood-color="rgba(64, 158, 255, 0.3)"/>
        </filter>
        <linearGradient id="connection-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" style="stop-color:#409eff;stop-opacity:0.8" />
          <stop offset="50%" style="stop-color:#67c23a;stop-opacity:0.9" />
          <stop offset="100%" style="stop-color:#409eff;stop-opacity:0.8" />
        </linearGradient>
      </defs>
      
      <!-- 连接线 -->
      <path v-for="connection in connections" :key="connection.id"
        :d="connection.path"
        class="connection-path"
        :class="{ 'connection-selected': selectedConnectionId === connection.id }"
        @click="selectConnection(connection.id)"
      />
      
      <!-- 临时连接线 -->
      <path v-if="tempConnectionPath" :d="tempConnectionPath" class="temp-connection-path" />
    </svg>
    
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
      
      <!-- 输入点 -->
      <div class="input-points">
        <div v-for="(input, inputIdx) in node.inputs" :key="input.id"
          class="input-point"
          :style="{ top: 20 + inputIdx * 25 + 'px' }"
          :title="input.name"
          @mousedown.stop="startConnectionFromInput(node, input, $event)"
        >
          <div class="point-inner"></div>
        </div>
      </div>
      
      <!-- 输出点 -->
      <div class="output-points">
        <div v-for="(output, outputIdx) in node.outputs" :key="output.id"
          class="output-point"
          :style="{ top: 20 + outputIdx * 25 + 'px' }"
          :title="output.name"
          @mousedown.stop="startConnection(node, output, $event)"
        >
          <div class="point-inner"></div>
        </div>
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
  inputs: ConnectionPoint[]
  outputs: ConnectionPoint[]
  status?: 'active' | 'inactive' | 'error'
  isNew?: boolean
}

interface ConnectionPoint {
  id: string
  name: string
}

interface Connection {
  id: string
  sourceId: number
  sourcePointId: string
  targetId: number
  targetPointId: string
  path: string
}

const nodes = ref<CanvasNode[]>([])
let nodeId = 1

const connections = ref<Connection[]>([])
const selectedConnectionId = ref<string | null>(null)
const selectedNodeId = ref<number | null>(null)

// 清除选择
function clearSelection() {
  selectedNodeId.value = null
  selectedConnectionId.value = null
}

// 选择连接线
function selectConnection(connectionId: string) {
  selectedConnectionId.value = connectionId
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
    // 删除相关连接
    connections.value = connections.value.filter(conn => 
      conn.sourceId !== nodeId && conn.targetId !== nodeId
    )
    updateConnections()
    selectedNodeId.value = null
  }
}

// 计算连接线路径
function updateConnectionPaths() {
  connections.value.forEach(connection => {
    const sourceNode = nodes.value.find(n => n.id === connection.sourceId)
    const targetNode = nodes.value.find(n => n.id === connection.targetId)
    
    if (sourceNode && targetNode) {
      // 找到对应的输出点和输入点
      const outputIndex = sourceNode.outputs.findIndex(o => o.id === connection.sourcePointId)
      const inputIndex = targetNode.inputs.findIndex(i => i.id === connection.targetPointId)
      
      if (outputIndex !== -1 && inputIndex !== -1) {
        // 计算连接线的起点和终点
        const sourceX = sourceNode.x + 140 + 8 // 节点右侧 + 输出点偏移
        const sourceY = sourceNode.y + 20 + outputIndex * 25 // 根据输出点索引计算Y坐标
        
        // 输入点位于节点左侧
        const targetX = targetNode.x - 8 // 节点左侧 + 输入点偏移
        const targetY = targetNode.y + 20 + inputIndex * 25 // 根据输入点索引计算Y坐标
        
        // 创建贝塞尔曲线路径
        const controlPoint1X = sourceX + 50
        const controlPoint1Y = sourceY
        const controlPoint2X = targetX - 50
        const controlPoint2Y = targetY
        
        connection.path = `M ${sourceX},${sourceY} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`
      }
    }
  })
}

// 更新连接线
function updateConnections() {
  updateConnectionPaths()
}

// 连接操作相关变量
let connectingNode: CanvasNode | null = null
let connectingOutputPoint: ConnectionPoint | null = null
let connectingInputPoint: ConnectionPoint | null = null
let isConnectingFromInput = false // 标记是否从输入点开始连接
let tempConnectionPath = ref('')

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
      
      // 使用从调色板拖拽过来的元件自带的输入输出点信息
      const inputs: ConnectionPoint[] = []
      const outputs: ConnectionPoint[] = []
      
      // 复制输入点，并为每个点生成唯一ID
      if (item.inputs && Array.isArray(item.inputs)) {
        item.inputs.forEach((input: { id: string; name: string }, index: number) => {
          inputs.push({
            id: `in-${index}-${nodeId}`,
            name: input.name
          })
        })
      }
      
      // 复制输出点，并为每个点生成唯一ID
      if (item.outputs && Array.isArray(item.outputs)) {
        item.outputs.forEach((output: { id: string; name: string }, index: number) => {
          outputs.push({
            id: `out-${index}-${nodeId}`,
            name: output.name
          })
        })
      }
      
      const newNode: CanvasNode = {
        id: nodeId++,
        type: item.type,
        label: item.label,
        category: item.category,
        icon: item.icon,
        x: x - 70, // 节点宽度的一半 (140/2)
        y: y - 30, // 节点高度的一半 (60/2)
        inputs,
        outputs,
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
  selectedConnectionId.value = null
  
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

// 开始从输出点创建连接
function startConnection(node: CanvasNode, outputPoint: ConnectionPoint, e: MouseEvent) {
  e.stopPropagation()
  connectingNode = node
  connectingOutputPoint = outputPoint
  connectingInputPoint = null
  isConnectingFromInput = false
  window.addEventListener('mousemove', onConnectionMove)
  window.addEventListener('mouseup', onConnectionEnd)
}

// 开始从输入点创建连接
function startConnectionFromInput(node: CanvasNode, inputPoint: ConnectionPoint, e: MouseEvent) {
  e.stopPropagation()
  connectingNode = node
  connectingInputPoint = inputPoint
  connectingOutputPoint = null
  isConnectingFromInput = true
  window.addEventListener('mousemove', onConnectionMove)
  window.addEventListener('mouseup', onConnectionEnd)
}

// 连接线移动
function onConnectionMove(e: MouseEvent) {
  if (!connectingNode) return
  
  const canvas = document.querySelector('.canvas-area') as HTMLElement
  const rect = canvas.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top
  
  let sourceX, sourceY, targetX, targetY
  
  if (isConnectingFromInput && connectingInputPoint) {
    // 从输入点开始连接
    const inputIndex = connectingNode.inputs.findIndex(i => i.id === connectingInputPoint!.id)
    if (inputIndex === -1) return
    
    sourceX = connectingNode.x - 8 // 节点左侧 + 输入点偏移
    sourceY = connectingNode.y + 20 + inputIndex * 25 // 根据输入点索引计算Y坐标
    targetX = mouseX
    targetY = mouseY
  } else if (connectingOutputPoint) {
    // 从输出点开始连接
    const outputIndex = connectingNode.outputs.findIndex(o => o.id === connectingOutputPoint!.id)
    if (outputIndex === -1) return
    
    sourceX = connectingNode.x + 140 + 8 // 节点右侧 + 输出点偏移
    sourceY = connectingNode.y + 20 + outputIndex * 25 // 根据输出点索引计算Y坐标
    targetX = mouseX
    targetY = mouseY
  } else {
    return
  }
  
  // 创建贝塞尔曲线路径
  const controlPoint1X = isConnectingFromInput ? sourceX - 50 : sourceX + 50
  const controlPoint1Y = sourceY
  const controlPoint2X = isConnectingFromInput ? targetX + 50 : targetX - 50
  const controlPoint2Y = targetY
  
  tempConnectionPath.value = `M ${sourceX},${sourceY} C ${controlPoint1X},${controlPoint1Y} ${controlPoint2X},${controlPoint2Y} ${targetX},${targetY}`
}

// 结束连接创建
function onConnectionEnd(e: MouseEvent) {
  if (!connectingNode) return
  
  const canvas = document.querySelector('.canvas-area') as HTMLElement
  const rect = canvas.getBoundingClientRect()
  const x = e.clientX - rect.left
  const y = e.clientY - rect.top
  
  if (isConnectingFromInput && connectingInputPoint && connectingNode) {
     // 从输入点开始连接，寻找输出点
     for (const targetNode of nodes.value) {
       if (targetNode.id === connectingNode.id) continue // 不能连接到自己
       
       // 检查是否点击在目标节点的输出点上
       for (let i = 0; i < targetNode.outputs.length; i++) {
         const outputPointY = targetNode.y + 20 + i * 25
         
         // 检查鼠标是否在输出点附近
         if (x >= targetNode.x + 130 && x <= targetNode.x + 150 &&
             y >= outputPointY - 12 && y <= outputPointY + 12) {
           
           // 创建新的连接
           const newConnection: Connection = {
             id: `${targetNode.id}-${targetNode.outputs[i].id}-${connectingNode!.id}-${connectingInputPoint!.id}`,
             sourceId: targetNode.id,
             sourcePointId: targetNode.outputs[i].id,
             targetId: connectingNode!.id,
             targetPointId: connectingInputPoint!.id,
             path: ''
           }
           
           // 检查是否已存在相同的连接
           const existingConnection = connections.value.find(conn => 
             conn.targetId === connectingNode!.id && conn.targetPointId === connectingInputPoint!.id
           )
           
           // 如果已存在连接到该输入点的连接，则替换它
           if (existingConnection) {
             const index = connections.value.indexOf(existingConnection)
             connections.value.splice(index, 1, newConnection)
           } else {
             connections.value.push(newConnection)
           }
           
           updateConnections()
           break
         }
       }
     }
   } else if (connectingOutputPoint && connectingNode) {
    // 从输出点开始连接，寻找输入点
    for (const targetNode of nodes.value) {
      if (targetNode.id === connectingNode.id) continue // 不能连接到自己
      
      // 检查是否点击在目标节点的输入点上
      for (let i = 0; i < targetNode.inputs.length; i++) {
        const inputPointY = targetNode.y + 20 + i * 25
        
        // 检查鼠标是否在输入点附近
        if (x >= targetNode.x - 15 && x <= targetNode.x + 15 &&
            y >= inputPointY - 12 && y <= inputPointY + 12) {
          
          // 创建新的连接
          const newConnection: Connection = {
            id: `${connectingNode.id}-${connectingOutputPoint.id}-${targetNode.id}-${targetNode.inputs[i].id}`,
            sourceId: connectingNode.id,
            sourcePointId: connectingOutputPoint.id,
            targetId: targetNode.id,
            targetPointId: targetNode.inputs[i].id,
            path: ''
          }
          
          // 检查是否已存在相同的连接
          const existingConnection = connections.value.find(conn => 
            conn.targetId === targetNode.id && conn.targetPointId === targetNode.inputs[i].id
          )
          
          // 如果已存在连接到该输入点的连接，则替换它
          if (existingConnection) {
            const index = connections.value.indexOf(existingConnection)
            connections.value.splice(index, 1, newConnection)
          } else {
            connections.value.push(newConnection)
          }
          
          updateConnections()
          break
        }
      }
    }
  }
  
  // 清理连接状态
  connectingNode = null
  connectingOutputPoint = null
  connectingInputPoint = null
  isConnectingFromInput = false
  tempConnectionPath.value = ''
  window.removeEventListener('mousemove', onConnectionMove)
  window.removeEventListener('mouseup', onConnectionEnd)
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
      
      // 更新连接线
      updateConnections()
    }
  }
}

function onMouseUp() {
  if (draggingIdx !== null && !isNodeDragging) {
    // 如果没有拖拽，只是点击，则选择节点
    selectedNodeId.value = nodes.value[draggingIdx].id
    selectedConnectionId.value = null
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
    
    // 更新连接线
    updateConnections()
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
  window.removeEventListener('mousemove', onConnectionMove)
  window.removeEventListener('mouseup', onConnectionEnd)
  window.removeEventListener('mousemove', onCanvasMouseMove)
  window.removeEventListener('mouseup', onCanvasMouseUp)
})

const emit = defineEmits(['selectNode', 'nodesChange', 'connectionsChange'])
function emitSelectNode(node: any) {
  selectedNodeId.value = node.id
  selectedConnectionId.value = null
  emit('selectNode', node)
}

// 监听节点变化并通知父组件
watch(nodes, (newNodes) => {
  emit('nodesChange', newNodes)
}, { deep: true })

// 监听连接变化并通知父组件
watch(connections, (newConnections) => {
  emit('connectionsChange', newConnections)
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

/* 确保连接线层正确定位 */
.connections-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 1;
}

.connection-path {
  fill: none;
  stroke: url(#connection-gradient);
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
  filter: url(#connection-shadow);
  cursor: pointer;
  transition: all 0.3s ease;
  stroke-dasharray: none;
}

.connection-path:hover {
  stroke-width: 4px;
  filter: url(#connection-shadow) brightness(1.2);
  stroke: #409eff;
}

.connection-selected {
  stroke: #e6a23c !important;
  stroke-width: 4px !important;
  filter: url(#connection-shadow) brightness(1.3) !important;
  animation: connection-pulse 2s infinite;
}

@keyframes connection-pulse {
  0%, 100% {
    stroke-opacity: 1;
  }
  50% {
    stroke-opacity: 0.6;
  }
}

.temp-connection-path {
  fill: none;
  stroke: #409eff;
  stroke-width: 3px;
  stroke-linecap: round;
  stroke-linejoin: round;
  stroke-opacity: 0.8;
  stroke-dasharray: 8, 4;
  animation: temp-connection-dash 1s linear infinite;
  filter: drop-shadow(0 2px 4px rgba(64, 158, 255, 0.3));
}

@keyframes temp-connection-dash {
  0% {
    stroke-dashoffset: 0;
  }
  100% {
    stroke-dashoffset: 12;
  }
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

.input-points {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 12px;
}

.input-point {
  position: absolute;
  left: -8px;
  width: 16px;
  height: 16px;
  background: #fff;
  border: 3px solid #409eff;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.input-point:hover {
  transform: scale(1.5);
  background: #409eff;
  box-shadow: 0 6px 20px rgba(64, 158, 255, 0.5);
  border-color: #fff;
}

.point-inner {
  width: 6px;
  height: 6px;
  background: #409eff;
  border-radius: 50%;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.input-point:hover .point-inner {
  opacity: 1;
  background: #fff;
}

.output-points {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 12px;
}

.output-point {
  position: absolute;
  right: -8px;
  width: 16px;
  height: 16px;
  background: #409eff;
  border: 3px solid #fff;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 4;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 12px rgba(64, 158, 255, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
}

.output-point:hover {
  transform: scale(1.5);
  background: #67c23a;
  box-shadow: 0 6px 20px rgba(103, 194, 58, 0.5);
  border-color: #fff;
}

.output-point .point-inner {
  background: #67c23a;
}

.output-point:hover .point-inner {
  background: #fff;
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
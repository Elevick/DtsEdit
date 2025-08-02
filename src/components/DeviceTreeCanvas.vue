<template>
  <el-card class="canvas-area" shadow="never"
    @dragover.prevent
    @drop="onDrop"
  >
    <svg class="connections-layer">
      <path v-for="connection in connections" :key="connection.id"
        :d="connection.path"
        class="connection-path"
      />
      <path v-if="tempConnectionPath" :d="tempConnectionPath" class="temp-connection-path" />
    </svg>
    <div v-if="nodes.length === 0" class="canvas-placeholder">将设备树元件拖拽到此处</div>
    <div v-for="(node, idx) in nodes" :key="node.id"
      class="canvas-node"
      :style="{ left: node.x + 'px', top: node.y + 'px' }"
      @mousedown="onNodeMouseDown(idx, $event)"
      @click.stop="emitSelectNode(node)"
    >
      <!-- 输入点 -->
      <div class="input-points">
        <div v-for="(input, inputIdx) in node.inputs" :key="input.id"
          class="input-point"
          :style="{ top: 15 + inputIdx * 20 + 'px' }"
          :title="input.name"
          @mousedown.stop="startConnectionFromInput(node, input, $event)"
        ></div>
      </div>
      
      <!-- 节点标签 -->
      <div class="node-label">{{ node.label }}</div>
      
      <!-- 输出点 -->
      <div class="output-points">
        <div v-for="(output, outputIdx) in node.outputs" :key="output.id"
          class="output-point"
          :style="{ top: 15 + outputIdx * 20 + 'px' }"
          :title="output.name"
          @mousedown.stop="startConnection(node, output, $event)"
        ></div>
      </div>
    </div>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard } from 'element-plus'
import { ref, computed, onMounted, onBeforeUnmount, defineEmits, watch } from 'vue'

interface CanvasNode {
  id: number
  type: string
  label: string
  x: number
  y: number
  inputs: ConnectionPoint[]
  outputs: ConnectionPoint[]
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
        // 输出点位于节点右侧，考虑输出点的实际位置（right: -5px）和节点的最小宽度120px
        const sourceX = sourceNode.x + 120 + 5 // 节点右侧 + 输出点偏移
        const sourceY = sourceNode.y + 15 + outputIndex * 20 // 根据输出点索引计算Y坐标
        
        // 输入点位于节点左侧，考虑输入点的实际位置（left: -5px）
        const targetX = targetNode.x - 5 // 节点左侧 + 输入点偏移
        const targetY = targetNode.y + 15 + inputIndex * 20 // 根据输入点索引计算Y坐标
        
        // 创建贝塞尔曲线路径
        const controlPoint1X = sourceX + 40
        const controlPoint1Y = sourceY
        const controlPoint2X = targetX - 40
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
      // 获取画布相对坐标
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      const x = e.clientX - rect.left
      const y = e.clientY - rect.top
      
      // 使用从调色板拖拽过来的元件自带的输入输出点信息
      // 但需要为每个点生成唯一的ID
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
      
      nodes.value.push({
        id: nodeId++,
        type: item.type,
        label: item.label,
        x: x - 40, // 居中偏移
        y: y - 20,
        inputs,
        outputs
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
    
    sourceX = connectingNode.x - 5 // 节点左侧 + 输入点偏移
    sourceY = connectingNode.y + 15 + inputIndex * 20 // 根据输入点索引计算Y坐标
    targetX = mouseX
    targetY = mouseY
  } else if (connectingOutputPoint) {
    // 从输出点开始连接
    const outputIndex = connectingNode.outputs.findIndex(o => o.id === connectingOutputPoint!.id)
    if (outputIndex === -1) return
    
    sourceX = connectingNode.x + 120 + 5 // 节点右侧 + 输出点偏移，考虑节点的最小宽度120px
    sourceY = connectingNode.y + 15 + outputIndex * 20 // 根据输出点索引计算Y坐标
    targetX = mouseX
    targetY = mouseY
  } else {
    return
  }
  
  // 创建贝塞尔曲线路径
  const controlPoint1X = isConnectingFromInput ? sourceX - 40 : sourceX + 40
  const controlPoint1Y = sourceY
  const controlPoint2X = isConnectingFromInput ? targetX + 40 : targetX - 40
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
         const outputPointY = targetNode.y + 15 + i * 20
         
         // 检查鼠标是否在输出点附近，使用更宽松的检测范围，考虑节点的最小宽度120px
         if (x >= targetNode.x + 110 && x <= targetNode.x + 130 &&
             y >= outputPointY - 10 && y <= outputPointY + 10) {
           
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
           // 使用非空断言，因为我们已经在外层条件中检查了这些变量不为 null
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
        const inputPointY = targetNode.y + 15 + i * 20
        
        // 检查鼠标是否在输入点附近，使用更宽松的检测范围
        if (x >= targetNode.x - 15 && x <= targetNode.x + 15 &&
            y >= inputPointY - 10 && y <= inputPointY + 10) {
          
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
    
    connectingNode = null
  connectingOutputPoint = null
  connectingInputPoint = null
  isConnectingFromInput = false
  tempConnectionPath.value = ''
  window.removeEventListener('mousemove', onConnectionMove)
  window.removeEventListener('mouseup', onConnectionEnd)
  }
}
function onMouseMove(e: MouseEvent) {
  if (draggingIdx !== null) {
    const canvas = document.querySelector('.canvas-area') as HTMLElement
    const rect = canvas.getBoundingClientRect()
    const x = e.clientX - rect.left - offsetX
    const y = e.clientY - rect.top - offsetY
    nodes.value[draggingIdx].x = Math.max(0, Math.min(x, rect.width - 80))
    nodes.value[draggingIdx].y = Math.max(0, Math.min(y, rect.height - 40))
    
    // 更新连接线
    updateConnections()
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
  window.removeEventListener('mousemove', onConnectionMove)
  window.removeEventListener('mouseup', onConnectionEnd)
})

const emit = defineEmits(['selectNode', 'nodesChange', 'connectionsChange'])
function emitSelectNode(node: any) {
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
  stroke: #409eff;
  stroke-width: 2px;
  stroke-dasharray: 5, 5;
}

.temp-connection-path {
  fill: none;
  stroke: #409eff;
  stroke-width: 2px;
  stroke-dasharray: 3, 3;
  stroke-opacity: 0.7;
}
.canvas-placeholder {
  color: #b3b3b3;
  font-size: 18px;
}
.canvas-node {
  position: absolute;
  min-width: 120px;
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

.node-label {
  text-align: center;
  width: 100%;
  padding: 0 20px;
}

.input-points {
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  width: 10px;
}

.input-point {
  position: absolute;
  left: -5px;
  width: 10px;
  height: 10px;
  background: #fff;
  border: 1.5px solid #409eff;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 3;
}

.input-point:hover {
  transform: scale(1.2);
}

.output-points {
  position: absolute;
  right: 0;
  top: 0;
  height: 100%;
  width: 10px;
}

.output-point {
  position: absolute;
  right: -5px;
  width: 10px;
  height: 10px;
  background: #409eff;
  border: 1.5px solid #fff;
  border-radius: 50%;
  cursor: crosshair;
  z-index: 3;
}

.output-point:hover {
  transform: scale(1.2);
}
</style>
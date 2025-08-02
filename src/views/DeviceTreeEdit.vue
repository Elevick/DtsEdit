<template>
  <div class="device-tree-editor">
    <aside class="palette">
      <DeviceTreePalette />
      <DevicePropertyEditor :node="selectedNode" @update="updateNode" />
    </aside>
    <main class="canvas">
      <DeviceTreeCanvas 
        @selectNode="onSelectNode" 
        @nodesChange="onNodesChange" 
        @connectionsChange="onConnectionsChange"
        ref="canvasRef"
      />
    </main>
    <button class="dts-btn" @click="showDtsModal = true">查看DTS代码</button>
    <DtsCodeModal 
      :visible="showDtsModal" 
      :nodes="treeNodes" 
      :connections="connections"
      @update:visible="showDtsModal = $event" 
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DeviceTreePalette from '../components/DeviceTreePalette.vue'
import DeviceTreeCanvas from '../components/DeviceTreeCanvas.vue'
import DevicePropertyEditor from '../components/DevicePropertyEditor.vue'
import DtsCodeModal from '../components/DtsCodeModal.vue'

interface TreeNode {
  id: number
  type: string
  label: string
  x: number
  y: number
  inputs: { id: string, name: string }[]
  outputs: { id: string, name: string }[]
}

interface Connection {
  id: string
  sourceId: number
  sourcePointId: string
  targetId: number
  targetPointId: string
  path: string
}

const showDtsModal = ref(false)
const selectedNode = ref<TreeNode | null>(null)
const canvasRef = ref<any>(null)
const treeNodes = ref<TreeNode[]>([])
const connections = ref<Connection[]>([])

function onSelectNode(node: TreeNode) {
  selectedNode.value = node
}

function updateNode(newNode: any) {
  // 更新选中节点的数据
  if (selectedNode.value) {
    selectedNode.value = { ...selectedNode.value, ...newNode }
    
    // 同步到画布节点数据
    if (canvasRef.value && selectedNode.value) {
      const nodeIndex = treeNodes.value.findIndex((n: TreeNode) => n.id === selectedNode.value?.id)
      if (nodeIndex >= 0 && selectedNode.value) {
        // 更新节点标签
        treeNodes.value[nodeIndex].label = selectedNode.value.label
      }
    }
  }
}

function onNodesChange(nodes: TreeNode[]) {
  treeNodes.value = nodes
}

function onConnectionsChange(newConnections: Connection[]) {
  connections.value = newConnections
}
</script>

<style scoped>
.device-tree-editor {
  display: flex;
  height: 100vh;
  position: relative;
}
.palette {
  width: 220px;
  background: #f7f7f7;
  border-right: 1px solid #eee;
  padding: 16px 8px 0 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 100%;
}
.canvas {
  flex: 1;
  background: #fff;
  padding: 24px;
  overflow: auto;
}
.dts-btn {
  position: absolute;
  top: 24px;
  right: 32px;
  z-index: 10;
  padding: 8px 18px;
  background: #409eff;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 15px;
}
.dts-btn:hover {
  background: #337ecc;
}
</style>

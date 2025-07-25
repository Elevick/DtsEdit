<template>
  <div class="device-tree-editor">
    <aside class="palette">
      <DeviceTreePalette />
      <DevicePropertyEditor :node="selectedNode" @update="updateNode" />
    </aside>
    <main class="canvas">
      <DeviceTreeCanvas @selectNode="onSelectNode" />
    </main>
    <button class="dts-btn" @click="showDtsModal = true">查看DTS代码</button>
    <DtsCodeModal :visible="showDtsModal" @update:visible="showDtsModal = $event" />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import DeviceTreePalette from '../components/DeviceTreePalette.vue'
import DeviceTreeCanvas from '../components/DeviceTreeCanvas.vue'
import DevicePropertyEditor from '../components/DevicePropertyEditor.vue'
import DtsCodeModal from '../components/DtsCodeModal.vue'

const showDtsModal = ref(false)
const selectedNode = ref(null)
function onSelectNode(node: any) {
  selectedNode.value = node
}
function updateNode(newNode: any) {
  // 这里后续可同步到画布节点数据
  selectedNode.value = { ...(selectedNode.value || {}), ...newNode }
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

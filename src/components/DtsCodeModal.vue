<template>
  <el-dialog
    :model-value="visible"
    title="DTS 代码"
    width="520px"
    @close="emit('update:visible', false)"
    :close-on-click-modal="true"
    :close-on-press-escape="true"
    align-center
  >
    <pre class="dts-code">{{ generatedDtsCode }}</pre>
    <template #footer>
      <el-button type="primary" @click="copyToClipboard">复制代码</el-button>
      <el-button @click="emit('update:visible', false)">关闭</el-button>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ElDialog, ElButton, ElMessage } from 'element-plus'
import { computed } from 'vue'
// defineEmits是编译器宏，不需要导入

interface Node {
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

const props = defineProps<{ 
  visible: boolean
  nodes: Node[]
  connections?: Connection[]
}>()

const emit = defineEmits(['update:visible'])

// 构建节点树结构
const nodeTree = computed(() => {
  const rootNodes: (Node & { children: (Node & { children: any[] })[] })[] = []
  const nodeMap = new Map<number, Node & { children: any[] }>()
  
  // 首先创建带有children属性的节点映射
  props.nodes.forEach(node => {
    nodeMap.set(node.id, { ...node, children: [] })
  })
  
  // 根据连接关系构建树结构
  if (props.connections && props.connections.length > 0) {
    // 创建连接映射，按目标节点ID分组
    const connectionsByTarget = new Map<number, Connection[]>()
    
    props.connections.forEach(conn => {
      if (!connectionsByTarget.has(conn.targetId)) {
        connectionsByTarget.set(conn.targetId, [])
      }
      connectionsByTarget.get(conn.targetId)?.push(conn)
    })
    
    // 找出所有没有输入连接的节点作为根节点
    const targetNodeIds = new Set(props.connections.map(conn => conn.targetId))
    
    props.nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)
      if (nodeWithChildren && !targetNodeIds.has(node.id)) {
        rootNodes.push(nodeWithChildren)
      }
    })
    
    // 根据连接关系构建子节点
    props.nodes.forEach(node => {
      const sourceConnections = props.connections?.filter(conn => conn.sourceId === node.id) || []
      
      sourceConnections.forEach(conn => {
        const targetNode = nodeMap.get(conn.targetId)
        const sourceNode = nodeMap.get(conn.sourceId)
        
        if (targetNode && sourceNode) {
          // 将目标节点添加为源节点的子节点
          if (!sourceNode.children.includes(targetNode)) {
            sourceNode.children.push(targetNode)
          }
        }
      })
    })
  } else {
    // 如果没有连接关系，所有节点都是根节点
    props.nodes.forEach(node => {
      const nodeWithChildren = nodeMap.get(node.id)
      if (nodeWithChildren) {
        rootNodes.push(nodeWithChildren)
      }
    })
  }
  
  return rootNodes
})

// 生成DTS代码
const generatedDtsCode = computed(() => {
  if (props.nodes.length === 0) {
    return '/dts-v1/;\n\n/ {\n    model = "Empty Device Tree";\n    compatible = "empty,device-tree";\n};'
  }
  
  let dtsCode = '/dts-v1/;\n\n/ {\n'
  dtsCode += '    model = "Generated Device Tree";\n'
  dtsCode += '    compatible = "generated,device-tree";\n'
  
  // 递归生成节点代码
  function generateNodeCode(nodes: any[], indent: number): string {
    let code = ''
    const indentStr = ' '.repeat(indent)
    
    nodes.forEach(node => {
      // 根据节点类型生成不同的代码
      switch (node.type) {
        case 'node':
          code += `${indentStr}${node.label} {\n`
          if (node.children && node.children.length > 0) {
            code += generateNodeCode(node.children, indent + 4)
          }
          code += `${indentStr}};\n`
          break
        case 'property':
          code += `${indentStr}${node.label} = <0x0>;\n`
          break
        case 'interrupt':
          code += `${indentStr}interrupts = <0x0 0x1 0x4>;\n`
          break
        case 'reg':
          code += `${indentStr}reg = <0x0 0x1000>;\n`
          break
        default:
          code += `${indentStr}/* Unknown node type: ${node.type} */\n`
      }
    })
    
    return code
  }
  
  dtsCode += generateNodeCode(nodeTree.value, 4)
  dtsCode += '};'
  
  return dtsCode
})

// 复制到剪贴板
function copyToClipboard() {
  navigator.clipboard.writeText(generatedDtsCode.value)
    .then(() => {
      ElMessage.success('DTS代码已复制到剪贴板')
    })
    .catch(() => {
      ElMessage.error('复制失败，请手动复制')
    })
}
</script>

<style scoped>
.dts-code {
  background: #f7f7f7;
  margin: 0;
  padding: 18px 20px;
  border-radius: 6px;
  font-size: 15px;
  font-family: 'Fira Mono', 'Consolas', monospace;
  white-space: pre-wrap;
}
</style>
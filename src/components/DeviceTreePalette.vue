<template>
  <el-card class="palette-list" shadow="never">
    <div class="palette-title">设备树元件库</div>
    <el-divider />
    
    <!-- 分类标签页 -->
    <el-tabs v-model="activeCategory" class="palette-tabs">
      <el-tab-pane 
        v-for="category in categories" 
        :key="category.key" 
        :label="category.label"
        :name="category.key"
      >
        <div class="category-content">
          <div class="category-header">
            <el-icon :size="18" :color="category.color">
              <component :is="category.icon" />
            </el-icon>
            <span class="category-title">{{ category.label }}</span>
          </div>
          
          <el-space direction="vertical" fill class="items-container">
            <el-card
              v-for="item in category.items"
              :key="item.type"
              class="palette-item"
              :class="`palette-item-${category.key}`"
              shadow="hover"
              body-style="padding: 8px 12px; display: flex; align-items: center; gap: 8px;"
              draggable="true"
              @dragstart="onDragStart(item, $event)"
            >
              <el-icon :size="16" :color="category.color">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </el-card>
          </el-space>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard, ElDivider, ElSpace, ElTabs, ElTabPane, ElIcon } from 'element-plus'
import { 
  Cpu,
  DataLine, 
  Monitor,
  Setting,
  Link
} from '@element-plus/icons-vue'
import { ref } from 'vue'

interface ConnectionPoint {
  id: string
  name: string
}

interface PaletteItem {
  type: string
  label: string
  icon: any
  category: string
  inputs: ConnectionPoint[]
  outputs: ConnectionPoint[]
  description?: string
}

interface Category {
  key: string
  label: string
  icon: any
  color: string
  items: PaletteItem[]
}

const activeCategory = ref('soc')

const categories: Category[] = [
  {
    key: 'soc',
    label: 'SOC',
    icon: Cpu,
    color: '#409eff',
    items: [
      {
        type: 'soc-main',
        label: '主SOC',
        icon: Cpu,
        category: 'soc',
        inputs: [],
        outputs: [
          { id: 'cpu-bus', name: 'CPU总线' },
          { id: 'memory-bus', name: '内存总线' },
          { id: 'peripheral-bus', name: '外设总线' }
        ],
        description: '系统级芯片主控制器'
      },
      {
        type: 'soc-cpu',
        label: 'CPU核心',
        icon: Cpu,
        category: 'soc',
        inputs: [{ id: 'cpu-bus', name: 'CPU总线' }],
        outputs: [],
        description: '中央处理器核心'
      }
    ]
  },
  {
    key: 'cpu',
    label: 'CPU',
    icon: Setting,
    color: '#67c23a',
    items: [
      {
        type: 'cpu-arm',
        label: 'ARM核心',
        icon: Setting,
        category: 'cpu',
        inputs: [{ id: 'cpu-bus', name: 'CPU总线' }],
        outputs: [
          { id: 'cache', name: '缓存' },
          { id: 'mmu', name: 'MMU' }
        ],
        description: 'ARM架构处理器核心'
      },
      {
        type: 'cpu-riscv',
        label: 'RISC-V核心',
        icon: Setting,
        category: 'cpu',
        inputs: [{ id: 'cpu-bus', name: 'CPU总线' }],
        outputs: [
          { id: 'cache', name: '缓存' },
          { id: 'mmu', name: 'MMU' }
        ],
        description: 'RISC-V架构处理器核心'
      }
    ]
  },
     
  {
    key: 'channel',
    label: '通道',
    icon: DataLine,
    color: '#f56c6c',
    items: [
      {
        type: 'i2c-channel',
        label: 'I2C通道',
        icon: DataLine,
        category: 'channel',
        inputs: [{ id: 'i2c-bus', name: 'I2C总线' }],
        outputs: [
          { id: 'sda', name: 'SDA' },
          { id: 'scl', name: 'SCL' }
        ],
        description: 'I2C通信通道'
      },
      {
        type: 'spi-channel',
        label: 'SPI通道',
        icon: DataLine,
        category: 'channel',
        inputs: [{ id: 'spi-bus', name: 'SPI总线' }],
        outputs: [
          { id: 'mosi', name: 'MOSI' },
          { id: 'miso', name: 'MISO' },
          { id: 'sclk', name: 'SCLK' },
          { id: 'cs', name: 'CS' }
        ],
        description: 'SPI通信通道'
      },
      {
        type: 'uart-channel',
        label: 'UART通道',
        icon: DataLine,
        category: 'channel',
        inputs: [{ id: 'uart-bus', name: 'UART总线' }],
        outputs: [
          { id: 'tx', name: 'TX' },
          { id: 'rx', name: 'RX' }
        ],
        description: 'UART串口通道'
      }
    ]
  },
  {
    key: 'sensor',
    label: '传感器',
    icon: Monitor,
    color: '#909399',
    items: [
      {
        type: 'sensor-temp',
        label: '温度传感器',
        icon: Monitor,
        category: 'sensor',
        inputs: [
          { id: 'i2c-bus', name: 'I2C总线' },
          { id: 'power', name: '电源' }
        ],
        outputs: [
          { id: 'data', name: '数据' },
          { id: 'interrupt', name: '中断' }
        ],
        description: '温度测量传感器'
      },
      {
        type: 'sensor-humidity',
        label: '湿度传感器',
        icon: Monitor,
        category: 'sensor',
        inputs: [
          { id: 'i2c-bus', name: 'I2C总线' },
          { id: 'power', name: '电源' }
        ],
        outputs: [
          { id: 'data', name: '数据' },
          { id: 'interrupt', name: '中断' }
        ],
        description: '湿度测量传感器'
      },
      {
        type: 'sensor-pressure',
        label: '压力传感器',
        icon: Monitor,
        category: 'sensor',
        inputs: [
          { id: 'i2c-bus', name: 'I2C总线' },
          { id: 'power', name: '电源' }
        ],
        outputs: [
          { id: 'data', name: '数据' },
          { id: 'interrupt', name: '中断' }
        ],
        description: '压力测量传感器'
      },
      {
        type: 'sensor-accelerometer',
        label: '加速度计',
        icon: Monitor,
        category: 'sensor',
        inputs: [
          { id: 'i2c-bus', name: 'I2C总线' },
          { id: 'power', name: '电源' }
        ],
        outputs: [
          { id: 'data', name: '数据' },
          { id: 'interrupt', name: '中断' }
        ],
        description: '三轴加速度传感器'
      }
    ]
  }
]

function onDragStart(item: PaletteItem, e: DragEvent) {
  if (e.dataTransfer) {
    e.dataTransfer.setData('application/x-dts-item', JSON.stringify(item))
    // 创建自定义拖拽预览
    const dragPreview = document.createElement('div')
    dragPreview.style.position = 'absolute'
    dragPreview.style.pointerEvents = 'none'
    dragPreview.style.zIndex = '9999'
    dragPreview.style.minWidth = '100px'
    dragPreview.style.minHeight = '40px'
    dragPreview.style.background = '#fff'
    dragPreview.style.border = `2px solid ${item.category ? categories.find(c => c.key === item.category)?.color || '#409eff' : '#409eff'}`
    dragPreview.style.borderRadius = '8px'
    dragPreview.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)'
    dragPreview.style.color = '#222'
    dragPreview.style.display = 'flex'
    dragPreview.style.alignItems = 'center'
    dragPreview.style.justifyContent = 'center'
    dragPreview.style.fontSize = '14px'
    dragPreview.style.opacity = '0.9'
    dragPreview.style.gap = '8px'
    
    // 创建图标和文本
    const icon = document.createElement('div')
    icon.style.width = '16px'
    icon.style.height = '16px'
    icon.style.background = item.category ? categories.find(c => c.key === item.category)?.color || '#409eff' : '#409eff'
    icon.style.borderRadius = '50%'
    
    const text = document.createElement('span')
    text.textContent = item.label
    
    dragPreview.appendChild(icon)
    dragPreview.appendChild(text)
    
    document.body.appendChild(dragPreview)
    e.dataTransfer.setDragImage(dragPreview, 50, 20)
    // 拖拽结束后移除
    setTimeout(() => document.body.removeChild(dragPreview), 0)
  }
}
</script>

<style scoped>
.palette-list {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0;
}

.palette-title {
  font-weight: bold;
  margin-bottom: 0;
  font-size: 16px;
  padding: 8px 0 0 0;
}

.palette-tabs {
  flex: 1;
  display: flex;
  flex-direction: column;
}

.palette-tabs :deep(.el-tabs__content) {
  flex: 1;
  overflow-y: auto;
}

.palette-tabs :deep(.el-tab-pane) {
  height: 100%;
}

.category-content {
  height: 100%;
  display: flex;
  flex-direction: column;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 8px 0;
  border-bottom: 1px solid #eee;
}

.category-title {
  font-weight: 600;
  font-size: 14px;
  color: #333;
}

.items-container {
  flex: 1;
  overflow-y: auto;
}

.palette-item {
  cursor: grab;
  user-select: none;
  font-size: 13px;
  transition: all 0.2s ease;
  margin-bottom: 0;
  border: 1px solid transparent;
}

.palette-item:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

/* 不同分类的样式 */
.palette-item-soc {
  border-left: 3px solid #409eff;
}

.palette-item-cpu {
  border-left: 3px solid #67c23a;
}

.palette-item-i2c-bridge {
  border-left: 3px solid #e6a23c;
}

.palette-item-channel {
  border-left: 3px solid #f56c6c;
}

.palette-item-sensor {
  border-left: 3px solid #909399;
}

.palette-item:hover {
  border-color: currentColor;
}

/* 标签页样式优化 */
.palette-tabs :deep(.el-tabs__header) {
  margin: 0 0 12px 0;
}

.palette-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0;
}

.palette-tabs :deep(.el-tabs__item) {
  padding: 8px 12px;
  font-size: 13px;
  font-weight: 500;
}

.palette-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  font-weight: 600;
}

.palette-tabs :deep(.el-tabs__active-bar) {
  background-color: #409eff;
}
</style>
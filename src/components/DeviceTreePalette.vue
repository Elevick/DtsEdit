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
          
          <div class="items-container">
            <el-card
              v-for="item in category.items"
              :key="item.type"
              class="palette-item"
              :class="`palette-item-${category.key}`"
              shadow="hover"
              body-style="padding: 8px 12px; display: flex; align-items: center; gap: 8px; height: 40px;"
              draggable="true"
              @dragstart="onDragStart(item, $event)"
            >
              <el-icon :size="14" :color="category.color">
                <component :is="item.icon" />
              </el-icon>
              <span>{{ item.label }}</span>
            </el-card>
          </div>
        </div>
      </el-tab-pane>
    </el-tabs>
  </el-card>
</template>

<script setup lang="ts">
import { ElCard, ElDivider, ElTabs, ElTabPane, ElIcon } from 'element-plus'
import { ref } from 'vue'
import { loadDeviceTreeComponents } from '@/utils/componentLoader'
import type { PaletteItem } from '@/types/deviceTree'

const activeCategory = ref('soc')

// 从配置文件加载组件数据
const categories = loadDeviceTreeComponents()

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
    
    // 设置拖拽图片
    e.dataTransfer.setDragImage(dragPreview, 50, 20)
    
    // 清理拖拽预览
    setTimeout(() => {
      if (document.body.contains(dragPreview)) {
        document.body.removeChild(dragPreview)
      }
    }, 0)
  }
}
</script>

<style scoped>
.palette-list {
  width: 100%;
  height: 50%;
  min-height: 250px;
  max-height: 50%;
  background: linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%);
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.palette-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  text-align: center;
  padding: 8px 0 4px 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.palette-tabs {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

.palette-tabs :deep(.el-tabs__header) {
  margin: 0;
  border-bottom: 1px solid #e1e5e9;
}

.palette-tabs :deep(.el-tabs__nav-wrap) {
  padding: 0 16px;
}

.palette-tabs :deep(.el-tabs__item) {
  padding: 0 8px;
  height: 32px;
  line-height: 32px;
  font-size: 12px;
  font-weight: 500;
  color: #6c757d;
  border: none;
  background: transparent;
  transition: all 0.3s ease;
}

.palette-tabs :deep(.el-tabs__item:hover) {
  color: #409eff;
  background: rgba(64, 158, 255, 0.05);
}

.palette-tabs :deep(.el-tabs__item.is-active) {
  color: #409eff;
  background: rgba(64, 158, 255, 0.1);
  border-bottom: 2px solid #409eff;
}

.palette-tabs :deep(.el-tabs__content) {
  flex: 1;
  min-height: 0;
  padding: 0;
}

.palette-tabs :deep(.el-tab-pane) {
  height: 100%;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-content {
  padding: 8px;
  flex: 1;
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.category-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding-bottom: 4px;
  border-bottom: 1px solid #e1e5e9;
  flex-shrink: 0;
}

.category-title {
  font-size: 12px;
  font-weight: 600;
  color: #2c3e50;
}

.items-container {
  width: 100%;
  flex: 1;
  min-height: 0;
  max-height: 180px;
  overflow-y: auto;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 4px 4px 16px 4px;
  box-sizing: border-box;
}

.palette-item {
  cursor: grab;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  border: 1px solid #e1e5e9;
  border-radius: 8px;
  background: #ffffff;
  user-select: none;
  min-height: 40px;
  max-height: 40px;
  display: flex;
  align-items: center;
  flex-shrink: 0;
}

.palette-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
  border-color: #409eff;
}

.palette-item:active {
  cursor: grabbing;
  transform: translateY(0);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

/* 不同分类的样式 */
.palette-item-soc {
  border-left: 4px solid #409eff;
}

.palette-item-soc:hover {
  border-left-color: #1976d2;
  box-shadow: 0 8px 25px rgba(64, 158, 255, 0.2);
}

.palette-item-cpu {
  border-left: 4px solid #67c23a;
}

.palette-item-cpu:hover {
  border-left-color: #4caf50;
  box-shadow: 0 8px 25px rgba(103, 194, 58, 0.2);
}

.palette-item-i2c-bridge {
  border-left: 4px solid #e6a23c;
}

.palette-item-i2c-bridge:hover {
  border-left-color: #ff9800;
  box-shadow: 0 8px 25px rgba(230, 162, 60, 0.2);
}

.palette-item-channel {
  border-left: 4px solid #f56c6c;
}

.palette-item-channel:hover {
  border-left-color: #f44336;
  box-shadow: 0 8px 25px rgba(245, 108, 108, 0.2);
}

.palette-item-sensor {
  border-left: 4px solid #909399;
}

.palette-item-sensor:hover {
  border-left-color: #607d8b;
  box-shadow: 0 8px 25px rgba(144, 147, 153, 0.2);
}

/* 滚动条样式 */
.palette-tabs :deep(.el-tab-pane)::-webkit-scrollbar,
.category-content::-webkit-scrollbar,
.items-container::-webkit-scrollbar {
  width: 6px;
}

.palette-tabs :deep(.el-tab-pane)::-webkit-scrollbar-track,
.category-content::-webkit-scrollbar-track,
.items-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.palette-tabs :deep(.el-tab-pane)::-webkit-scrollbar-thumb,
.category-content::-webkit-scrollbar-thumb,
.items-container::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.palette-tabs :deep(.el-tab-pane)::-webkit-scrollbar-thumb:hover,
.category-content::-webkit-scrollbar-thumb:hover,
.items-container::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
</style>
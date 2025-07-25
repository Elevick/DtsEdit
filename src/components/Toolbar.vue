<template>
  <el-page-header
    class="toolbar"
    :title="pageTitle"
    :content="pageContent"
    :icon="''"
  >
    <template #title>
      <div class="toolbar-left">
        <el-button class="back-btn" circle text @click="goBack">
          <el-icon><ArrowLeft /></el-icon>
        </el-button>
        <el-icon class="logo-icon" size="24"><Collection /></el-icon>
        <span class="logo">DtsDraw</span>
        <span class="subtitle">设备树图形生成系统</span>
      </div>
    </template>
    <template #content>
      <div class="toolbar-right">
        <el-button type="primary" icon="View" @click="router.push('/preview')">预览</el-button>
      </div>
    </template>
  </el-page-header>
</template>

<script setup lang="ts">
import { ElPageHeader, ElIcon, ElButton } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import { Collection, ArrowLeft, View } from '@element-plus/icons-vue'
import { computed } from 'vue'

const route = useRoute()
const router = useRouter()

const pageMap: Record<string, { title: string; content: string }> = {
  '/': { title: '主页', content: '欢迎使用DtsDraw' },
  '/edit': { title: '编辑器', content: '可视化编辑设备树' },
  '/about': { title: '关于', content: '项目介绍' },
  '/preview': { title: '预览', content: 'DTS代码预览' }
}
const pageTitle = computed(() => pageMap[route.path]?.title || '页面')
const pageContent = computed(() => pageMap[route.path]?.content || '')

function goBack() {
  router.back()
}
</script>

<style scoped>
.toolbar {
  background: #fff;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border-radius: 0 0 8px 8px;
  padding: 12px 32px 12px 24px;
  margin-bottom: 8px;
}
.toolbar-left {
  display: flex;
  align-items: center;
}
.back-btn {
  margin-right: 8px;
  color: #409eff;
  transition: background 0.2s, color 0.2s;
}
.back-btn:hover {
  background: #ecf5ff;
  color: #1867c0;
  box-shadow: 0 2px 8px rgba(64,158,255,0.12);
}
.logo-icon {
  margin-right: 8px;
  color: #409eff;
}
.logo {
  font-size: 22px;
  font-weight: bold;
  color: #409eff;
  margin-right: 12px;
}
.subtitle {
  font-size: 14px;
  color: #888;
}
.toolbar-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style> 
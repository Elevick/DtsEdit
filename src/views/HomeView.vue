<template>
  <div class="home-container">
    <el-card class="home-card" shadow="hover">
      <div class="home-header">
        <el-icon class="home-logo" size="48"><Collection /></el-icon>
        <div>
          <h1>DtsDraw</h1>
          <p class="subtitle">设备树图形生成系统</p>
        </div>
      </div>
      <p class="description">
        欢迎使用 DtsDraw！本系统支持可视化编辑设备树，自动生成 DTS 代码，助力嵌入式开发效率提升。
      </p>
      <div class="home-actions">
        <el-button type="primary" size="large" @click="goEdit">开始编辑</el-button>
        <el-button size="large" @click="goAbout">项目介绍</el-button>
        <el-button size="large" @click="goPreview">预览</el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ElCard, ElButton, ElIcon } from 'element-plus'
import { Collection } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const goEdit = () => router.push('/edit')
const goAbout = () => router.push('/about')
const goPreview = () => router.push('/preview')
</script>

<style scoped>
.home-container {
  display: flex;
  flex: 1;
  min-height: 0;
  justify-content: center;
  align-items: center;
  background: #f6f8fa;
}
.home-card {
  max-width: 480px;
  width: 100%;
  padding: 32px 36px 28px 36px;
  border-radius: 16px;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
}
.home-header {
  display: flex;
  align-items: center;
  margin-bottom: 18px;
}
.home-logo {
  margin-right: 18px;
  color: #409eff;
}
h1 {
  margin: 0;
  font-size: 2rem;
  font-weight: bold;
  color: #222;
}
.subtitle {
  margin: 0;
  color: #888;
  font-size: 1rem;
}
.description {
  margin: 18px 0 28px 0;
  color: #555;
  font-size: 1.08rem;
}
.home-actions {
  display: flex;
  gap: 18px;
  justify-content: center;
}
</style>

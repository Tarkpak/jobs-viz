<template>
  <NConfigProvider :theme="darkTheme" :theme-overrides="themeOverrides">
    <NMessageProvider>
      <NDialogProvider>
        <NuxtPage />
      </NDialogProvider>
    </NMessageProvider>
  </NConfigProvider>
</template>

<script setup lang="ts">
import { darkTheme } from 'naive-ui'

// ECharts
import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart } from 'echarts/charts'
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
} from 'echarts/components'

// 注册 ECharts 组件
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  GridComponent
])

// 主题覆盖配置
const themeOverrides = {
  common: {
    primaryColor: '#4E9EF4',
    primaryColorHover: '#6EB5FF',
    primaryColorPressed: '#2A7CD9',
    borderRadius: '12px',
    fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
  }
}
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  width: 100%;
  height: 100%;
  overflow-x: hidden;
}

#__nuxt {
  width: 100%;
  min-height: 100vh;
}

.app-container {
  min-height: 100vh;
  position: relative;
  width: 100%;
}

.main-content {
  width: 100%;
  padding: var(--spacing-lg);
  position: relative;
  z-index: 1;
}

/* 玻璃态卡片 */
.glass-card {
  background: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 16px;
  padding: 1.5rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
}

/* 统计卡片 */
.stat-card {
  padding: 2rem;
  text-align: center;
  transition: transform 0.3s, box-shadow 0.3s;
}

.stat-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.4);
}

.stat-card .stat-icon {
  font-size: 2.5rem;
  margin-bottom: 1rem;
}

.stat-card .value {
  font-size: 2.5rem;
  font-weight: 700;
  color: #fff;
  margin-bottom: 0.5rem;
}

.stat-card .label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
}

.stat-card.primary {
  background: linear-gradient(135deg, rgba(102, 126, 234, 0.2) 0%, rgba(118, 75, 162, 0.2) 100%);
}

.stat-card.blue {
  background: linear-gradient(135deg, rgba(0, 198, 251, 0.2) 0%, rgba(0, 91, 234, 0.2) 100%);
}

.stat-card.gold {
  background: linear-gradient(135deg, rgba(245, 175, 25, 0.2) 0%, rgba(255, 87, 34, 0.2) 100%);
}

.stat-card.emerald {
  background: linear-gradient(135deg, rgba(56, 239, 125, 0.2) 0%, rgba(17, 153, 142, 0.2) 100%);
}

/* 图表容器 */
.chart-box {
  padding: 1.5rem;
}

.chart-box .section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin-bottom: 1rem;
}

/* 上传区域 */
.upload-section {
  padding: 1.5rem;
}

.upload-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.data-source-info {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.section-title {
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.source-meta {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.source-meta .filename {
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
}

.source-meta .upload-time {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.upload-area {
  width: 100%;
}

.upload-dragger {
  background: rgba(255, 255, 255, 0.02) !important;
  border: 2px dashed rgba(255, 255, 255, 0.15) !important;
  border-radius: 12px !important;
  transition: all 0.3s;
  cursor: pointer;
}

.upload-dragger:hover {
  border-color: rgba(102, 126, 234, 0.5) !important;
  background: rgba(102, 126, 234, 0.05) !important;
}

.upload-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  gap: 1rem;
}

.upload-icon {
  font-size: 3rem;
  width: 80px;
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 50%;
  transition: all 0.3s;
}

.upload-icon.uploading {
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0%, 100% {
    transform: scale(1);
    opacity: 1;
  }
  50% {
    transform: scale(1.1);
    opacity: 0.8;
  }
}

.upload-text {
  text-align: center;
}

.upload-text .primary-text {
  font-size: 1.1rem;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  margin-bottom: 0.5rem;
}

.upload-text .secondary-text {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
}

/* 筛选区 */
.filter-section {
  padding: 1.5rem;
}

.filter-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
}

.filter-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-item label {
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.filter-result {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
  color: rgba(255, 255, 255, 0.7);
}

.error-container,
.no-data-container {
  padding: 2rem;
  text-align: center;
}

/* CSS 变量 */
:root {
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;
  
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 12px;
  --radius-xl: 16px;
  
  --transition-normal: 0.3s ease;
  
  --gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  --gradient-blue: linear-gradient(135deg, #00c6fb 0%, #005bea 100%);
  
  --glass-bg: rgba(255, 255, 255, 0.05);
  --glass-border: rgba(255, 255, 255, 0.1);
  
  --text-primary: rgba(255, 255, 255, 0.95);
  --text-secondary: rgba(255, 255, 255, 0.7);
  --text-muted: rgba(255, 255, 255, 0.5);
}
</style>

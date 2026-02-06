<template>
  <div class="dashboard-page">
    <!-- 顶部导航 -->
    <nav class="top-nav glass-card">
      <div class="nav-content">
        <div class="logo-section">
          <div class="logo-icon">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" width="32" height="32">
              <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm0 10.99h7c-.53 4.12-3.28 7.79-7 8.94V12H5V6.3l7-3.11v8.8z"/>
            </svg>
          </div>
          <div class="logo-text">
            <h1>Visual</h1>
            <p>数据可视化分析平台</p>
          </div>
        </div>
        
        <div class="nav-tabs">
          <NuxtLink to="/" class="nav-tab active">
            <NIcon :component="BarChartOutline" :size="18" />
            <span>数据概览</span>
          </NuxtLink>
          <NuxtLink to="/table" class="nav-tab">
            <NIcon :component="DocumentTextOutline" :size="18" />
            <span>职位列表</span>
          </NuxtLink>
          <NuxtLink to="/query" class="nav-tab">
            <NIcon :component="SearchOutline" :size="18" />
            <span>职位查询</span>
          </NuxtLink>
        </div>

        <div class="header-stats">
          <div class="mini-stat">
            <span class="value">{{ statistics?.totalPositions || 0 }}</span>
            <span class="label">职位数</span>
          </div>
          <div class="mini-stat">
            <span class="value">{{ statistics?.totalRecruits || 0 }}</span>
            <span class="label">招录人数</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 数据源管理区 -->
      <section class="upload-section glass-card">
        <div class="upload-header">
          <div class="data-source-info">
            <h3 class="section-title">数据源管理</h3>
            <div class="source-meta" v-if="metadata">
              <NTag :type="metadata.source === 'uploaded' ? 'success' : 'warning'" size="small">
                {{ metadata.source === 'uploaded' ? '已上传数据' : '暂无数据' }}
              </NTag>
              <NTag v-if="metadata.examType" :type="metadata.examType === 'gwy' ? 'info' : 'success'" size="small">
                {{ metadata.examType === 'gwy' ? '公务员' : '事业单位' }}
              </NTag>
              <span class="filename" v-if="metadata.filename">{{ metadata.filename }}</span>
              <span class="upload-time" v-if="metadata.uploadTime">
                上传于: {{ new Date(metadata.uploadTime).toLocaleString('zh-CN') }}
              </span>
              <span class="stats-time" v-if="metadata.statsUpdateTime">
                统计更新: {{ new Date(metadata.statsUpdateTime).toLocaleString('zh-CN') }}
                ({{ metadata.statsSuccessCount || 0 }}/{{ metadata.count || 0 }} 成功)
              </span>
            </div>
          </div>
          <div class="upload-actions">
            <NButton 
              v-if="metadata?.source === 'uploaded'" 
              type="info" 
              ghost
              size="small"
              @click="handleRefreshStats"
              :loading="refreshingStats"
            >
              <template #icon>
                <NIcon :component="RefreshOutline" />
              </template>
              刷新统计
            </NButton>
            <NButton 
              v-if="metadata?.source === 'uploaded'" 
              type="error" 
              ghost
              size="small"
              @click="handleClearData"
            >
              清除数据
            </NButton>
          </div>
        </div>

        <!-- 已有文件选择器 -->
        <div class="file-selector" v-if="availableFiles.length > 0">
          <div class="selector-label">
            <NIcon :component="FolderOpenOutline" :size="18" />
            <span>或从已有文件中选择：</span>
          </div>
          <NSelect
            v-model:value="selectedFile"
            :options="fileOptions"
            placeholder="选择 Excel 文件"
            clearable
            @update:value="handleLoadExcel"
            :loading="loadingExcel"
          />
          <div class="file-actions" v-if="selectedFile">
            <NButton
              size="small"
              type="warning"
              ghost
              @click="handleRenameFile"
              :disabled="loadingExcel"
            >
              <template #icon>
                <NIcon :component="CreateOutline" />
              </template>
              重命名
            </NButton>
            <NButton
              size="small"
              type="error"
              ghost
              @click="handleDeleteFile"
              :disabled="loadingExcel"
            >
              <template #icon>
                <NIcon :component="TrashOutline" />
              </template>
              删除
            </NButton>
          </div>
        </div>

        <!-- 上传到 public 目录 -->
        <div class="upload-to-public">
          <NUpload
            accept=".xlsx,.xls"
            :max="1"
            :show-file-list="false"
            :custom-request="handleUploadToPublic"
            :disabled="uploadingToPublic"
          >
            <NButton type="primary" ghost :loading="uploadingToPublic">
              <template #icon>
                <NIcon :component="SaveOutline" />
              </template>
              上传文件到服务器
            </NButton>
          </NUpload>
          <span class="upload-hint">文件将保存到 public 目录，可重复使用</span>
        </div>
        
        <NDivider>或</NDivider>
        <NUpload
          accept=".xlsx,.xls"
          :max="1"
          :show-file-list="false"
          :custom-request="handleUpload"
          :disabled="uploading"
          class="upload-area"
        >
          <NUploadDragger class="upload-dragger">
            <div class="upload-content">
              <div class="upload-icon" :class="{ uploading }">
                <template v-if="uploading">
                  <NSpin size="medium" />
                </template>
                <template v-else>
                  <NIcon :component="CloudUploadOutline" :size="48" />
                </template>
              </div>
              <div class="upload-text">
                <p class="primary-text">
                  {{ uploading ? '正在处理...' : '点击或拖拽上传 Excel 文件' }}
                </p>
                <p class="secondary-text">
                  支持 .xlsx / .xls 格式的职位表文件
                </p>
              </div>
            </div>
          </NUploadDragger>
        </NUpload>
      </section>

      <!-- 数据加载状态 -->
      <div v-if="loading" class="loading-container">
        <NSpin size="large" />
        <p>正在加载职位数据...</p>
      </div>

      <div v-else-if="error" class="error-container glass-card">
        <NResult status="error" title="加载失败" :description="error">
          <template #footer>
            <NButton @click="loadData">重新加载</NButton>
          </template>
        </NResult>
      </div>

      <!-- 无数据提示 -->
      <div v-else-if="metadata?.source === 'none'" class="no-data-container glass-card">
        <NResult status="info" title="暂无职位数据" description="请上传职位表 Excel 文件开始分析">
          <template #icon>
            <NIcon :component="DocumentOutline" :size="64" color="#667eea" />
          </template>
        </NResult>
      </div>

      <template v-else>
        <!-- 统计卡片区 -->
        <section class="stats-section">
          <div class="stats-grid">
            <div class="glass-card stat-card primary">
              <div class="stat-icon">
                <NIcon :component="DocumentTextOutline" :size="32" />
              </div>
              <div class="value">{{ statistics?.totalPositions }}</div>
              <div class="label">招录职位总数</div>
            </div>
            <div class="glass-card stat-card blue">
              <div class="stat-icon">
                <NIcon :component="PeopleOutline" :size="32" />
              </div>
              <div class="value">{{ statistics?.totalRecruits }}</div>
              <div class="label">计划招录人数</div>
            </div>
            <div class="glass-card stat-card gold">
              <div class="stat-icon">
                <NIcon :component="BusinessOutline" :size="32" />
              </div>
              <div class="value">{{ statistics?.areaStats?.length }}</div>
              <div class="label">招录考区数量</div>
            </div>
            <div class="glass-card stat-card emerald">
              <div class="stat-icon">
                <NIcon :component="StatsChartOutline" :size="32" />
              </div>
              <div class="value">{{ (statistics?.totalRecruits! / statistics?.totalPositions!).toFixed(2) }}</div>
              <div class="label">平均竞争比</div>
            </div>
          </div>
        </section>

        <!-- 筛选区 -->
        <section class="filter-section glass-card">
          <h3 class="section-title">智能筛选</h3>
          <div class="filter-grid">
            <div class="filter-item">
              <label>
                考区
                <span v-if="areaOptions.length > 20" class="option-count">({{ areaOptions.length }}个选项)</span>
              </label>
              <NSelect 
                v-model:value="filters.area" 
                :options="areaOptions" 
                placeholder="选择考区"
                clearable
                filterable
                :filter="filterOption"
                :max-tag-count="1"
                :virtual-scroll="areaOptions.length > 50"
              />
            </div>
            <div class="filter-item">
              <label>
                学历要求
                <span v-if="educationOptions.length > 20" class="option-count">({{ educationOptions.length }}个选项)</span>
              </label>
              <NSelect 
                v-model:value="filters.education" 
                :options="educationOptions" 
                placeholder="选择学历"
                clearable
                :filterable="educationOptions.length > 20"
                :filter="filterOption"
              />
            </div>
            <div class="filter-item">
              <label>
                职位类别
                <span v-if="categoryOptions.length > 20" class="option-count">({{ categoryOptions.length }}个选项)</span>
              </label>
              <NSelect 
                v-model:value="filters.category" 
                :options="categoryOptions" 
                placeholder="选择类别"
                clearable
                :filterable="categoryOptions.length > 20"
                :filter="filterOption"
              />
            </div>
            <div class="filter-item">
              <label>职位代码</label>
              <NInput 
                v-model:value="filters.positionCode" 
                placeholder="输入职位代码（支持模糊匹配）"
                clearable
              >
                <template #prefix>
                  <span style="opacity: 0.5">�</span>
                </template>
              </NInput>
            </div>
            <div class="filter-item search">
              <label>关键词搜索</label>
              <NInput 
                v-model:value="filters.keyword" 
                placeholder="搜索单位、职位、专业..."
                clearable
              >
                <template #prefix>
                  <span style="opacity: 0.5">🔍</span>
                </template>
              </NInput>
            </div>
          </div>
          <div class="filter-result">
            <NTag type="info" size="medium">
              筛选结果: {{ filteredData.length }} 个职位
            </NTag>
            <NButton text type="primary" @click="resetFilters">
              重置筛选
            </NButton>
          </div>
        </section>

        <!-- 图表区 -->
        <section class="charts-section">
          <div class="charts-grid">
            <!-- 考区分布图 -->
            <div class="glass-card chart-box">
              <h3 class="section-title">考区招录分布</h3>
              <div class="chart-container">
                <ClientOnly>
                  <VChart :option="areaChartOption" autoresize />
                </ClientOnly>
              </div>
            </div>

            <!-- 学历要求饼图 -->
            <div class="glass-card chart-box">
              <h3 class="section-title">学历要求分布</h3>
              <div class="chart-container">
                <ClientOnly>
                  <VChart :option="educationChartOption" autoresize />
                </ClientOnly>
              </div>
            </div>

            <!-- 职位类别图 -->
            <div class="glass-card chart-box">
              <h3 class="section-title">职位类别分布</h3>
              <div class="chart-container">
                <ClientOnly>
                  <VChart :option="categoryChartOption" autoresize />
                </ClientOnly>
              </div>
            </div>

            <!-- 应届生要求分布 -->
            <div class="glass-card chart-box">
              <h3 class="section-title">应届生限制分布</h3>
              <div class="chart-container">
                <ClientOnly>
                  <VChart :option="freshGradChartOption" autoresize />
                </ClientOnly>
              </div>
            </div>
          </div>
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMessage, useDialog, NIcon, NInput } from 'naive-ui'
import type { UploadCustomRequestOptions } from 'naive-ui'
import VChart from 'vue-echarts'
import { h } from 'vue'
import { 
  BarChartOutline,
  DocumentTextOutline,
  RefreshOutline,
  CloudUploadOutline,
  PeopleOutline,
  BusinessOutline,
  StatsChartOutline,
  DocumentOutline,
  FolderOpenOutline,
  CreateOutline,
  TrashOutline,
  SaveOutline,
  SearchOutline
} from '@vicons/ionicons5'

// 在 Provider 内部可以安全使用
const message = useMessage()
const dialog = useDialog()

// 数据管理
const { data, loading, uploading, error, statistics, metadata, loadData, uploadFile, clearData, filterData } = usePoliceData()

// 刷新统计状态
const refreshingStats = ref(false)

// 已有文件列表
const availableFiles = ref<Array<{ name: string; fullPath?: string; path: string }>>([])
const selectedFile = ref<string | null>(null)
const loadingExcel = ref(false)
const uploadingToPublic = ref(false)

// 文件选项
const fileOptions = computed(() => 
  availableFiles.value.map(file => ({
    label: file.name,
    value: file.fullPath || file.name // 使用完整路径作为值
  }))
)

// 加载已有文件列表
async function loadAvailableFiles() {
  try {
    const result = await $fetch('/api/excel-files') as any
    if (result.success) {
      availableFiles.value = result.files || []
    }
  } catch (error) {
    console.error('加载文件列表失败:', error)
  }
}

// 加载选中的 Excel 文件
async function handleLoadExcel(filename: string | null) {
  if (!filename) return
  
  loadingExcel.value = true
  
  try {
    const result = await $fetch('/api/load-excel', {
      method: 'POST',
      body: { filename, useCache: true }
    }) as any
    
    if (result.success) {
      const cacheMsg = result.fromCache ? '（使用缓存）' : ''
      message.success(result.message + cacheMsg)
      await loadData()
    } else {
      message.error('加载文件失败')
    }
  } catch (error: any) {
    console.error('加载文件失败:', error)
    message.error(error.data?.message || '加载文件失败，请稍后重试')
  } finally {
    loadingExcel.value = false
  }
}

// 上传文件到 public 目录
async function handleUploadToPublic({ file }: UploadCustomRequestOptions) {
  if (!file.file) {
    message.error('未找到文件')
    return
  }
  
  uploadingToPublic.value = true
  
  try {
    const formData = new FormData()
    formData.append('file', file.file)

    const result = await $fetch('/api/upload-to-public', {
      method: 'POST',
      body: formData
    }) as any
    
    if (result.success) {
      message.success(result.message)
      await loadAvailableFiles()
      // 上传后自动选中该文件
      const uploadedFile = availableFiles.value.find(f => f.name === result.filename)
      selectedFile.value = uploadedFile?.fullPath || result.filename
    } else {
      message.error('上传失败')
    }
  } catch (error: any) {
    console.error('上传失败:', error)
    message.error(error.data?.message || '上传文件失败，请稍后重试')
  } finally {
    uploadingToPublic.value = false
  }
}

// 重命名文件
async function handleRenameFile() {
  if (!selectedFile.value) return
  
  dialog.create({
    title: '重命名文件',
    content: () => {
      const inputRef = ref(selectedFile.value)
      return h('div', { style: 'padding: 10px 0;' }, [
        h(NInput, {
          value: inputRef.value,
          'onUpdate:value': (v: string) => { inputRef.value = v },
          placeholder: '输入新文件名'
        })
      ])
    },
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const input = document.querySelector('.n-dialog input') as HTMLInputElement
      const newFilename = input?.value
      
      if (!newFilename || newFilename === selectedFile.value) {
        message.warning('文件名未改变')
        return
      }
      
      try {
        const result = await $fetch('/api/manage-file', {
          method: 'POST',
          body: {
            action: 'rename',
            filename: selectedFile.value,
            newFilename
          }
        }) as any
        
        if (result.success) {
          message.success(result.message)
          await loadAvailableFiles()
          selectedFile.value = result.newFilename
        }
      } catch (error: any) {
        message.error(error.data?.message || '重命名失败')
      }
    }
  })
}

// 删除文件
async function handleDeleteFile() {
  if (!selectedFile.value) return
  
  dialog.warning({
    title: '确认删除',
    content: `确定要删除文件 "${selectedFile.value}" 吗？此操作不可恢复。`,
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      try {
        const result = await $fetch('/api/manage-file', {
          method: 'POST',
          body: {
            action: 'delete',
            filename: selectedFile.value
          }
        }) as any
        
        if (result.success) {
          message.success(result.message)
          selectedFile.value = null
          await loadAvailableFiles()
        }
      } catch (error: any) {
        message.error(error.data?.message || '删除失败')
      }
    }
  })
}

// 处理文件上传
async function handleUpload({ file }: UploadCustomRequestOptions) {
  if (!file.file) {
    message.error('未找到文件')
    return
  }
  
  const result = await uploadFile(file.file)
  
  if (result.success) {
    message.success(result.message)
  } else {
    message.error(result.message)
  }
}

// 刷新报名统计数据
async function handleRefreshStats() {
  refreshingStats.value = true
  
  try {
    const result = await $fetch('/api/refresh-stats', {
      method: 'POST'
    })
    
    if (result.success) {
      message.success(result.message)
      // 重新加载数据
      await loadData()
    } else {
      message.error('刷新统计失败')
    }
  } catch (e: any) {
    console.error('刷新统计失败:', e)
    message.error('刷新统计失败，请稍后重试')
  } finally {
    refreshingStats.value = false
  }
}

// 清除上传的数据
async function handleClearData() {
  dialog.warning({
    title: '确认清除',
    content: '确定要清除已上传的数据吗？清除后需要重新上传文件。',
    positiveText: '确定',
    negativeText: '取消',
    onPositiveClick: async () => {
      const result = await clearData()
      if (result.success) {
        message.success(result.message)
      } else {
        message.error(result.message)
      }
    }
  })
}

// 筛选状态
const filters = reactive({
  area: null as string | null,
  education: null as string | null,
  category: null as string | null,
  positionCode: '', // 职位代码筛选
  keyword: ''
})

// 计算属性 - 筛选后的数据
const filteredData = computed(() => {
  return filterData({
    考区: filters.area || undefined,
    学历要求: filters.education || undefined,
    所属大类: filters.category || undefined,
    职位代码: filters.positionCode || undefined,
    keyword: filters.keyword || undefined
  })
})

// 筛选选项
const areaOptions = computed(() => 
  statistics.value?.areaStats.map(s => ({ label: `${s.name} (${s.recruits}人)`, value: s.name })) || []
)

const educationOptions = computed(() =>
  statistics.value?.educationStats.map(s => ({ label: `${s.name} (${s.value}个)`, value: s.name })) || []
)

const categoryOptions = computed(() =>
  statistics.value?.categoryStats.map(s => ({ label: `${s.name} (${s.value}个)`, value: s.name })) || []
)

// 重置筛选
function resetFilters() {
  filters.area = null
  filters.education = null
  filters.category = null
  filters.positionCode = ''
  filters.keyword = ''
}

// 自定义筛选函数 - 支持拼音和中文搜索
function filterOption(pattern: string, option: any) {
  const searchText = pattern.toLowerCase()
  const label = option.label?.toLowerCase() || ''
  return label.includes(searchText)
}

// 考区分布柱状图配置
const areaChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'axis',
    axisPointer: { type: 'shadow' },
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' }
  },
  grid: {
    left: '3%',
    right: '4%',
    bottom: '15%',
    top: '10%',
    containLabel: true
  },
  xAxis: {
    type: 'category',
    data: statistics.value?.areaStats.map(s => s.name) || [],
    axisLabel: {
      color: 'rgba(255,255,255,0.7)',
      rotate: 30
    },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } }
  },
  yAxis: {
    type: 'value',
    name: '招录人数',
    nameTextStyle: { color: 'rgba(255,255,255,0.7)' },
    axisLabel: { color: 'rgba(255,255,255,0.7)' },
    axisLine: { lineStyle: { color: 'rgba(255,255,255,0.2)' } },
    splitLine: { lineStyle: { color: 'rgba(255,255,255,0.1)' } }
  },
  series: [{
    name: '招录人数',
    type: 'bar',
    data: statistics.value?.areaStats.map(s => s.recruits) || [],
    itemStyle: {
      color: {
        type: 'linear',
        x: 0, y: 0, x2: 0, y2: 1,
        colorStops: [
          { offset: 0, color: '#667eea' },
          { offset: 1, color: '#764ba2' }
        ]
      },
      borderRadius: [8, 8, 0, 0]
    },
    emphasis: {
      itemStyle: {
        color: {
          type: 'linear',
          x: 0, y: 0, x2: 0, y2: 1,
          colorStops: [
            { offset: 0, color: '#8e9eff' },
            { offset: 1, color: '#9a6dc2' }
          ]
        }
      }
    }
  }]
}))

// 学历要求饼图配置
const educationChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c}个 ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '5%',
    textStyle: { color: 'rgba(255,255,255,0.7)' }
  },
  series: [{
    name: '学历要求',
    type: 'pie',
    radius: ['35%', '65%'],
    center: ['50%', '45%'],
    avoidLabelOverlap: true,
    itemStyle: {
      borderRadius: 10,
      borderColor: 'rgba(10, 10, 18, 0.8)',
      borderWidth: 2
    },
    label: {
      show: true,
      color: 'rgba(255,255,255,0.8)',
      formatter: '{b}\n{d}%'
    },
    labelLine: {
      lineStyle: { color: 'rgba(255,255,255,0.3)' }
    },
    data: statistics.value?.educationStats.map((s, i) => ({
      name: s.name,
      value: s.value,
      itemStyle: {
        color: ['#00c6fb', '#f5af19', '#f093fb', '#38ef7d', '#667eea'][i % 5]
      }
    })) || []
  }]
}))

// 职位类别饼图配置
const categoryChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c}个 ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '5%',
    textStyle: { color: 'rgba(255,255,255,0.7)' }
  },
  series: [{
    name: '职位类别',
    type: 'pie',
    radius: ['35%', '65%'],
    center: ['50%', '45%'],
    roseType: 'radius',
    itemStyle: {
      borderRadius: 8,
      borderColor: 'rgba(10, 10, 18, 0.8)',
      borderWidth: 2
    },
    label: {
      show: true,
      color: 'rgba(255,255,255,0.8)'
    },
    data: statistics.value?.categoryStats.map((s, i) => ({
      name: s.name,
      value: s.value,
      itemStyle: {
        color: ['#667eea', '#f5576c', '#00c6fb', '#f5af19'][i % 4]
      }
    })) || []
  }]
}))

// 应届生分布饼图
const freshGradChartOption = computed(() => ({
  backgroundColor: 'transparent',
  tooltip: {
    trigger: 'item',
    backgroundColor: 'rgba(20, 20, 40, 0.9)',
    borderColor: 'rgba(255, 255, 255, 0.1)',
    textStyle: { color: '#fff' },
    formatter: '{b}: {c}个 ({d}%)'
  },
  legend: {
    orient: 'horizontal',
    bottom: '5%',
    textStyle: { color: 'rgba(255,255,255,0.7)' }
  },
  series: [{
    name: '应届生要求',
    type: 'pie',
    radius: ['40%', '70%'],
    center: ['50%', '45%'],
    itemStyle: {
      borderRadius: 10,
      borderColor: 'rgba(10, 10, 18, 0.8)',
      borderWidth: 2
    },
    label: {
      show: true,
      color: 'rgba(255,255,255,0.8)',
      formatter: '{b}\n{c}个\n({d}%)'
    },
    data: statistics.value?.freshGradStats.map((s, i) => ({
      name: s.name,
      value: s.value,
      itemStyle: {
        color: i === 0 ? '#38ef7d' : '#f5576c'
      }
    })) || []
  }]
}))

// 组件挂载时加载数据
onMounted(() => {
  loadData()
  loadAvailableFiles()
})
</script>

<style scoped>
.dashboard-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%);
}

.top-nav {
  position: sticky;
  top: 0;
  z-index: 100;
  margin-bottom: 0;
  border-radius: 0 !important;
  border-top: none !important;
  border-left: none !important;
  border-right: none !important;
}

.nav-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 1.5rem;
  gap: 1rem;
  flex-wrap: wrap;
}

.logo-section {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.logo-icon {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
}

.logo-icon svg {
  width: 20px;
  height: 20px;
}

.logo-text h1 {
  font-size: 1rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  line-height: 1.2;
}

.logo-text p {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  line-height: 1.2;
}

.nav-tabs {
  display: flex;
  gap: 0.5rem;
  flex: 1;
  justify-content: center;
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.4rem 1rem;
  border-radius: 6px;
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.7);
  text-decoration: none;
  transition: all 0.3s;
  font-weight: 500;
  font-size: 0.85rem;
}

.nav-tab:hover {
  background: rgba(255, 255, 255, 0.1);
  color: #fff;
}

.nav-tab.active {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #fff;
}

.nav-tab .icon {
  font-size: 1.1rem;
}

.header-stats {
  display: flex;
  gap: 0.75rem;
}

.mini-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0.3rem 0.6rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 6px;
}

.mini-stat .value {
  font-size: 1.1rem;
  font-weight: 700;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  line-height: 1.2;
}

.mini-stat .label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1.2;
}

.option-count {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
  font-weight: normal;
  margin-left: 0.25rem;
}

.page-content {
  width: 100%;
  padding: 1.5rem 2rem 2rem;
}

.upload-section,
.stats-section,
.filter-section,
.charts-section {
  margin-bottom: 2rem;
}

.file-selector {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  flex-wrap: wrap;
}

.selector-label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 500;
  white-space: nowrap;
}

.file-selector :deep(.n-select) {
  flex: 1;
  min-width: 200px;
}

.file-actions {
  display: flex;
  gap: 0.5rem;
}

.upload-to-public {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.upload-hint {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.85rem;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1.5rem;
}

.chart-container {
  height: 400px;
}

@media (max-width: 1200px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-tabs {
    width: 100%;
  }
  
  .stats-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>

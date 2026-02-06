<template>
  <div class="query-page">
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
            <p>职位查询</p>
          </div>
        </div>
        
        <div class="nav-tabs">
          <NuxtLink to="/" class="nav-tab">
            <NIcon :component="BarChartOutline" :size="18" />
            <span>数据概览</span>
          </NuxtLink>
          <NuxtLink to="/table" class="nav-tab">
            <NIcon :component="DocumentTextOutline" :size="18" />
            <span>职位列表</span>
          </NuxtLink>
          <NuxtLink to="/query" class="nav-tab active">
            <NIcon :component="SearchOutline" :size="18" />
            <span>职位查询</span>
          </NuxtLink>
        </div>

        <div class="header-stats">
          <div class="mini-stat">
            <span class="value">{{ queryHistory.length }}</span>
            <span class="label">查询历史</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="page-content">
      <!-- 查询区 -->
      <section class="query-section glass-card">
        <h3 class="section-title">
          <NIcon :component="SearchOutline" :size="20" />
          职位代码查询
        </h3>
        
        <div class="query-tips">
          <NAlert type="info" :bordered="false">
            <template #icon>
              <NIcon :component="InformationCircleOutline" />
            </template>
            <div>
              <strong>使用说明：</strong>
              <ul style="margin: 0.5rem 0 0 0; padding-left: 1.5rem;">
                <li>职位代码：可在职位列表中查看，格式如 260101001</li>
                <li>考试ID：默认为 2026001（贵州省2026年公务员考试），如需查询其他考试请修改</li>
                <li>查询结果会自动保存到历史记录，可随时刷新获取最新数据</li>
              </ul>
            </div>
          </NAlert>
        </div>
        
        <div class="query-form">
          <div class="form-row">
            <div class="form-item">
              <label>职位代码</label>
              <NInput 
                v-model:value="queryForm.positionCode" 
                placeholder="输入职位代码，如：260101001"
                clearable
                @keyup.enter="handleQuery"
              >
                <template #prefix>
                  <span style="opacity: 0.5">🔢</span>
                </template>
              </NInput>
            </div>
            <div class="form-item">
              <label>考试ID</label>
              <NInput 
                v-model:value="queryForm.examId" 
                placeholder="输入考试ID，如：2026001"
                clearable
                @keyup.enter="handleQuery"
              >
                <template #prefix>
                  <span style="opacity: 0.5">📋</span>
                </template>
              </NInput>
            </div>
          </div>
          
          <div class="form-actions">
            <NButton 
              type="primary" 
              @click="handleQuery"
              :loading="querying"
              :disabled="!queryForm.positionCode || !queryForm.examId"
            >
              <template #icon>
                <NIcon :component="SearchOutline" />
              </template>
              查询职位信息
            </NButton>
            <NButton 
              type="info"
              ghost
              @click="showBatchModal = true"
            >
              <template #icon>
                <NIcon :component="ListOutline" />
              </template>
              批量查询
            </NButton>
            <NButton 
              @click="handleClearHistory"
              :disabled="queryHistory.length === 0"
            >
              <template #icon>
                <NIcon :component="TrashOutline" />
              </template>
              清空历史
            </NButton>
          </div>
        </div>
      </section>

      <!-- 查询历史表格 -->
      <section class="history-section glass-card" v-if="queryHistory.length > 0">
        <div class="history-header">
          <h3 class="section-title">
            <NIcon :component="TimeOutline" :size="20" />
            查询历史
          </h3>
          <div class="history-actions">
            <NButton 
              type="info" 
              size="small"
              @click="handleRefreshAll"
              :loading="refreshingAll"
            >
              <template #icon>
                <NIcon :component="RefreshOutline" />
              </template>
              刷新全部
            </NButton>
          </div>
        </div>
        
        <NDataTable
          :columns="historyColumns"
          :data="queryHistory"
          :pagination="pagination"
          :bordered="false"
          striped
          size="small"
          :row-key="(row: QueryHistoryItem) => row.id"
          class="history-table"
        />
      </section>

      <!-- 空状态 -->
      <section class="empty-section glass-card" v-else>
        <NEmpty description="暂无查询历史，请输入职位代码开始查询">
          <template #icon>
            <NIcon :component="SearchOutline" :size="64" style="opacity: 0.3" />
          </template>
        </NEmpty>
      </section>
    </div>

    <!-- 批量查询弹窗 -->
    <NModal v-model:show="showBatchModal" preset="card" title="批量查询" style="width: 600px;">
      <div class="batch-query-content">
        <NAlert type="info" :bordered="false" style="margin-bottom: 1rem;">
          每行输入一个职位代码，支持批量查询多个职位
        </NAlert>
        <NInput
          v-model:value="batchCodes"
          type="textarea"
          placeholder="输入职位代码，每行一个&#10;例如：&#10;260101001&#10;260101002&#10;260101003"
          :rows="10"
        />
      </div>
      <template #footer>
        <div style="display: flex; justify-content: flex-end; gap: 0.5rem;">
          <NButton @click="showBatchModal = false">取消</NButton>
          <NButton 
            type="primary" 
            @click="handleBatchQuery"
            :loading="batchQuerying"
            :disabled="!batchCodes.trim()"
          >
            开始批量查询
          </NButton>
        </div>
      </template>
    </NModal>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useMessage, NButton, NIcon, NTag, NAlert, NModal } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import { 
  SearchOutline,
  BarChartOutline,
  DocumentTextOutline,
  RefreshOutline,
  TimeOutline,
  TrashOutline,
  InformationCircleOutline,
  ListOutline
} from '@vicons/ionicons5'

const message = useMessage()

interface QueryHistoryItem {
  id: string
  positionCode: string
  examId: string
  positionName?: string
  unitName?: string
  applicants?: number
  competitionRatio?: number
  lastQueryTime: string
  status: 'success' | 'error'
  errorMessage?: string
}

// 查询表单
const queryForm = reactive({
  positionCode: '',
  examId: '2026001' // 默认考试ID
})

// 查询状态
const querying = ref(false)
const refreshingAll = ref(false)
const batchQuerying = ref(false)

// 批量查询
const showBatchModal = ref(false)
const batchCodes = ref('')

// 查询历史
const queryHistory = ref<QueryHistoryItem[]>([])

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 20,
  showSizePicker: true,
  pageSizes: [10, 20, 50, 100],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

// 查询职位信息
async function handleQuery() {
  if (!queryForm.positionCode || !queryForm.examId) {
    message.warning('请输入职位代码和考试ID')
    return
  }

  querying.value = true

  try {
    const result = await $fetch('/api/position-detail', {
      method: 'POST',
      body: {
        zwdm: queryForm.positionCode,
        examid: queryForm.examId
      }
    }) as any

    if (result.success && result.data) {
      const data = result.data
      
      // 创建历史记录
      const historyItem: QueryHistoryItem = {
        id: `${queryForm.positionCode}-${Date.now()}`,
        positionCode: queryForm.positionCode,
        examId: queryForm.examId,
        positionName: data.zwmc || '-',
        unitName: data.dwmc || '-',
        applicants: data.bkrs || 0,
        competitionRatio: data.bkrs && data.zprs ? (data.bkrs / data.zprs) : 0,
        lastQueryTime: new Date().toLocaleString('zh-CN'),
        status: 'success'
      }

      // 检查是否已存在相同职位代码的记录
      const existingIndex = queryHistory.value.findIndex(
        item => item.positionCode === queryForm.positionCode && item.examId === queryForm.examId
      )

      if (existingIndex >= 0) {
        // 更新现有记录
        queryHistory.value[existingIndex] = historyItem
      } else {
        // 添加新记录到开头
        queryHistory.value.unshift(historyItem)
      }

      message.success('查询成功')
      
      // 保存到本地存储
      saveToLocalStorage()
    } else {
      throw new Error('查询失败')
    }
  } catch (error: any) {
    console.error('查询失败:', error)
    
    // 添加错误记录
    const errorItem: QueryHistoryItem = {
      id: `${queryForm.positionCode}-${Date.now()}`,
      positionCode: queryForm.positionCode,
      examId: queryForm.examId,
      lastQueryTime: new Date().toLocaleString('zh-CN'),
      status: 'error',
      errorMessage: error.data?.message || error.message || '查询失败'
    }
    
    queryHistory.value.unshift(errorItem)
    message.error(errorItem.errorMessage || '查询失败')
    
    saveToLocalStorage()
  } finally {
    querying.value = false
  }
}

// 刷新单个职位
async function handleRefreshItem(item: QueryHistoryItem) {
  const originalCode = queryForm.positionCode
  const originalExamId = queryForm.examId
  
  queryForm.positionCode = item.positionCode
  queryForm.examId = item.examId
  
  await handleQuery()
  
  queryForm.positionCode = originalCode
  queryForm.examId = originalExamId
}

// 刷新全部
async function handleRefreshAll() {
  if (queryHistory.value.length === 0) return
  
  refreshingAll.value = true
  
  for (const item of queryHistory.value) {
    queryForm.positionCode = item.positionCode
    queryForm.examId = item.examId
    await handleQuery()
    // 添加延迟避免请求过快
    await new Promise(resolve => setTimeout(resolve, 500))
  }
  
  refreshingAll.value = false
  message.success('全部刷新完成')
}

// 清空历史
function handleClearHistory() {
  queryHistory.value = []
  localStorage.removeItem('query-history')
  message.success('已清空查询历史')
}

// 批量查询
async function handleBatchQuery() {
  const codes = batchCodes.value
    .split('\n')
    .map(code => code.trim())
    .filter(code => code.length > 0)
  
  if (codes.length === 0) {
    message.warning('请输入至少一个职位代码')
    return
  }
  
  batchQuerying.value = true
  let successCount = 0
  let errorCount = 0
  
  for (const code of codes) {
    queryForm.positionCode = code
    
    try {
      await handleQuery()
      successCount++
      // 添加延迟避免请求过快
      await new Promise(resolve => setTimeout(resolve, 500))
    } catch (error) {
      errorCount++
    }
  }
  
  batchQuerying.value = false
  showBatchModal.value = false
  batchCodes.value = ''
  
  message.success(`批量查询完成：成功 ${successCount} 个，失败 ${errorCount} 个`)
}

// 保存到本地存储
function saveToLocalStorage() {
  try {
    localStorage.setItem('query-history', JSON.stringify(queryHistory.value))
  } catch (error) {
    console.error('保存到本地存储失败:', error)
  }
}

// 从本地存储加载
function loadFromLocalStorage() {
  try {
    const saved = localStorage.getItem('query-history')
    if (saved) {
      queryHistory.value = JSON.parse(saved)
    }
  } catch (error) {
    console.error('从本地存储加载失败:', error)
  }
}

// 表格列配置
const historyColumns = computed<DataTableColumns<QueryHistoryItem>>(() => [
  {
    title: '职位代码',
    key: 'positionCode',
    width: 120,
    fixed: 'left'
  },
  {
    title: '考试ID',
    key: 'examId',
    width: 100
  },
  {
    title: '职位名称',
    key: 'positionName',
    width: 180,
    ellipsis: { tooltip: true },
    render(row) {
      return row.positionName || '-'
    }
  },
  {
    title: '单位名称',
    key: 'unitName',
    width: 200,
    ellipsis: { tooltip: true },
    render(row) {
      return row.unitName || '-'
    }
  },
  {
    title: '报考人数',
    key: 'applicants',
    width: 100,
    render(row) {
      if (row.status === 'error') {
        return h('span', { style: 'color: rgba(255,255,255,0.4)' }, '-')
      }
      const count = row.applicants || 0
      return h('span', { 
        style: `color: ${count > 0 ? '#667eea' : 'rgba(255,255,255,0.4)'}; font-weight: 600` 
      }, count.toString())
    },
    sorter: (a, b) => (a.applicants || 0) - (b.applicants || 0)
  },
  {
    title: '竞争比例',
    key: 'competitionRatio',
    width: 100,
    render(row) {
      if (row.status === 'error') {
        return h('span', { style: 'color: rgba(255,255,255,0.4)' }, '-')
      }
      const ratio = row.competitionRatio || 0
      if (ratio === 0) {
        return h('span', { style: 'color: rgba(255,255,255,0.4)' }, '-')
      }
      const color = ratio > 50 ? '#f5576c' : ratio > 20 ? '#f5af19' : '#38ef7d'
      return h('span', { 
        style: `color: ${color}; font-weight: 600` 
      }, `${ratio.toFixed(2)}:1`)
    },
    sorter: (a, b) => (a.competitionRatio || 0) - (b.competitionRatio || 0)
  },
  {
    title: '上次查询时间',
    key: 'lastQueryTime',
    width: 160,
    sorter: (a, b) => new Date(a.lastQueryTime).getTime() - new Date(b.lastQueryTime).getTime()
  },
  {
    title: '状态',
    key: 'status',
    width: 100,
    render(row) {
      if (row.status === 'success') {
        return h(NTag, { type: 'success', size: 'small' }, { default: () => '成功' })
      } else {
        return h(NTag, { 
          type: 'error', 
          size: 'small',
          style: 'cursor: pointer'
        }, { 
          default: () => '失败',
          // @ts-ignore
          onClick: () => {
            if (row.errorMessage) {
              message.error(row.errorMessage)
            }
          }
        })
      }
    }
  },
  {
    title: '操作',
    key: 'actions',
    width: 100,
    fixed: 'right',
    render(row) {
      return h(NButton, {
        size: 'small',
        type: 'primary',
        ghost: true,
        onClick: () => handleRefreshItem(row)
      }, {
        default: () => '刷新',
        icon: () => h(NIcon, { component: RefreshOutline })
      })
    }
  }
])

// 组件挂载时加载历史
onMounted(() => {
  loadFromLocalStorage()
  
  // 从 URL 参数中读取职位代码
  const route = useRoute()
  if (route.query.code) {
    queryForm.positionCode = String(route.query.code)
  }
})
</script>

<style scoped>
.query-page {
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

.page-content {
  width: 100%;
  padding: 1.5rem 2rem 2rem;
}

.query-section,
.history-section,
.empty-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.1rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1.5rem 0;
}

.query-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.query-tips {
  margin-bottom: 1.5rem;
}

.query-tips ul {
  list-style-type: disc;
}

.query-tips li {
  margin: 0.25rem 0;
  color: rgba(255, 255, 255, 0.8);
}

.form-row {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1rem;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-item label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.8);
  font-weight: 500;
}

.form-actions {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.history-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.history-header .section-title {
  margin: 0;
}

.history-actions {
  display: flex;
  gap: 0.5rem;
}

.empty-section {
  padding: 3rem;
  text-align: center;
}

.batch-query-content {
  display: flex;
  flex-direction: column;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-tabs {
    width: 100%;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
}
</style>

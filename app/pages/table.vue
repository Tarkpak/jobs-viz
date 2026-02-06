<template>
  <div class="table-page">
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
            <p>职位详情列表</p>
          </div>
        </div>
        
        <div class="nav-tabs">
          <NuxtLink to="/" class="nav-tab">
            <NIcon :component="BarChartOutline" :size="18" />
            <span>数据概览</span>
          </NuxtLink>
          <NuxtLink to="/table" class="nav-tab active">
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
            <span class="value">{{ displayedDataCount }}</span>
            <span class="label">筛选结果</span>
          </div>
        </div>
      </div>
    </nav>

    <!-- 主内容区 -->
    <div class="page-content">
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
        <NResult status="info" title="暂无职位数据" description="请返回数据概览页面上传职位表 Excel 文件">
          <template #icon>
            <NIcon :component="DocumentTextOutline" :size="64" color="#667eea" />
          </template>
          <template #footer>
            <NButton type="primary" @click="$router.push('/')">
              返回数据概览
            </NButton>
          </template>
        </NResult>
      </div>

      <template v-else>
        <!-- 筛选区 -->
        <section class="filter-section glass-card">
          <div class="filter-header">
            <h3 class="section-title">
              <NIcon :component="FilterOutline" :size="20" />
              当前筛选条件
            </h3>
            <div class="filter-actions">
              <NButton text type="primary" @click="resetFilters" size="small">
                <template #icon>
                  <NIcon :component="RefreshOutline" />
                </template>
                清除所有筛选
              </NButton>
              <NTag type="info" size="medium">
                筛选结果: {{ displayedDataCount }} / {{ data.length }} 个职位
              </NTag>
            </div>
          </div>
          
          <!-- 预设筛选条件 -->
          <div class="preset-filters">
            <span class="preset-label">快速筛选：</span>
            <NButton 
              size="small" 
              @click="applyPreset('undergraduate-cs')"
              :type="isPresetActive('undergraduate-cs') ? 'primary' : 'default'"
            >
              本科 + 计算机相关
            </NButton>
            <NButton 
              size="small" 
              @click="applyPreset('undergraduate')"
              :type="isPresetActive('undergraduate') ? 'primary' : 'default'"
            >
              本科及以上
            </NButton>
            <NButton 
              size="small" 
              @click="applyPreset('fresh-graduate')"
              :type="isPresetActive('fresh-graduate') ? 'primary' : 'default'"
            >
              应届生可报
            </NButton>
            <NButton 
              size="small" 
              @click="applyPreset('no-experience')"
              :type="isPresetActive('no-experience') ? 'primary' : 'default'"
            >
              无工作经验要求
            </NButton>
          </div>
          
          <!-- 职位代码筛选 -->
          <div class="position-code-filter">
            <span class="filter-label">职位代码：</span>
            <NInput 
              v-model:value="filters.positionCode" 
              placeholder="输入职位代码进行筛选（支持模糊匹配）"
              clearable
              style="flex: 1; max-width: 400px;"
            >
              <template #prefix>
                <span style="opacity: 0.5">🔢</span>
              </template>
            </NInput>
          </div>
          
          <div v-if="hasActiveFilters" class="filter-tags">
            <div v-if="filters.positionCode" class="filter-tag-group">
              <span class="filter-label">职位代码：</span>
              <NTag 
                type="info" 
                closable 
                @close="filters.positionCode = ''"
              >
                {{ filters.positionCode }}
              </NTag>
            </div>
            <div v-if="filters.area.length > 0" class="filter-tag-group">
              <span class="filter-label">考区：</span>
              <NTag 
                v-for="item in filters.area" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('area', item)"
              >
                {{ item }}
              </NTag>
            </div>
            <div v-if="filters.education.length > 0" class="filter-tag-group">
              <span class="filter-label">学历要求：</span>
              <NTag 
                v-for="item in filters.education" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('education', item)"
              >
                {{ item }}
              </NTag>
            </div>
            <div v-if="filters.category.length > 0" class="filter-tag-group">
              <span class="filter-label">职位类别：</span>
              <NTag 
                v-for="item in filters.category" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('category', item)"
              >
                {{ item }}
              </NTag>
            </div>
            <div v-if="filters.unitType.length > 0" class="filter-tag-group">
              <span class="filter-label">机构性质：</span>
              <NTag 
                v-for="item in filters.unitType" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('unitType', item)"
              >
                {{ item }}
              </NTag>
            </div>
            <div v-if="filters.political.length > 0" class="filter-tag-group">
              <span class="filter-label">政治面貌：</span>
              <NTag 
                v-for="item in filters.political" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('political', item)"
              >
                {{ item }}
              </NTag>
            </div>
            <div v-if="filters.freshGrad.length > 0" class="filter-tag-group">
              <span class="filter-label">应届生要求：</span>
              <NTag 
                v-for="item in filters.freshGrad" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('freshGrad', item)"
              >
                {{ item === '是' ? '限应届生' : '不限' }}
              </NTag>
            </div>
            <div v-if="filters.major.length > 0" class="filter-tag-group">
              <span class="filter-label">专业要求：</span>
              <NTag 
                v-for="item in filters.major" 
                :key="item" 
                type="info" 
                closable 
                @close="removeFilter('major', item)"
              >
                {{ item }}
              </NTag>
            </div>
          </div>
          
          <div v-else class="no-filters">
            <NEmpty description="暂无筛选条件，请在表头点击筛选图标进行筛选" size="small">
              <template #icon>
                <NIcon :component="FilterOutline" :size="48" style="opacity: 0.3" />
              </template>
            </NEmpty>
          </div>
        </section>

        <!-- 职位列表 -->
        <section class="table-section glass-card">
          <div class="table-header">
            <h3 class="section-title">
              <NIcon :component="GridOutline" :size="20" />
              职位详情列表
            </h3>
            <div class="table-actions">
              <NButton type="primary" size="small" @click="exportData">
                <template #icon>
                  <NIcon :component="DownloadOutline" />
                </template>
                导出数据
              </NButton>
            </div>
          </div>
          
          <NDataTable
            ref="dataTableRef"
            :columns="tableColumns"
            :data="filteredData"
            :pagination="pagination"
            :bordered="false"
            :single-line="false"
            striped
            size="small"
            :row-key="(row: PositionData) => row.职位代码"
            :scroll-x="2300"
            :max-height="600"
            sticky-header
            class="data-table"
          />
        </section>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { h } from 'vue'
import { useMessage, NButton, NIcon, NInput, NCheckbox } from 'naive-ui'
import type { DataTableColumns } from 'naive-ui'
import type { PositionData } from '~/composables/usePoliceData'
import { 
  RefreshOutline,
  FilterOutline,
  DocumentTextOutline,
  DownloadOutline,
  GridOutline,
  BarChartOutline,
  SearchOutline
} from '@vicons/ionicons5'

const message = useMessage()

// 数据管理
const { data, loading, error, statistics, metadata, loadData } = usePoliceData()

// 筛选状态（改为数组支持多选）
const filters = reactive({
  area: [] as string[],
  education: [] as string[],
  category: [] as string[],
  unitType: [] as string[],
  political: [] as string[],
  freshGrad: [] as string[],
  major: [] as string[], // 专业要求筛选
  positionCode: '', // 职位代码筛选
  keyword: ''
})

// 表格筛选状态（用于表头筛选）
const tableFilters = ref<Record<string, any>>({})

// 表格实际显示的数据数量（用于顶部显示）
const displayedDataCount = ref(0)

// 为每个筛选列维护搜索框的输入状态
const filterSearchStates = reactive<Record<string, string>>({})

// 同步智能筛选到表格筛选
let isUpdatingFromTable = false
watch(filters, (newFilters) => {
  if (isUpdatingFromTable) return
  
  const newTableFilters: Record<string, any> = {}
  
  if (newFilters.area.length > 0) {
    newTableFilters['考区'] = newFilters.area
  }
  if (newFilters.education.length > 0) {
    newTableFilters['学历要求'] = newFilters.education
  }
  if (newFilters.category.length > 0) {
    newTableFilters['所属大类'] = newFilters.category
  }
  if (newFilters.unitType.length > 0) {
    newTableFilters['机构性质'] = newFilters.unitType
  }
  if (newFilters.political.length > 0) {
    newTableFilters['政治面貌要求'] = newFilters.political
  }
  if (newFilters.freshGrad.length > 0) {
    newTableFilters['定向_2026届毕业生'] = newFilters.freshGrad
  }
  if (newFilters.major.length > 0) {
    newTableFilters['专业要求_本科'] = newFilters.major
  }
  
  tableFilters.value = newTableFilters
}, { deep: true })

// 处理表格筛选变化（同步到智能筛选）
function handleTableFiltersChange(newFilters: Record<string, any>) {
  isUpdatingFromTable = true
  tableFilters.value = newFilters
  
  console.log('表格筛选变化:', newFilters)
  
  // 同步到智能筛选
  filters.area = newFilters['考区'] || []
  filters.education = newFilters['学历要求'] || []
  filters.category = newFilters['所属大类'] || []
  filters.unitType = newFilters['机构性质'] || []
  filters.political = newFilters['政治面貌要求'] || []
  filters.freshGrad = newFilters['定向_2026届毕业生'] || []
  filters.major = newFilters['专业要求_本科'] || []
  
  console.log('同步后的filters.major:', filters.major)
  
  nextTick(() => {
    isUpdatingFromTable = false
  })
}

// 分页配置
const pagination = reactive({
  page: 1,
  pageSize: 50,
  showSizePicker: true,
  pageSizes: [20, 50, 100, 200],
  onChange: (page: number) => {
    pagination.page = page
  },
  onUpdatePageSize: (pageSize: number) => {
    pagination.pageSize = pageSize
    pagination.page = 1
  }
})

// 计算属性 - 筛选后的数据
const filteredData = computed(() => {
  let result = data.value

  if (filters.area.length > 0) {
    result = result.filter(item => filters.area.includes(item.考区))
  }
  if (filters.education.length > 0) {
    result = result.filter(item => filters.education.includes(item.学历要求))
  }
  if (filters.category.length > 0) {
    result = result.filter(item => filters.category.includes(item.所属大类))
  }
  if (filters.unitType.length > 0) {
    result = result.filter(item => filters.unitType.includes(item.机构性质))
  }
  if (filters.political.length > 0) {
    result = result.filter(item => filters.political.includes(item.政治面貌要求))
  }
  if (filters.freshGrad.length > 0) {
    result = result.filter(item => filters.freshGrad.includes(item.定向_2026届毕业生))
  }
  if (filters.major.length > 0) {
    console.log('应用专业筛选，filters.major:', filters.major)
    result = result.filter(item => {
      // 专业要求可能包含多个专业，用逗号、分号或顿号分隔
      const majors = item.专业要求_本科.split(/[,，;；、]/).map(m => m.trim())
      const matched = filters.major.some(filterMajor => 
        majors.some(major => major.includes(filterMajor) || filterMajor.includes(major))
      )
      return matched
    })
    console.log('专业筛选后的结果数量:', result.length)
  }
  if (filters.positionCode) {
    const code = filters.positionCode.trim()
    result = result.filter(item => item.职位代码.includes(code))
  }
  if (filters.keyword) {
    const kw = filters.keyword.toLowerCase()
    result = result.filter(item => {
      const searchFields = [
        item.单位名称,
        item.职位名称,
        item.职位简介,
        item.专业要求_本科,
        item.专业要求_研究生,
        item.其他报考条件
      ].join(' ').toLowerCase()
      return searchFields.includes(kw)
    })
  }

  return result
})

// 监听 filteredData 变化，更新显示的数据数量
watch(filteredData, (newData) => {
  displayedDataCount.value = newData.length
}, { immediate: true })

// 专业要求选项（需要特殊处理，因为一个职位可能有多个专业）
const majorOptions = computed(() => {
  const majorsSet = new Set<string>()
  data.value.forEach(item => {
    if (item.专业要求_本科 && item.专业要求_本科.trim() && item.专业要求_本科 !== '不限' && item.专业要求_本科 !== '无限制') {
      // 按逗号、分号、顿号分割专业
      const majors = item.专业要求_本科.split(/[,，;；、]/).map(m => m.trim())
      majors.forEach(major => {
        if (major && major !== '不限' && major !== '无限制') {
          majorsSet.add(major)
        }
      })
    }
  })
  return Array.from(majorsSet).sort().map(value => ({ label: value, value }))
})

// 重置筛选
function resetFilters() {
  filters.area = []
  filters.education = []
  filters.category = []
  filters.unitType = []
  filters.political = []
  filters.freshGrad = []
  filters.major = []
  filters.positionCode = ''
  filters.keyword = ''
  tableFilters.value = {}
}

// 移除单个筛选条件
function removeFilter(key: keyof typeof filters, value: string) {
  if (Array.isArray(filters[key])) {
    const index = (filters[key] as string[]).indexOf(value)
    if (index > -1) {
      (filters[key] as string[]).splice(index, 1)
    }
  }
}

// 检查是否有激活的筛选条件
const hasActiveFilters = computed(() => {
  return filters.area.length > 0 ||
    filters.education.length > 0 ||
    filters.category.length > 0 ||
    filters.unitType.length > 0 ||
    filters.political.length > 0 ||
    filters.freshGrad.length > 0 ||
    filters.major.length > 0 ||
    filters.positionCode.trim() !== ''
})

// 预设筛选条件
interface PresetFilters {
  education?: string[]
  major?: string[]
  freshGrad?: string[]
}

interface Preset {
  name: string
  filters: PresetFilters
}

const presets: Record<string, Preset> = {
  'undergraduate-cs': {
    name: '本科 + 计算机相关',
    filters: {
      education: ['本科', '本科及以上', '本科或硕士研究生', '本科或博士研究生'],
      major: []
    }
  },
  'undergraduate': {
    name: '本科及以上',
    filters: {
      education: ['本科', '本科及以上', '本科或硕士研究生', '本科或博士研究生', '硕士研究生', '硕士研究生及以上', '博士研究生']
    }
  },
  'fresh-graduate': {
    name: '应届生可报',
    filters: {
      freshGrad: ['是']
    }
  },
  'no-experience': {
    name: '无工作经验要求',
    filters: {}
  }
}

// 应用预设筛选
function applyPreset(presetKey: string) {
  const preset = presets[presetKey]
  if (!preset) return
  
  // 先重置所有筛选
  resetFilters()
  
  // 应用预设筛选
  if (presetKey === 'undergraduate-cs') {
    // 本科 + 计算机相关
    filters.education = preset.filters.education || []
    
    // 查找所有计算机相关专业
    const csRelatedKeywords = ['计算机', '软件', '网络', '信息', '数据', '人工智能', 'AI', '大数据', '云计算', '网络安全', '信息安全']
    const csMajors = majorOptions.value
      .filter(option => csRelatedKeywords.some(keyword => option.label.includes(keyword)))
      .map(option => option.value)
    
    filters.major = csMajors
  } else if (presetKey === 'undergraduate') {
    // 本科及以上
    filters.education = preset.filters.education || []
  } else if (presetKey === 'fresh-graduate') {
    // 应届生可报
    filters.freshGrad = preset.filters.freshGrad || []
  } else if (presetKey === 'no-experience') {
    // 无工作经验要求 - 通过关键词筛选实现
    filters.keyword = '无限制'
  }
}

// 检查预设是否激活
function isPresetActive(presetKey: string): boolean {
  if (presetKey === 'undergraduate-cs') {
    // 检查是否有学历筛选且有专业筛选
    return filters.education.length > 0 && filters.major.length > 0
  } else if (presetKey === 'undergraduate') {
    return filters.education.length > 0 && filters.major.length === 0
  } else if (presetKey === 'fresh-graduate') {
    return filters.freshGrad.includes('是')
  } else if (presetKey === 'no-experience') {
    return filters.keyword === '无限制'
  }
  return false
}

// 导出数据
function exportData() {
  message.info('导出功能开发中...')
}

// 生成唯一值的筛选选项
const getUniqueFilterOptions = (key: keyof PositionData) => {
  const uniqueValues = new Set<string>()
  data.value.forEach(item => {
    const value = item[key]
    if (value && String(value).trim()) {
      uniqueValues.add(String(value))
    }
  })
  return Array.from(uniqueValues)
    .sort()
    .map(value => ({ label: value, value }))
}

// 创建带搜索功能的筛选菜单（当选项超过20个时）
const createFilterMenu = (columnKey: keyof PositionData) => {
  return () => {
    const options = getUniqueFilterOptions(columnKey)
    
    // 如果选项少于20个，返回null使用默认筛选
    if (options.length <= 20) {
      return null
    }
    
    // 初始化搜索状态
    if (!(columnKey in filterSearchStates)) {
      filterSearchStates[columnKey] = ''
    }
    
    // 根据搜索状态过滤选项
    const searchText = filterSearchStates[columnKey] || ''
    const filtered = searchText
      ? options.filter(opt => 
          (opt.label || '').toLowerCase().includes(searchText.toLowerCase())
        )
      : options
    
    return h('div', { style: 'padding: 8px; min-width: 200px;' }, [
      h(NInput, {
        value: filterSearchStates[columnKey],
        'onUpdate:value': (v: string) => { 
          filterSearchStates[columnKey] = v
        },
        placeholder: `搜索... (共${options.length}项)`,
        clearable: true,
        size: 'small',
        style: 'margin-bottom: 8px;'
      }),
      h('div', { 
        style: 'max-height: 300px; overflow-y: auto;' 
      },
        filtered.length > 0 
          ? filtered.map(option => 
              h('div', {
                style: 'display: flex; align-items: center; margin: 4px 0; white-space: nowrap;'
              }, [
                h(NCheckbox, {
                  checked: tableFilters.value[columnKey]?.includes(option.value),
                  'onUpdate:checked': (checked: boolean) => {
                    const current = tableFilters.value[columnKey] || []
                    const newFilters = {
                      ...tableFilters.value,
                      [columnKey]: checked 
                        ? [...current, option.value]
                        : current.filter((v: any) => v !== option.value)
                    }
                    tableFilters.value = newFilters
                    // 触发同步到智能筛选
                    handleTableFiltersChange(newFilters)
                  }
                }),
                h('span', { 
                  style: 'margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;',
                  title: option.label
                }, option.label)
              ])
            )
          : [h('div', { 
              style: 'padding: 12px; text-align: center; color: rgba(255,255,255,0.5);' 
            }, '无匹配结果')]
      )
    ])
  }
}

// 表格列配置
const tableColumns = computed<DataTableColumns<PositionData>>(() => [
  {
    title: '序号',
    key: '序号',
    width: 60,
    fixed: 'left',
    sorter: (a, b) => a.序号 - b.序号
  },
  {
    title: '报考人数',
    key: '报考人数',
    width: 90,
    render(row) {
      const count = row.报考人数 || 0
      if (count === 0) {
        return h('span', { style: 'color: rgba(255,255,255,0.4)' }, '-')
      }
      return h('span', { style: 'color: #667eea; font-weight: 600' }, count.toString())
    },
    sorter: (a, b) => (a.报考人数 || 0) - (b.报考人数 || 0)
  },
  {
    title: '竞争比例',
    key: '竞争比例',
    width: 90,
    render(row) {
      const ratio = row.竞争比例 || 0
      if (ratio === 0) {
        return h('span', { style: 'color: rgba(255,255,255,0.4)' }, '-')
      }
      const color = ratio > 50 ? '#f5576c' : ratio > 20 ? '#f5af19' : '#38ef7d'
      return h('span', { style: `color: ${color}; font-weight: 600` }, `${ratio.toFixed(2)}:1`)
    },
    sorter: (a, b) => (a.竞争比例 || 0) - (b.竞争比例 || 0)
  },
  {
    title: '考区',
    key: '考区',
    width: 100,
    filterOptions: getUniqueFilterOptions('考区'),
    renderFilterMenu: createFilterMenu('考区'),
    sorter: 'default'
  },
  {
    title: '单位名称',
    key: '单位名称',
    width: 200,
    ellipsis: { tooltip: true },
    filterOptions: getUniqueFilterOptions('单位名称'),
    renderFilterMenu: createFilterMenu('单位名称'),
    filter(value, row) {
      return row.单位名称 === value
    },
    sorter: 'default'
  },
  {
    title: '机构性质',
    key: '机构性质',
    width: 100,
    filterOptions: getUniqueFilterOptions('机构性质'),
    filter(value, row) {
      return row.机构性质 === value
    },
    sorter: 'default'
  },
  {
    title: '职位代码',
    key: '职位代码',
    width: 150,
    render(row) {
      return h('div', { style: 'display: flex; align-items: center; gap: 0.5rem;' }, [
        h('span', row.职位代码),
        h(NButton, {
          size: 'tiny',
          type: 'primary',
          ghost: true,
          onClick: () => {
            // 跳转到查询页面并填充职位代码
            navigateTo(`/query?code=${row.职位代码}`)
          }
        }, {
          default: () => '查询',
          icon: () => h(NIcon, { component: SearchOutline, size: 14 })
        })
      ])
    },
    sorter: 'default'
  },
  {
    title: '职位名称',
    key: '职位名称',
    width: 180,
    ellipsis: { tooltip: true },
    filterOptions: getUniqueFilterOptions('职位名称'),
    renderFilterMenu: createFilterMenu('职位名称'),
    filter(value, row) {
      return row.职位名称 === value
    },
    sorter: 'default'
  },
  {
    title: '所属大类',
    key: '所属大类',
    width: 120,
    filterOptions: getUniqueFilterOptions('所属大类'),
    filter(value, row) {
      return row.所属大类 === value
    },
    sorter: 'default'
  },
  {
    title: '所属小类',
    key: '所属小类',
    width: 150,
    ellipsis: { tooltip: true },
    filterOptions: getUniqueFilterOptions('所属小类'),
    renderFilterMenu: createFilterMenu('所属小类'),
    filter(value, row) {
      return row.所属小类 === value
    },
    sorter: 'default'
  },
  {
    title: '招录人数',
    key: '招录人数',
    width: 90,
    sorter: (a, b) => a.招录人数 - b.招录人数,
    filterOptions: Array.from(new Set(data.value.map(item => item.招录人数)))
      .sort((a, b) => a - b)
      .map(value => ({ label: String(value), value })),
    filter(value, row) {
      return row.招录人数 === value
    }
  },
  {
    title: '学历要求',
    key: '学历要求',
    width: 100,
    filterOptions: getUniqueFilterOptions('学历要求'),
    filter(value, row) {
      return row.学历要求 === value
    },
    sorter: 'default'
  },
  {
    title: '学位要求',
    key: '学位要求',
    width: 100,
    filterOptions: getUniqueFilterOptions('学位要求'),
    filter(value, row) {
      return row.学位要求 === value
    },
    sorter: 'default'
  },
  {
    title: '专业要求(本科)',
    key: '专业要求_本科',
    width: 200,
    ellipsis: { tooltip: true },
    filterOptions: majorOptions.value,
    renderFilterMenu: () => {
      const options = majorOptions.value
      const columnKey = '专业要求_本科'
      
      // 初始化搜索状态
      if (!(columnKey in filterSearchStates)) {
        filterSearchStates[columnKey] = ''
      }
      
      // 根据搜索状态过滤选项
      const searchText = filterSearchStates[columnKey] || ''
      const filtered = searchText
        ? options.filter(opt => 
            (opt.label || '').toLowerCase().includes(searchText.toLowerCase())
          )
        : options
      
      return h('div', { style: 'padding: 8px; min-width: 200px;' }, [
        h(NInput, {
          value: filterSearchStates[columnKey],
          'onUpdate:value': (v: string) => { 
            filterSearchStates[columnKey] = v
          },
          placeholder: `搜索专业... (共${options.length}项)`,
          clearable: true,
          size: 'small',
          style: 'margin-bottom: 8px;'
        }),
        h('div', { 
          style: 'max-height: 300px; overflow-y: auto;' 
        },
          filtered.length > 0 
            ? filtered.map(option => 
                h('div', {
                  style: 'display: flex; align-items: center; margin: 4px 0; white-space: nowrap;'
                }, [
                  h(NCheckbox, {
                    checked: tableFilters.value[columnKey]?.includes(option.value),
                    'onUpdate:checked': (checked: boolean) => {
                      const current = tableFilters.value[columnKey] || []
                      const newFilters = {
                        ...tableFilters.value,
                        [columnKey]: checked 
                          ? [...current, option.value]
                          : current.filter((v: any) => v !== option.value)
                      }
                      tableFilters.value = newFilters
                      // 触发同步到智能筛选
                      handleTableFiltersChange(newFilters)
                    }
                  }),
                  h('span', { 
                    style: 'margin-left: 8px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 180px;',
                    title: option.label
                  }, option.label)
                ])
              )
            : [h('div', { 
                style: 'padding: 12px; text-align: center; color: rgba(255,255,255,0.5);' 
              }, '无匹配结果')]
        )
      ])
    },
    filter(value, row) {
      const majors = row.专业要求_本科.split(/[,，;；、]/).map(m => m.trim())
      const filterValue = String(value)
      return majors.some(major => major.includes(filterValue) || filterValue.includes(major))
    },
    sorter: 'default'
  },
  {
    title: '政治面貌',
    key: '政治面貌要求',
    width: 100,
    filterOptions: getUniqueFilterOptions('政治面貌要求'),
    filter(value, row) {
      return row.政治面貌要求 === value
    },
    sorter: 'default'
  },
  {
    title: '应届生',
    key: '定向_2026届毕业生',
    width: 80,
    render(row) {
      return row.定向_2026届毕业生 === '是' ? '✅ 是' : '否'
    },
    filterOptions: [
      { label: '限应届生', value: '是' },
      { label: '不限', value: '否' }
    ],
    filter(value, row) {
      return row.定向_2026届毕业生 === value
    },
    sorter: 'default'
  },
  {
    title: '服务基层',
    key: '定向_服务基层项目人员',
    width: 90,
    render(row) {
      return row.定向_服务基层项目人员 === '是' ? '✅ 是' : '否'
    },
    filterOptions: [
      { label: '是', value: '是' },
      { label: '否', value: '否' }
    ],
    filter(value, row) {
      return row.定向_服务基层项目人员 === value
    },
    sorter: 'default'
  },
  {
    title: '退役军人',
    key: '定向_退役军人',
    width: 90,
    render(row) {
      return row.定向_退役军人 === '是' ? '✅ 是' : '否'
    },
    filterOptions: [
      { label: '是', value: '是' },
      { label: '否', value: '否' }
    ],
    filter(value, row) {
      return row.定向_退役军人 === value
    },
    sorter: 'default'
  },
  {
    title: '少数民族',
    key: '定向_少数民族',
    width: 90,
    render(row) {
      return row.定向_少数民族 === '是' ? '✅ 是' : '否'
    },
    filterOptions: [
      { label: '是', value: '是' },
      { label: '否', value: '否' }
    ],
    filter(value, row) {
      return row.定向_少数民族 === value
    },
    sorter: 'default'
  },
  {
    title: '基层工作经历',
    key: '基层工作经历时间',
    width: 120,
    ellipsis: { tooltip: true },
    filterOptions: getUniqueFilterOptions('基层工作经历时间'),
    filter(value, row) {
      return row.基层工作经历时间 === value
    },
    sorter: 'default'
  },
  {
    title: '其他条件',
    key: '其他报考条件',
    width: 250,
    ellipsis: { tooltip: true },
    sorter: 'default'
  },
  {
    title: '咨询电话',
    key: '单位咨询电话',
    width: 130,
    sorter: 'default'
  }
]);

// 组件挂载时加载数据
onMounted(async () => {
  await loadData()
})
</script>

<style scoped>
.table-page {
  min-height: 100vh;
  width: 100%;
  background: linear-gradient(135deg, #0a0a12 0%, #1a1a2e 100%);
}

/* 表格表头不折行 */
.data-table :deep(.n-data-table-th) {
  white-space: nowrap;
}

.data-table :deep(.n-data-table-th .n-data-table-th__title) {
  white-space: nowrap;
}

/* 表头吸顶样式优化 */
.data-table :deep(.n-data-table-base-table-header) {
  background: rgba(26, 26, 46, 0.95);
  backdrop-filter: blur(10px);
}

.data-table :deep(.n-data-table-th) {
  background: rgba(26, 26, 46, 0.95) !important;
  backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
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
  line-height: 1;
}

.mini-stat .label {
  font-size: 0.65rem;
  color: rgba(255, 255, 255, 0.6);
  line-height: 1;
  margin-top: 2px;
}

.page-content {
  width: 100%;
  padding: 1.5rem 2rem 2rem;
}

.filter-section {
  margin-bottom: 2rem;
  padding: 1.5rem;
}

.filter-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.filter-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  margin: 0;
}

.preset-filters {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.preset-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
}

.position-code-filter {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(102, 126, 234, 0.05);
  border-radius: 8px;
  margin-bottom: 1.5rem;
  border: 1px solid rgba(102, 126, 234, 0.2);
}

.position-code-filter .filter-label {
  white-space: nowrap;
  min-width: auto;
}

.filter-tags {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.filter-tag-group {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.filter-label {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  font-weight: 500;
  min-width: 80px;
}

.no-filters {
  padding: 2rem;
  text-align: center;
}

.table-section {
  padding: 1.5rem;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
  gap: 1rem;
}

.table-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.loading-container,
.error-container,
.no-data-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  gap: 1rem;
}

@media (max-width: 768px) {
  .nav-content {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-tabs {
    width: 100%;
  }
  
  .filter-item.search {
    grid-column: span 1;
  }
}
</style>

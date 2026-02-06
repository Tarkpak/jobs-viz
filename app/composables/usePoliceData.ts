import type { Ref } from 'vue'

export interface PositionData {
    序号: number
    考区: string
    单位名称: string
    机构性质: string
    单位地址: string
    单位咨询电话: string
    职位代码: string
    职位名称: string
    所属大类: string
    所属小类: string
    职位简介: string
    招录人数: number
    学历要求: string
    学位要求: string
    专业要求_大专: string
    专业要求_本科: string
    专业要求_研究生: string
    政治面貌要求: string
    定向_服务基层项目人员: string
    定向_优秀村干部: string
    定向_驻村第一书记: string
    定向_少数民族: string
    定向_2026届毕业生: string
    定向_退役军人: string
    基层工作经历时间: string
    其他报考条件: string
    职位工作性质及说明: string
    考试类型: 'gwy' | 'sydw' // 新增：考试类型
    // 报名统计字段
    报考人数?: number
    竞争比例?: number
    统计获取成功?: boolean
}

export interface DataMetadata {
    filename: string
    uploadTime: string
    count: number
    source: 'none' | 'uploaded'
    examType?: 'gwy' | 'sydw' // 新增：考试类型
    statsUpdateTime?: string
    statsSuccessCount?: number
}

export interface Statistics {
    totalPositions: number
    totalRecruits: number
    areaStats: { name: string; value: number; recruits: number }[]
    educationStats: { name: string; value: number }[]
    categoryStats: { name: string; value: number }[]
    unitTypeStats: { name: string; value: number }[]
    politicalStats: { name: string; value: number }[]
    freshGradStats: { name: string; value: number }[]
}

export function usePoliceData() {
    const data: Ref<PositionData[]> = ref([])
    const loading = ref(false)
    const uploading = ref(false)
    const error: Ref<string | null> = ref(null)
    const statistics: Ref<Statistics | null> = ref(null)
    const metadata: Ref<DataMetadata | null> = ref(null)

    // 从 API 加载数据
    async function loadData() {
        loading.value = true
        error.value = null

        try {
            const response = await $fetch('/api/positions')

            if (response.success) {
                data.value = response.data
                metadata.value = response.metadata
                calculateStatistics()
            } else {
                throw new Error('获取数据失败')
            }
        } catch (e: any) {
            error.value = e.data?.message || e.message || '加载数据失败'
            console.error('Error loading data:', e)
        } finally {
            loading.value = false
        }
    }

    // 上传 Excel 文件
    async function uploadFile(file: File): Promise<{ success: boolean; message: string }> {
        uploading.value = true
        error.value = null

        try {
            const formData = new FormData()
            formData.append('file', file)

            const response = await $fetch('/api/upload', {
                method: 'POST',
                body: formData
            })

            if (response.success) {
                // 重新加载数据
                await loadData()
                return { success: true, message: response.message }
            } else {
                throw new Error('上传失败')
            }
        } catch (e: any) {
            const message = e.data?.message || e.message || '上传文件失败'
            error.value = message
            console.error('Error uploading file:', e)
            return { success: false, message }
        } finally {
            uploading.value = false
        }
    }

    // 清除上传的数据
    async function clearData(): Promise<{ success: boolean; message: string }> {
        try {
            const response = await $fetch('/api/clear', {
                method: 'DELETE'
            })

            if (response.success) {
                await loadData()
                return { success: true, message: response.message }
            } else {
                throw new Error('清除失败')
            }
        } catch (e: any) {
            const message = e.data?.message || e.message || '清除数据失败'
            return { success: false, message }
        }
    }

    function calculateStatistics() {
        if (data.value.length === 0) {
            statistics.value = null
            return
        }

        const stats: Statistics = {
            totalPositions: data.value.length,
            totalRecruits: data.value.reduce((sum: number, item: PositionData) => sum + (Number(item.招录人数) || 0), 0),
            areaStats: [],
            educationStats: [],
            categoryStats: [],
            unitTypeStats: [],
            politicalStats: [],
            freshGradStats: []
        }

        // 按考区统计
        const areaMap = new Map<string, { count: number; recruits: number }>()
        data.value.forEach((item: PositionData) => {
            const area = item.考区 || '未知'
            const current = areaMap.get(area) || { count: 0, recruits: 0 }
            current.count++
            current.recruits += Number(item.招录人数) || 0
            areaMap.set(area, current)
        })
        stats.areaStats = Array.from(areaMap.entries())
            .map(([name, { count, recruits }]) => ({ name, value: count, recruits }))
            .sort((a, b) => b.recruits - a.recruits)

        // 按学历统计
        const eduMap = new Map<string, number>()
        data.value.forEach((item: PositionData) => {
            const edu = item.学历要求 || '未知'
            eduMap.set(edu, (eduMap.get(edu) || 0) + 1)
        })
        stats.educationStats = Array.from(eduMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        // 按所属大类统计
        const catMap = new Map<string, number>()
        data.value.forEach((item: PositionData) => {
            const cat = item.所属大类 || '未知'
            catMap.set(cat, (catMap.get(cat) || 0) + 1)
        })
        stats.categoryStats = Array.from(catMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        // 按机构性质统计
        const unitMap = new Map<string, number>()
        data.value.forEach((item: PositionData) => {
            const unit = item.机构性质 || '未知'
            unitMap.set(unit, (unitMap.get(unit) || 0) + 1)
        })
        stats.unitTypeStats = Array.from(unitMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        // 按政治面貌要求统计
        const polMap = new Map<string, number>()
        data.value.forEach((item: PositionData) => {
            const pol = item.政治面貌要求 || '无限制'
            polMap.set(pol, (polMap.get(pol) || 0) + 1)
        })
        stats.politicalStats = Array.from(polMap.entries())
            .map(([name, value]) => ({ name, value }))
            .sort((a, b) => b.value - a.value)

        // 应届生统计
        const freshMap = new Map<string, number>()
        data.value.forEach((item: PositionData) => {
            const fresh = item.定向_2026届毕业生 === '是' ? '限应届生' : '不限'
            freshMap.set(fresh, (freshMap.get(fresh) || 0) + 1)
        })
        stats.freshGradStats = Array.from(freshMap.entries())
            .map(([name, value]) => ({ name, value }))

        statistics.value = stats
    }

    // 筛选数据
    function filterData(filters: {
        考区?: string
        学历要求?: string
        所属大类?: string
        职位代码?: string
        keyword?: string
    }): PositionData[] {
        return data.value.filter((item: PositionData) => {
            if (filters.考区 && item.考区 !== filters.考区) return false
            if (filters.学历要求 && item.学历要求 !== filters.学历要求) return false
            if (filters.所属大类 && item.所属大类 !== filters.所属大类) return false
            if (filters.职位代码 && !item.职位代码.includes(filters.职位代码.trim())) return false
            if (filters.keyword) {
                const kw = filters.keyword.toLowerCase()
                const searchFields = [
                    item.单位名称,
                    item.职位名称,
                    item.职位简介,
                    item.专业要求_本科,
                    item.专业要求_研究生,
                    item.其他报考条件
                ].join(' ').toLowerCase()
                if (!searchFields.includes(kw)) return false
            }
            return true
        })
    }

    return {
        data,
        loading,
        uploading,
        error,
        statistics,
        metadata,
        loadData,
        uploadFile,
        clearData,
        filterData
    }
}

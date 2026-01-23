import type { Ref } from 'vue'

export interface PositionStats {
    zwdm: string // 职位代码
    bkrs: number // 报考人数
    jzbl: number // 竞争比例
    zprs: number // 招录人数
    lastUpdate: number // 最后更新时间戳
}

// 全局缓存
const statsCache: Ref<Map<string, PositionStats>> = ref(new Map())
const loadingStats: Ref<Set<string>> = ref(new Set())

export function usePositionStats() {
    const examid = '796a0fa25f7c9ffb' // 2026年度考试ID

    // 获取单个职位统计
    async function getPositionStats(zwdm: string, forceRefresh = false): Promise<PositionStats | null> {
        // 如果不强制刷新且缓存存在，返回缓存
        if (!forceRefresh && statsCache.value.has(zwdm)) {
            return statsCache.value.get(zwdm)!
        }

        // 如果正在加载，等待
        if (loadingStats.value.has(zwdm)) {
            return new Promise((resolve) => {
                const checkInterval = setInterval(() => {
                    if (!loadingStats.value.has(zwdm)) {
                        clearInterval(checkInterval)
                        resolve(statsCache.value.get(zwdm) || null)
                    }
                }, 100)
            })
        }

        // 开始加载
        loadingStats.value.add(zwdm)

        try {
            const result = await $fetch('/api/position-detail', {
                method: 'POST',
                body: { zwdm, examid }
            })

            if (result.success && result.data) {
                const data = result.data as any
                const stats: PositionStats = {
                    zwdm,
                    bkrs: data.bkrs || 0,
                    jzbl: data.zprs ? (data.bkrs || 0) / data.zprs : 0,
                    zprs: data.zprs || 0,
                    lastUpdate: Date.now()
                }
                statsCache.value.set(zwdm, stats)
                return stats
            }
            return null
        } catch (error) {
            console.error(`获取职位 ${zwdm} 统计失败:`, error)
            return null
        } finally {
            loadingStats.value.delete(zwdm)
        }
    }

    // 批量获取职位统计
    async function getBatchPositionStats(zwdmList: string[], forceRefresh = false): Promise<Map<string, PositionStats>> {
        const results = new Map<string, PositionStats>()
        
        // 并发请求，但限制并发数为 5
        const batchSize = 5
        for (let i = 0; i < zwdmList.length; i += batchSize) {
            const batch = zwdmList.slice(i, i + batchSize)
            const promises = batch.map(zwdm => getPositionStats(zwdm, forceRefresh))
            const batchResults = await Promise.all(promises)
            
            batchResults.forEach((stats, index) => {
                if (stats && batch[index]) {
                    results.set(batch[index], stats)
                }
            })
        }
        
        return results
    }

    // 清除缓存
    function clearCache() {
        statsCache.value.clear()
    }

    // 清除指定职位的缓存
    function clearPositionCache(zwdm: string) {
        statsCache.value.delete(zwdm)
    }

    // 获取缓存的统计数据
    function getCachedStats(zwdm: string): PositionStats | null {
        return statsCache.value.get(zwdm) || null
    }

    // 检查是否有缓存
    function hasCachedStats(zwdm: string): boolean {
        return statsCache.value.has(zwdm)
    }

    return {
        statsCache,
        getPositionStats,
        getBatchPositionStats,
        clearCache,
        clearPositionCache,
        getCachedStats,
        hasCachedStats
    }
}

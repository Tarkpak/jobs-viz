// 刷新所有职位的报名统计数据
const storage = useStorage('data')
const EXAM_ID = '796a0fa25f7c9ffb'

// 获取单个职位的报名统计
async function fetchPositionStats(zwdm: string) {
    try {
        const response = await $fetch('http://gzrsks.oumakspt.com:62/tyzpwb/stuchooseexam/getPositionInfo.htm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                zwdm: zwdm,
                examid: EXAM_ID
            }).toString(),
            timeout: 10000
        }) as any

        return {
            zwdm,
            bkrs: response.bkrs || 0,
            zprs: response.zprs || 0,
            jzbl: response.zprs ? (response.bkrs || 0) / response.zprs : 0,
            success: true
        }
    } catch (error) {
        console.error(`获取职位 ${zwdm} 统计失败:`, error)
        return {
            zwdm,
            bkrs: 0,
            zprs: 0,
            jzbl: 0,
            success: false
        }
    }
}

// 批量获取职位统计
async function fetchBatchPositionStats(zwdmList: string[], concurrency = 10) {
    const results = new Map<string, any>()
    const total = zwdmList.length
    let completed = 0

    console.log(`开始刷新 ${total} 个职位的报名统计，并发数: ${concurrency}`)

    for (let i = 0; i < zwdmList.length; i += concurrency) {
        const batch = zwdmList.slice(i, i + concurrency)
        const promises = batch.map(zwdm => fetchPositionStats(zwdm))
        const batchResults = await Promise.all(promises)

        batchResults.forEach(result => {
            results.set(result.zwdm, result)
        })

        completed += batch.length
        console.log(`进度: ${completed}/${total} (${Math.round(completed / total * 100)}%)`)
    }

    console.log(`完成刷新统计，成功: ${Array.from(results.values()).filter(r => r.success).length}/${total}`)
    return results
}

export default defineEventHandler(async (event) => {
    try {
        // 读取现有数据
        const uploadedData = await storage.getItem('positions.json')

        if (!uploadedData) {
            throw createError({
                statusCode: 404,
                message: '未找到职位数据，请先上传文件'
            })
        }

        const data = uploadedData as any
        const positions = data.data || []

        if (positions.length === 0) {
            throw createError({
                statusCode: 400,
                message: '职位数据为空'
            })
        }

        console.log(`开始刷新 ${positions.length} 条职位的报名统计...`)

        // 获取所有职位代码
        const zwdmList = positions.map((p: any) => p.职位代码)

        // 并发获取所有职位的报名统计
        const statsMap = await fetchBatchPositionStats(zwdmList, 10)

        // 将统计数据合并到职位数据中
        const positionsWithStats = positions.map((position: any) => {
            const stats = statsMap.get(position.职位代码)
            return {
                ...position,
                报考人数: stats?.bkrs || 0,
                竞争比例: stats?.jzbl || 0,
                统计获取成功: stats?.success || false
            }
        })

        // 更新存储的数据
        const dataToSave = {
            ...data,
            data: positionsWithStats,
            statsUpdateTime: new Date().toISOString(),
            statsSuccessCount: Array.from(statsMap.values()).filter(s => s.success).length
        }

        await storage.setItem('positions.json', dataToSave)

        console.log(`统计数据已刷新`)

        return {
            success: true,
            message: `成功刷新 ${positions.length} 条职位的报名统计`,
            count: positions.length,
            statsSuccessCount: dataToSave.statsSuccessCount,
            statsUpdateTime: dataToSave.statsUpdateTime
        }
    } catch (error: any) {
        console.error('Refresh stats error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: error.message || '刷新统计数据失败'
        })
    }
})

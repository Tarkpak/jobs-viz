import * as XLSX from 'xlsx'

const storage = useStorage('data')

// 考试类型配置
const EXAM_CONFIGS = {
    // 公务员考试
    gwy: {
        examId: '796a0fa25f7c9ffb',
        apiUrl: 'http://gzrsks.oumakspt.com:62/tyzpwb/stuchooseexam/getPositionInfo.htm'
    },
    // 事业单位考试
    sydw: {
        examId: '0ac7a830dec4d055',
        apiUrl: 'http://gzrsks.oumakspt.com:66/tyzpwb/stuchooseexam/getPositionInfo.htm'
    }
}

// 获取单个职位的报名统计
async function fetchPositionStats(zwdm: string, examType: 'gwy' | 'sydw') {
    const config = EXAM_CONFIGS[examType]
    
    try {
        const response = await $fetch(config.apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                zwdm: zwdm,
                examid: config.examId
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
async function fetchBatchPositionStats(zwdmList: string[], examType: 'gwy' | 'sydw', concurrency = 10) {
    const results = new Map<string, any>()
    const total = zwdmList.length
    let completed = 0

    console.log(`开始获取 ${total} 个职位的报名统计（${examType === 'gwy' ? '公务员' : '事业单位'}），并发数: ${concurrency}`)

    for (let i = 0; i < zwdmList.length; i += concurrency) {
        const batch = zwdmList.slice(i, i + concurrency)
        const promises = batch.map(zwdm => fetchPositionStats(zwdm, examType))
        const batchResults = await Promise.all(promises)

        batchResults.forEach(result => {
            results.set(result.zwdm, result)
        })

        completed += batch.length
        console.log(`进度: ${completed}/${total} (${Math.round(completed / total * 100)}%)`)
    }

    console.log(`完成获取统计，成功: ${Array.from(results.values()).filter(r => r.success).length}/${total}`)
    return results
}

// 解析 Excel 数据
function parseExcelBuffer(buffer: any) {
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const sheetName = workbook.SheetNames[0]
    if (!sheetName) {
        throw new Error('Excel 文件中没有找到工作表')
    }
    const sheet = workbook.Sheets[sheetName]
    if (!sheet) {
        throw new Error('无法读取工作表')
    }
    const rawData = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as any[][]

    // 检测表格类型（公务员 or 事业单位）
    // 公务员表格：第4行（索引3）是表头
    // 事业单位表格：第4行（索引3）也是表头
    const headerRow3 = rawData[3] || []
    
    // 检查是否为事业单位表格（有"单位代码"和"岗位代码"）
    const isSydw = headerRow3.includes('单位代码') && headerRow3.includes('岗位代码')
    
    // 检查是否为公务员表格（有"考区"）
    const isGwy = headerRow3.includes('考区') || headerRow3.includes('序号')
    
    if (isSydw) {
        console.log('检测到表格类型: 事业单位')
        return parseSydwData(rawData)
    } else if (isGwy) {
        console.log('检测到表格类型: 公务员')
        return parseGwyData(rawData)
    } else {
        throw new Error('无法识别表格类型，请确保是公务员或事业单位职位表')
    }
}

// 解析公务员数据
function parseGwyData(rawData: any[][]) {
    const dataRows = rawData.slice(4)

    const positions = dataRows
        .filter(row => row[0] && typeof row[0] === 'number')
        .map(row => ({
            序号: Number(row[0]),
            考区: String(row[1] || ''),
            单位名称: String(row[2] || ''),
            机构性质: String(row[3] || ''),
            单位地址: String(row[4] || ''),
            单位咨询电话: String(row[5] || ''),
            职位代码: String(row[6] || ''),
            职位名称: String(row[7] || ''),
            所属大类: String(row[8] || ''),
            所属小类: String(row[9] || ''),
            职位简介: String(row[10] || ''),
            招录人数: Number(row[11]) || 1,
            学历要求: String(row[12] || ''),
            学位要求: String(row[13] || ''),
            专业要求_大专: String(row[14] || ''),
            专业要求_本科: String(row[15] || ''),
            专业要求_研究生: String(row[16] || ''),
            政治面貌要求: String(row[17] || '无限制'),
            定向_服务基层项目人员: String(row[18] || '否'),
            定向_优秀村干部: String(row[19] || '否'),
            定向_驻村第一书记: String(row[20] || '否'),
            定向_少数民族: String(row[21] || '否'),
            定向_2026届毕业生: String(row[22] || '否'),
            定向_退役军人: String(row[23] || '否'),
            基层工作经历时间: String(row[24] || '无限制'),
            其他报考条件: String(row[25] || '无'),
            职位工作性质及说明: String(row[26] || ''),
            考试类型: 'gwy' as const
        }))

    return positions
}

// 解析事业单位数据
function parseSydwData(rawData: any[][]) {
    const dataRows = rawData.slice(5) // 事业单位从第5行开始

    const positions = dataRows
        .filter(row => row[0] && typeof row[0] === 'number')
        .map(row => ({
            序号: Number(row[0]),
            考区: '黔南州', // 事业单位默认考区
            单位名称: String(row[1] || ''),
            机构性质: '事业单位',
            单位地址: '',
            单位咨询电话: String(row[26] || ''),
            职位代码: String(row[4] || ''),
            职位名称: String(row[3] || ''),
            所属大类: String(row[5] || ''),
            所属小类: String(row[7] || ''),
            职位简介: String(row[9] || ''),
            招录人数: Number(row[6]) || 1,
            学历要求: String(row[10] || ''),
            学位要求: String(row[11] || ''),
            专业要求_大专: String(row[13] || ''),
            专业要求_本科: String(row[14] || ''),
            专业要求_研究生: String(row[15] || ''),
            政治面貌要求: String(row[22] || '无限制'),
            定向_服务基层项目人员: String(row[16] || '否'),
            定向_优秀村干部: String(row[17] || '否'),
            定向_驻村第一书记: '否',
            定向_少数民族: String(row[19] || '否'),
            定向_2026届毕业生: String(row[18] || '否'),
            定向_退役军人: String(row[20] || '否'),
            基层工作经历时间: String(row[21] || '无限制'),
            其他报考条件: String(row[23] || '无'),
            职位工作性质及说明: String(row[24] || ''),
            考试类型: 'sydw' as const
        }))

    return positions
}

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { filename, useCache = true } = body

        if (!filename) {
            throw createError({
                statusCode: 400,
                message: '请提供文件名'
            })
        }

        // 检查缓存
        if (useCache) {
            const cacheKey = `cache:${filename}`
            const cachedData = await storage.getItem(cacheKey) as any

            if (cachedData && cachedData.data) {
                console.log(`使用缓存数据: ${filename}`)
                
                // 保存到当前数据存储
                await storage.setItem('positions.json', cachedData.data)
                
                return {
                    success: true,
                    message: `成功加载 ${cachedData.data.count} 条职位数据（来自缓存）`,
                    filename: filename,
                    count: cachedData.data.count,
                    statsSuccessCount: cachedData.data.statsSuccessCount,
                    statsUpdateTime: cachedData.data.statsUpdateTime,
                    fromCache: true
                }
            }
        }

        // 使用 useStorage 读取 public 目录下的文件
        const publicStorage = useStorage('assets:public')
        const fileBuffer = await publicStorage.getItemRaw(filename)

        if (!fileBuffer) {
            throw createError({
                statusCode: 404,
                message: '文件不存在'
            })
        }

        // 解析 Excel 文件
        const positions = parseExcelBuffer(fileBuffer)

        if (positions.length === 0) {
            throw createError({
                statusCode: 400,
                message: '未能从文件中解析出有效数据'
            })
        }

        // 获取考试类型
        const examType = positions[0].考试类型
        console.log(`成功解析 ${positions.length} 条职位数据（${examType === 'gwy' ? '公务员' : '事业单位'}），开始获取报名统计...`)

        // 获取所有职位代码
        const zwdmList = positions.map(p => p.职位代码)

        // 并发获取所有职位的报名统计
        const statsMap = await fetchBatchPositionStats(zwdmList, examType, 10)

        // 将统计数据合并到职位数据中
        const positionsWithStats = positions.map(position => {
            const stats = statsMap.get(position.职位代码)
            return {
                ...position,
                报考人数: stats?.bkrs || 0,
                竞争比例: stats?.jzbl || 0,
                统计获取成功: stats?.success || false
            }
        })

        // 保存合并后的数据到存储
        const dataToSave = {
            filename: filename,
            uploadTime: new Date().toISOString(),
            count: positionsWithStats.length,
            examType: examType,
            data: positionsWithStats,
            statsUpdateTime: new Date().toISOString(),
            statsSuccessCount: Array.from(statsMap.values()).filter(s => s.success).length
        }

        await storage.setItem('positions.json', dataToSave)

        // 保存到缓存
        const cacheKey = `cache:${filename}`
        await storage.setItem(cacheKey, {
            filename,
            data: dataToSave,
            cachedAt: new Date().toISOString()
        })

        console.log(`数据已保存，包含报名统计，并已缓存`)

        return {
            success: true,
            message: `成功加载 ${positions.length} 条职位数据（${examType === 'gwy' ? '公务员' : '事业单位'}），已获取报名统计`,
            filename: filename,
            count: positions.length,
            examType: examType,
            statsSuccessCount: dataToSave.statsSuccessCount,
            statsUpdateTime: dataToSave.statsUpdateTime,
            fromCache: false
        }
    } catch (error: any) {
        console.error('Load excel error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: error.message || '文件加载失败'
        })
    }
})

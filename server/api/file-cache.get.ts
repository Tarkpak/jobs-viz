const storage = useStorage('data')

export default defineEventHandler(async (event) => {
    try {
        const query = getQuery(event)
        const filename = query.filename as string

        if (!filename) {
            throw createError({
                statusCode: 400,
                message: '缺少文件名参数'
            })
        }

        // 从缓存中读取文件统计数据
        const cacheKey = `cache:${filename}`
        const cachedData = await storage.getItem(cacheKey)

        if (cachedData) {
            return {
                success: true,
                cached: true,
                data: cachedData
            }
        }

        return {
            success: true,
            cached: false,
            data: null
        }
    } catch (error: any) {
        console.error('Get file cache error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '获取缓存失败'
        })
    }
})

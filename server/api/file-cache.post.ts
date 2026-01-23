const storage = useStorage('data')

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { filename, data } = body

        if (!filename || !data) {
            throw createError({
                statusCode: 400,
                message: '缺少必要参数'
            })
        }

        // 保存文件统计数据到缓存
        const cacheKey = `cache:${filename}`
        await storage.setItem(cacheKey, {
            filename,
            data,
            cachedAt: new Date().toISOString()
        })

        return {
            success: true,
            message: '缓存已保存'
        }
    } catch (error: any) {
        console.error('Save file cache error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '保存缓存失败'
        })
    }
})

const storage = useStorage('data')

export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { action, filename, newFilename } = body

        if (!action || !filename) {
            throw createError({
                statusCode: 400,
                message: '缺少必要参数'
            })
        }

        const publicStorage = useStorage('assets:public')

        switch (action) {
            case 'delete':
                await publicStorage.removeItem(filename)
                
                // 同时删除缓存
                const cacheKey = `cache:${filename}`
                await storage.removeItem(cacheKey)
                
                return {
                    success: true,
                    message: `文件 ${filename} 已删除`
                }

            case 'rename':
                if (!newFilename) {
                    throw createError({
                        statusCode: 400,
                        message: '缺少新文件名'
                    })
                }
                
                if (!newFilename.endsWith('.xlsx') && !newFilename.endsWith('.xls')) {
                    throw createError({
                        statusCode: 400,
                        message: '新文件名必须是 Excel 格式'
                    })
                }

                // 读取原文件
                const fileData = await publicStorage.getItemRaw(filename)
                if (!fileData) {
                    throw createError({
                        statusCode: 404,
                        message: '文件不存在'
                    })
                }
                
                // 保存为新文件名
                await publicStorage.setItemRaw(newFilename, fileData)
                
                // 删除原文件
                await publicStorage.removeItem(filename)
                
                // 更新缓存
                const oldCacheKey = `cache:${filename}`
                const newCacheKey = `cache:${newFilename}`
                const cachedData = await storage.getItem(oldCacheKey)
                if (cachedData) {
                    await storage.setItem(newCacheKey, cachedData)
                    await storage.removeItem(oldCacheKey)
                }
                
                return {
                    success: true,
                    message: `文件已重命名为 ${newFilename}`,
                    newFilename
                }

            default:
                throw createError({
                    statusCode: 400,
                    message: '不支持的操作'
                })
        }
    } catch (error: any) {
        console.error('Manage file error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: error.message || '文件操作失败'
        })
    }
})

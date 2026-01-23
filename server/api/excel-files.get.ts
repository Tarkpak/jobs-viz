export default defineEventHandler(async (event) => {
    try {
        // 使用 useStorage 读取 public 目录
        const publicStorage = useStorage('assets:public')
        const keys = await publicStorage.getKeys()
        
        // 筛选出 Excel 文件
        const excelFiles = keys
            .filter(key => key.endsWith('.xlsx') || key.endsWith('.xls'))
            .map(key => ({
                name: key,
                path: `/${key}`
            }))
        
        return {
            success: true,
            files: excelFiles
        }
    } catch (error: any) {
        console.error('List excel files error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '获取文件列表失败'
        })
    }
})

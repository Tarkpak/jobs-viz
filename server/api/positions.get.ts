// 使用 Nitro 的存储系统
const storage = useStorage('data')

export default defineEventHandler(async (event) => {
    try {
        let positions: any[] = []
        let metadata = {
            filename: '',
            uploadTime: '',
            count: 0,
            source: 'none' as 'none' | 'uploaded'
        }

        // 读取上传的数据
        const uploadedData = await storage.getItem('positions.json')

        if (uploadedData) {
            const data = uploadedData as any
            positions = data.data || []
            metadata = {
                filename: data.filename || '已上传文件',
                uploadTime: data.uploadTime || '',
                count: positions.length,
                source: 'uploaded',
                examType: data.examType,
                statsUpdateTime: data.statsUpdateTime,
                statsSuccessCount: data.statsSuccessCount
            }
        }
        // 没有上传数据时返回空数组，前端会提示用户上传

        return {
            success: true,
            metadata,
            data: positions
        }
    } catch (error: any) {
        console.error('Get positions error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '获取数据失败'
        })
    }
})

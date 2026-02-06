import { writeFile } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    try {
        const formData = await readMultipartFormData(event)

        if (!formData || formData.length === 0) {
            throw createError({
                statusCode: 400,
                message: '请上传文件'
            })
        }

        const file = formData.find(f => f.name === 'file')

        if (!file || !file.data) {
            throw createError({
                statusCode: 400,
                message: '未找到上传的文件'
            })
        }

        const filename = file.filename || ''
        if (!filename.endsWith('.xlsx') && !filename.endsWith('.xls')) {
            throw createError({
                statusCode: 400,
                message: '请上传 Excel 文件 (.xlsx 或 .xls)'
            })
        }

        // 直接保存文件到 public 目录
        const publicDir = join(process.cwd(), 'public')
        const filePath = join(publicDir, filename)
        
        await writeFile(filePath, file.data)

        console.log(`文件已保存: ${filename}`)

        return {
            success: true,
            message: `文件 ${filename} 已保存到 public 目录`,
            filename: filename
        }
    } catch (error: any) {
        console.error('Upload to public error:', error)

        if (error.statusCode) {
            throw error
        }

        throw createError({
            statusCode: 500,
            message: error.message || '文件保存失败'
        })
    }
})

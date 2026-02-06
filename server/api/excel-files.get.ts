import { readdir } from 'fs/promises'
import { join } from 'path'

export default defineEventHandler(async (event) => {
    try {
        // 获取 public 目录的绝对路径
        const publicDir = join(process.cwd(), 'public')
        
        // 递归读取目录中的所有文件
        async function getExcelFiles(dir: string, baseDir: string = dir): Promise<Array<{ name: string; fullPath: string; path: string }>> {
            const files: Array<{ name: string; fullPath: string; path: string }> = []
            
            try {
                const entries = await readdir(dir, { withFileTypes: true })
                
                for (const entry of entries) {
                    const fullPath = join(dir, entry.name)
                    
                    if (entry.isDirectory()) {
                        // 递归读取子目录
                        const subFiles = await getExcelFiles(fullPath, baseDir)
                        files.push(...subFiles)
                    } else if (entry.isFile() && (entry.name.endsWith('.xlsx') || entry.name.endsWith('.xls'))) {
                        // 计算相对路径
                        const relativePath = fullPath.replace(baseDir, '').replace(/\\/g, '/')
                        files.push({
                            name: entry.name,
                            fullPath: relativePath.startsWith('/') ? relativePath.slice(1) : relativePath,
                            path: relativePath
                        })
                    }
                }
            } catch (error) {
                console.error(`读取目录失败: ${dir}`, error)
            }
            
            return files
        }
        
        const excelFiles = await getExcelFiles(publicDir)
        
        // 按文件名排序
        excelFiles.sort((a, b) => a.name.localeCompare(b.name))
        
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

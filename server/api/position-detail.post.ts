export default defineEventHandler(async (event) => {
    try {
        const body = await readBody(event)
        const { zwdm, examid } = body

        if (!zwdm || !examid) {
            throw createError({
                statusCode: 400,
                message: '缺少必要参数'
            })
        }

        // 调用外部 API 获取职位详情
        const response = await $fetch('http://gzrsks.oumakspt.com:62/tyzpwb/stuchooseexam/getPositionInfo.htm', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
                'Accept': '*/*',
                'X-Requested-With': 'XMLHttpRequest'
            },
            body: new URLSearchParams({
                zwdm: zwdm,
                examid: examid
            }).toString()
        })

        return {
            success: true,
            data: response
        }
    } catch (error: any) {
        console.error('Get position detail error:', error)
        throw createError({
            statusCode: 500,
            message: error.message || '获取职位详情失败'
        })
    }
})

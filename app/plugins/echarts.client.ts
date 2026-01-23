import { use } from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { BarChart, PieChart, LineChart, MapChart } from 'echarts/charts'
import {
    TitleComponent,
    TooltipComponent,
    LegendComponent,
    GridComponent,
    DataZoomComponent,
    VisualMapComponent,
    ToolboxComponent
} from 'echarts/components'
import VChart from 'vue-echarts'

export default defineNuxtPlugin((nuxtApp) => {
    // 注册 ECharts 组件
    use([
        CanvasRenderer,
        BarChart,
        PieChart,
        LineChart,
        MapChart,
        TitleComponent,
        TooltipComponent,
        LegendComponent,
        GridComponent,
        DataZoomComponent,
        VisualMapComponent,
        ToolboxComponent
    ])

    // 全局注册 v-chart 组件
    nuxtApp.vueApp.component('v-chart', VChart)
})

// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@bg-dev/nuxt-naiveui'
  ],

  // 排除 scripts 目录，避免构建时扫描
  ignore: [
    'scripts/**'
  ],

  naiveui: {
    colorModePreference: 'dark',
    themeConfig: {}
  },

  app: {
    head: {
      title: 'Visual',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '贵州省2026年度省、市、县、乡四级机关统一面向社会公开招录人民警察职位数据可视化分析平台' }
      ],
      link: [
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap'
        }
      ]
    }
  },

  css: ['@/assets/css/main.css'],

  nitro: {
    storage: {
      data: {
        driver: 'memory'
      }
    },
    // 修复 Windows 路径问题
    externals: {
      inline: ['xlsx']
    }
  },

  vite: {
    optimizeDeps: {
      include: ['xlsx']
    }
  }
})


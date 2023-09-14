const { defineConfig } = require('@vue/cli-service')
module.exports = defineConfig({
  transpileDependencies: [
    'vuetify'
  ],
  pluginOptions: {
    electronBuilder: {
      preload: 'src/preload.js',
      builderOptions: {
        extraResources: ['src'],
        appId: 'MindMap.com',
        mac: {
          icon: 'src/assets/app_icon.icns'
        }
      },
    }
  },
  pages: {
    index: 'src/main.js',
    subpage: 'src/subpage/main.js'
  },
})

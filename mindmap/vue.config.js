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
      },
    }
  },
  pages: {
    index: 'src/main.js',
    subpage: 'src/subpage/main.js'
  },
})

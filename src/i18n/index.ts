import { createI18n } from 'vue-i18n'
import { messages } from './locale/index'

const i18n = createI18n({
  legacy: false, // 必须设置为 `false` 以使用组合式 API
  locale: 'zh_CN',
  fallbackLocale: 'zh_CN',
  availableLocales: ['zh_CN', 'en'],
  messages,
})
export default i18n

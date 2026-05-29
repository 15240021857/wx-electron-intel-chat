import { ChatHttpParam } from '@/types/chat'

export const callModelHttpAPI = async ({
  messages,
  model = 'glm-4.7',
  // model='glm-5.1',
  stream = false,
  signal = null,
  provider = {
    apiKey: '5e9ff230a8364875bbeaacb5685b110a.zyNRE10Cd1g83043',
    baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
  },
}: ChatHttpParam) => {
  const { apiKey, baseURL } = provider
  const url = baseURL
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 1.0,
      stream,
    }),
    signal,
  }).catch((err) => {
    if (err?.name === 'AbortError') {
      console.log('✅ 请求已主动取消')
      return null
    } else {
      console.error('❌ 请求失败', err)
      throw err
    }
  })
}

import { db } from './indexdb'
import { v4 as uuidv4 } from 'uuid'

export const bootstrapDBProviders = async () => {
  const providerCount = await db.providers.count()
  console.log(`Provider count: ${providerCount}`)
  //   如果没有厂商和模型，就先内置几个
  if (providerCount === 0) {
    const curProviderId = uuidv4()
    db.providers.bulkAdd([
      {
        id: curProviderId,
        label: '智谱清言',
        // apiKey: '5e9ff230a8364875bbeaacb5685b110a.zyNRE10Cd1g83043',
        apiKey: '60aa3a656e6d4a039f742bfa93c3760d.MxSUUjxwALox5AVq',
        baseURL: 'https://open.bigmodel.cn/api/paas/v4/chat/completions',
        enabled: 1,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'ali',
        label: '阿里通义千问',
        apiKey: 'sk-fd132a6fda16432996eb9f1fd2e920af',
        baseURL: 'https://dashscope.aliyuncs.com/compatible-mode/v1',
        enabled: 1,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'zijie',
        label: '字节豆包',
        apiKey: 'ark-345fb6b3-5208-4ecf-967d-4e067da74ce8-4a280',
        baseURL: 'https://ark.cn-beijing.volces.com/api/v3',
        enabled: 1,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
      {
        id: 'baidu',
        label: '百度文心一言',
        apiKey: '',
        baseURL: '',
        enabled: 0,
        updatedAt: new Date(),
        createdAt: new Date(),
      },
    ])
    db.models.bulkAdd([
      {
        id: uuidv4(),
        providerId: curProviderId,
        label: 'GLM-4.7-flash',
        value: 'glm-4.7-flash',
        enabled: 1,
        apiType: 'http',
        createdAt: new Date(),
        capacity: ['text'],
      },
      {
        id: uuidv4(),
        providerId: curProviderId,
        label: 'GLM-4.5-Flash',
        value: 'glm-4.5-Flash',
        enabled: 1,
        apiType: 'http',
        createdAt: new Date(),
        capacity: ['text'],
      },
      {
        id: uuidv4(),
        providerId: 'ali',
        label: 'qwen-plus',
        value: 'qwen-plus',
        enabled: 1,
        apiType: 'openAI',
        createdAt: new Date(),
        capacity: ['text'],
      },
      {
        id: uuidv4(),
        providerId: 'zijie',
        label: 'doubao-seed-1-6-lite',
        value: 'ep-20260517113543-5jvw8',
        enabled: 1,
        apiType: 'openAI',
        createdAt: new Date(),
        capacity: ['text'],
      },
      {
        id: uuidv4(),
        providerId: 'baidu',
        label: 'ERNIE-3.5-8K',
        value: 'ERNIE-3.5-8K',
        enabled: 1,
        apiType: 'openAI',
        createdAt: new Date(),
        capacity: ['text'],
      },
      {
        id: uuidv4(),
        providerId: 'ali',
        label: 'qwen3.5-plus',
        value: 'qwen3.5-plus',
        enabled: 1,
        apiType: 'openAI',
        createdAt: new Date(),
        capacity: ['text', 'image'],
      },
    ])
  }
}

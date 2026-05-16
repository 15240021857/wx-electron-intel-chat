import { AskModelParam } from '@/types/electron'
import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index'
import Config from '../../config/config'

export default class BigModel {
  private client!: OpenAI | null
  private defaultModel: string
  private abortController: AbortController | null
  /**
   * 构造函数，用于初始化API客户端
   * @param {string} apikey - API密钥，用于身份验证
   * @param {string} model - 使用的模型名称，如'qwen-plus'
   */
  constructor(defaultModel: string = 'qwen-plus') {
    this.client = null
    this.defaultModel = defaultModel
    this.abortController = null
  }
  getOpenAiInstance(apiKey: string, baseURL: string) {
    this.client = new OpenAI({
      apiKey, // 使用传入的API密钥
      baseURL, // 设置阿里云的API端点
    })
  }
  async askModel(messages: ChatCompletionMessageParam[] | null, provider?: any, model?: string) {
    // 获取openAI实例
    if (provider) {
      this.getOpenAiInstance(provider?.apiKey, provider?.baseURL)
    } else {
      // 没传就用默认的厂商
      this.getOpenAiInstance(Config.Model.qwen.apiKey, Config.Model.qwen.baseURL)
    }
    if (!this.client) {
      console.warn('未初始化模型')
      return
    }
    const completion = await this.client.chat.completions.create({
      model: model || this.defaultModel, //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
      messages: messages || [
        { role: 'system', content: 'You are a helpful assistant.' },
        { role: 'user', content: '你是谁？' },
      ],
    })
    const res = JSON.parse(JSON.stringify(completion))
    console.log(res)
    return res
  }
  // 流式接口请求
  async askModelStream({
    provider,
    model,
    messages,
    onData,
    onError,
    onEnd,
    onAbort,
  }: AskModelParam): Promise<AbortController | null> {
    // 获取openAI实例
    console.log('provider==', provider)

    if (provider) {
      this.getOpenAiInstance(provider?.apiKey, provider?.baseURL)
    } else {
      // 没传就用默认的厂商
      console.log('Config.Model.qwen==', Config.Model.qwen)

      this.getOpenAiInstance(Config.Model.qwen.apiKey, Config.Model.qwen.baseURL)
    }
    if (!this.client) {
      console.warn('未初始化模型')
      return null
    }
    console.log('this.client==', this.client)

    // 每次重置停止标识
    this.stopStream()
    this.abortController = new AbortController()
    const signal = this.abortController.signal
    try {
      console.log('model==', model)
      console.log('messages==', messages)

      const completion = await this.client.chat.completions.create(
        {
          model: model || this.defaultModel, //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
          messages: messages || [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: '你是谁？' },
          ],
          stream: true,
          stream_options: { include_usage: true },
        },
        {
          signal,
        }
      )
      for await (const chunk of completion) {
        console.log(JSON.stringify(chunk))
        const content = chunk.choices[0]?.delta?.content
        if (content && onData) {
          onData(content)
        }
      }
      onEnd && onEnd()
    } catch (error: any) {
      if (error.name === 'AbortError') {
        onAbort && onAbort()
        return null
      }
      onError && onError(error.message)
    } finally {
      this.abortController = null
    }

    return this.abortController
  }
  // 主动停止流式
  stopStream() {
    if (this.abortController) {
      this.abortController.abort()
      this.abortController = null
    }
  }
}

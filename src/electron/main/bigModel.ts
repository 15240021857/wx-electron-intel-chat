import OpenAI from 'openai'
import { ChatCompletionMessageParam } from 'openai/resources/index'

export default class BigModel {
  private apikey: string
  private client!: OpenAI
  private model: string

/**
 * 构造函数，用于初始化API客户端
 * @param {string} apikey - API密钥，用于身份验证
 * @param {string} model - 使用的模型名称，如'qwen-plus'
 */
  constructor(apikey:string, model: string) {
  // 将传入的apikey参数赋值给实例的apikey属性
    this.apikey = apikey
  // 将传入的model参数赋值给实例的model属性
    this.model = model
  // 如果使用的模型是'qwen-plus'，则创建一个OpenAI客户端实例
    if(model.startsWith('qwen')) {
    // 初始化OpenAI客户端，配置API密钥和自定义的API基础URL
      this.client = new OpenAI({
        apiKey: apikey,  // 使用传入的API密钥
        baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1"  // 设置阿里云的API端点
      })
    } else {
      console.warn('暂不支持的模型'+ model);
    }
  }
  async askModel(messages: ChatCompletionMessageParam[] | null) {
    if(!this.client) {
      console.warn('未初始化模型')
      return
    }
     const completion = await this.client.chat.completions.create({
        model: this.model || "qwen-plus",  //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: messages || [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "你是谁？" }
        ],
    });
    const res = JSON.parse(JSON.stringify(completion))
    console.log(res)
    return res
  }
  // 流式接口请求
  async askModelStream(messages: ChatCompletionMessageParam[] | null, web: Electron.WebContents) {
    if(!this.client) {
      console.warn('未初始化模型')
      return
    }
     const completion = await this.client.chat.completions.create({
        model: this.model || "qwen-plus",  //此处以qwen-plus为例，可按需更换模型名称。模型列表：https://help.aliyun.com/zh/model-studio/getting-started/models
        messages: messages || [
            { role: "system", content: "You are a helpful assistant." },
            { role: "user", content: "你是谁？" }
        ],
        stream: true,
        stream_options: { include_usage: true }
    });
    // console.log('123123123'+JSON.stringify(completion))
    // return stream
    for await (const chunk of completion) {
        console.log(JSON.stringify(chunk));
        web.send('on-stream', chunk)
    }
  }
}
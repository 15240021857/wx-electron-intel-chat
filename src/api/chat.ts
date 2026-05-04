import { ChatParam } from "@/types/chat"

export const callZhipuAPI = async ({
  messages,
  model='glm-4.7',
  // model='glm-5.1',
  stream=false
}: ChatParam) => {
  const url = 'https://open.bigmodel.cn/api/paas/v4/chat/completions'
  return fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer 5e9ff230a8364875bbeaacb5685b110a.zyNRE10Cd1g83043'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      temperature: 1.0,
      stream
    })
  })
}
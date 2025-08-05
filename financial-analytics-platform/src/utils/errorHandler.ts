/**
 * 错误处理工具函数
 */

export interface ApiError {
  message: string
  status?: number
  code?: string
}

/**
 * 处理网络请求错误
 * @param error 错误对象
 * @param context 错误上下文
 * @returns 格式化的错误信息
 */
export function handleApiError(error: any, context: string = ''): ApiError {
  console.error(`${context} 错误:`, error)

  // 网络连接错误
  if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
    return {
      message: '网络连接失败，请检查网络连接或稍后重试',
      code: 'NETWORK_ERROR'
    }
  }

  // 超时错误
  if (error.name === 'AbortError') {
    return {
      message: '请求超时，请检查网络连接或稍后重试',
      code: 'TIMEOUT_ERROR'
    }
  }

  // 空响应错误
  if (error.message.includes('ERR_EMPTY_RESPONSE')) {
    return {
      message: '服务器响应为空，请稍后重试',
      code: 'EMPTY_RESPONSE'
    }
  }

  // HTTP状态码错误
  if (error.status) {
    switch (error.status) {
      case 400:
        return {
          message: '请求参数错误',
          status: 400,
          code: 'BAD_REQUEST'
        }
      case 401:
        return {
          message: '未授权访问，请重新登录',
          status: 401,
          code: 'UNAUTHORIZED'
        }
      case 403:
        return {
          message: '权限不足',
          status: 403,
          code: 'FORBIDDEN'
        }
      case 404:
        return {
          message: '请求的资源不存在',
          status: 404,
          code: 'NOT_FOUND'
        }
      case 500:
        return {
          message: '服务器内部错误，请稍后重试',
          status: 500,
          code: 'INTERNAL_ERROR'
        }
      case 502:
        return {
          message: '网关错误，请稍后重试',
          status: 502,
          code: 'BAD_GATEWAY'
        }
      case 503:
        return {
          message: '服务暂时不可用，请稍后重试',
          status: 503,
          code: 'SERVICE_UNAVAILABLE'
        }
      default:
        return {
          message: `请求失败 (${error.status})`,
          status: error.status,
          code: 'HTTP_ERROR'
        }
    }
  }

  // 默认错误
  return {
    message: error.message || '未知错误，请稍后重试',
    code: 'UNKNOWN_ERROR'
  }
}

/**
 * 创建带有错误处理的fetch请求
 * @param url 请求URL
 * @param options 请求选项
 * @param context 错误上下文
 * @returns Promise<Response>
 */
export async function safeFetch(
  url: string, 
  options: RequestInit = {}, 
  context: string = ''
): Promise<Response> {
  try {
    // 设置默认超时时间
    const defaultOptions: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      signal: options.signal || AbortSignal.timeout(10000), // 默认10秒超时
      ...options
    }

    const response = await fetch(url, defaultOptions)
    
    if (!response.ok) {
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`)
      ;(error as any).status = response.status
      throw error
    }

    return response
  } catch (error) {
    const apiError = handleApiError(error, context)
    const enhancedError = new Error(apiError.message)
    ;(enhancedError as any).status = apiError.status
    ;(enhancedError as any).code = apiError.code
    throw enhancedError
  }
}

/**
 * 显示用户友好的错误提示
 * @param error 错误对象
 * @param context 错误上下文
 */
export function showErrorMessage(error: any, context: string = '') {
  const apiError = handleApiError(error, context)
  
  // 这里可以集成具体的UI提示组件
  // 目前使用console.error和alert作为示例
  console.error(`${context}:`, apiError.message)
  
  // 在生产环境中，这里应该使用更好的UI组件来显示错误
  if (typeof window !== 'undefined') {
    // 可以替换为toast通知或其他UI组件
    alert(`${context ? context + ': ' : ''}${apiError.message}`)
  }
}

/**
 * 重试机制
 * @param fn 要重试的函数
 * @param maxRetries 最大重试次数
 * @param delay 重试延迟（毫秒）
 * @returns Promise<T>
 */
export async function retryWithDelay<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000
): Promise<T> {
  let lastError: any

  for (let i = 0; i <= maxRetries; i++) {
    try {
      return await fn()
    } catch (error) {
      lastError = error
      
      if (i === maxRetries) {
        break
      }

      // 对于某些错误类型不进行重试
      const apiError = handleApiError(error)
      if (apiError.code === 'UNAUTHORIZED' || apiError.code === 'FORBIDDEN') {
        break
      }

      console.warn(`重试 ${i + 1}/${maxRetries} 失败:`, error.message)
      await new Promise(resolve => setTimeout(resolve, delay * (i + 1)))
    }
  }

  throw lastError
}

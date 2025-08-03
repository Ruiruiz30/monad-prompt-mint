import { useAppContext } from '@/contexts/AppContext'

// 测试用的类型定义
export type MockAppContext = ReturnType<typeof useAppContext>

// 通用的测试类型
export type TestFunction = (...args: unknown[]) => unknown

// API测试类型
export type MockRequestBody = Record<string, unknown>

// 组件测试类型
export type ComponentTestProps = {
  className?: string
  children?: React.ReactNode
} 
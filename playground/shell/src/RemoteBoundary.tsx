import React, { type ErrorInfo, type ReactNode } from 'react'

interface Props { name: string; children: ReactNode }
interface State { error: Error | null }

// Если remote не загрузился или упал при рендере — показываем заглушку, а не белый экран.
export class RemoteBoundary extends React.Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State { return { error } }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error(`[shell] ${this.props.name} failed`, error) }
  render() {
    return this.state.error
      ? <div className="fallback">{this.props.name} временно недоступен. Остальная «Полка» работает.</div>
      : this.props.children
  }
}

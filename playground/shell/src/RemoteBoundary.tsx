import React, { type ErrorInfo, type ReactNode } from 'react'

interface Props {
  name: string
  /** Когда значение меняется (например, адрес), boundary сбрасывает ошибку и пробует отрисовать МФ заново. */
  resetKey?: unknown
  children: ReactNode
}
interface State { error: Error | null }

/*
 * Если remote не загрузился или упал при рендере — показываем заглушку, а не белый экран.
 * Ловит только ошибки рендера React-дерева. НЕ ловит: обработчики событий, асинхронный код,
 * ошибки внутри Vue-приложения, смонтированного через mount() (react.dev, Component → Error Boundary).
 */
export class RemoteBoundary extends React.Component<Props, State> {
  state: State = { error: null }
  static getDerivedStateFromError(error: Error): State { return { error } }
  componentDidCatch(error: Error, _info: ErrorInfo) { console.error(`[shell] ${this.props.name} failed`, error) }
  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) this.setState({ error: null })
  }
  render() {
    return this.state.error
      ? <div className="fallback">{this.props.name} временно недоступен. Остальная «Полка» работает.</div>
      : this.props.children
  }
}

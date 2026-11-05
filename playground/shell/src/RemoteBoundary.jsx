import React from 'react'

// Если remote не загрузился или упал при рендере — показываем заглушку, а не белый экран.
export class RemoteBoundary extends React.Component {
  state = { error: null }
  static getDerivedStateFromError(error) { return { error } }
  componentDidCatch(error) { console.error(`[shell] ${this.props.name} failed`, error) }
  render() {
    return this.state.error
      ? <div className="fallback">{this.props.name} временно недоступен. Остальная «Полка» работает.</div>
      : this.props.children
  }
}

// Команда Каталога разрабатывает и тестирует свой МФ отдельно, без Shell.
import { createRoot } from 'react-dom/client'
import Catalog from './Catalog.tsx'

createRoot(document.getElementById('root')!).render(<Catalog user="Тестовый пользователь" />)

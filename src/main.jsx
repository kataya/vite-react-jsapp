import { createRoot } from 'react-dom/client'
import App from './App.jsx'
import './index.css'


// StrictMode の定義は削除
createRoot(document.getElementById('root')).render(
    <App />
)

import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HomePage } from './pages/HomePage'
import { NewBatchPage } from './pages/NewBatchPage'
import { BatchDetailPage } from './pages/BatchDetailPage'
import { ReviewPage } from './pages/ReviewPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/batch/new" element={<NewBatchPage />} />
        <Route path="/batch/:id" element={<BatchDetailPage />} />
        <Route path="/review/:id" element={<ReviewPage />} />
      </Routes>
    </BrowserRouter>
  )
}

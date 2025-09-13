import Link from 'next/link'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Fluxa Invoice Processing
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          German Invoice Processing System with OCR
        </p>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <Link 
            href="/invoices" 
            className="bg-blue-600 hover:bg-blue-700 text-white p-6 rounded-lg shadow-lg transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">📄 Invoice Upload</h2>
            <p>Upload and process German invoices with OCR</p>
          </Link>
          
          <Link 
            href="/dashboard" 
            className="bg-green-600 hover:bg-green-700 text-white p-6 rounded-lg shadow-lg transition-colors"
          >
            <h2 className="text-2xl font-semibold mb-2">📊 Dashboard</h2>
            <p>View processed invoices and analytics</p>
          </Link>
        </div>
      </div>
    </div>
  )
}
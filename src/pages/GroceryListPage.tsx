import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CheckSquare, Square, Share2, FileText, RotateCcw, ShoppingCart, Copy } from 'lucide-react'
import { useAppStore } from '../store/useAppStore'
import { useExport } from '../hooks/useExport'
import type { GroceryCategory, GroceryListItem } from '../types'

const CATEGORY_META: Record<GroceryCategory, { label: string; emoji: string; order: number }> = {
  produce: { label: 'Produce', emoji: '🥦', order: 1 },
  dairy: { label: 'Dairy', emoji: '🥛', order: 2 },
  protein: { label: 'Protein', emoji: '🥩', order: 3 },
  grains: { label: 'Grains', emoji: '🌾', order: 4 },
  pantry: { label: 'Pantry', emoji: '🥫', order: 5 },
  frozen: { label: 'Frozen', emoji: '❄️', order: 6 },
  condiments: { label: 'Condiments', emoji: '🧴', order: 7 },
  bakery: { label: 'Bakery', emoji: '🍞', order: 8 },
  beverages: { label: 'Beverages', emoji: '🧃', order: 9 },
}

function formatQuantity(qty: number): string {
  if (qty === Math.floor(qty)) return String(qty)
  const frac = qty - Math.floor(qty)
  const fracStr =
    Math.abs(frac - 0.5) < 0.01 ? '½' :
    Math.abs(frac - 0.25) < 0.01 ? '¼' :
    Math.abs(frac - 0.75) < 0.01 ? '¾' :
    Math.abs(frac - 0.33) < 0.01 ? '⅓' :
    frac.toFixed(1).replace('0.', '.')
  return qty >= 1 ? `${Math.floor(qty)} ${fracStr}` : fracStr
}

export default function GroceryListPage() {
  const navigate = useNavigate()
  const { groceryList, checkedGroceryItems, toggleGroceryItem, resetGroceryChecks, currentWeekPlan } = useAppStore()
  const { exportToAppleNotes, exportViaWebShare, copyToClipboard } = useExport()
  const [copyFeedback, setCopyFeedback] = useState(false)

  const totalItems = groceryList.length
  const checkedCount = checkedGroceryItems.length
  const progressPct = totalItems > 0 ? Math.round((checkedCount / totalItems) * 100) : 0

  const byCategory = groceryList.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<GroceryCategory, GroceryListItem[]>)

  const sortedCategories = (Object.keys(byCategory) as GroceryCategory[]).sort(
    (a, b) => (CATEGORY_META[a]?.order ?? 99) - (CATEGORY_META[b]?.order ?? 99),
  )

  const handleCheckAll = () => {
    const unchecked = groceryList.filter((item) => !checkedGroceryItems.includes(item.id))
    unchecked.forEach((item) => toggleGroceryItem(item.id))
  }

  const showFeedback = () => {
    setCopyFeedback(true)
    setTimeout(() => setCopyFeedback(false), 2000)
  }

  const handleShare = async () => {
    try {
      await exportViaWebShare(groceryList)
    } catch {
      copyToClipboard(groceryList)
    }
    showFeedback()
  }

  const handleCopy = () => {
    copyToClipboard(groceryList)
    showFeedback()
  }

  if (!currentWeekPlan || groceryList.length === 0) {
    return (
      <div className="max-w-md mx-auto px-4 pt-6">
        <h1 className="text-xl font-bold text-gray-800 mb-6">Grocery List</h1>
        <div className="bg-white rounded-2xl shadow-sm p-8 text-center">
          <ShoppingCart size={40} className="mx-auto text-gray-300 mb-3" />
          <h3 className="font-bold text-gray-600 mb-2">No grocery list yet</h3>
          <p className="text-gray-400 text-sm mb-5">
            Generate a meal plan first and your grocery list will appear here.
          </p>
          <button
            onClick={() => navigate('/')}
            className="bg-primary-500 text-white px-6 py-3 rounded-2xl font-bold hover:bg-primary-600 transition-colors"
          >
            Go Generate a Plan
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-md mx-auto px-4 pt-6 pb-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Grocery List</h1>
          <p className="text-xs text-gray-400 mt-0.5">{totalItems} items total</p>
        </div>
        <button
          onClick={resetGroceryChecks}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-gray-500 hover:bg-gray-100 text-xs font-medium transition-colors"
        >
          <RotateCcw size={13} />
          Reset
        </button>
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">
            {checkedCount} of {totalItems} checked
          </span>
          <span className="text-sm font-bold text-primary-600">{progressPct}%</span>
        </div>
        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-400 to-primary-500 rounded-full transition-all duration-500"
            style={{ width: `${progressPct}%` }}
          />
        </div>
        {progressPct === 100 && (
          <p className="text-center text-sm text-primary-600 font-semibold mt-2">
            All done! Happy shopping! 🛒
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <button
            onClick={handleCheckAll}
            className="flex-1 text-xs font-semibold text-gray-600 hover:text-gray-800 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Check All
          </button>
          <button
            onClick={resetGroceryChecks}
            className="flex-1 text-xs font-semibold text-gray-400 hover:text-gray-600 py-1.5 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
          >
            Uncheck All
          </button>
        </div>
      </div>

      {/* Grocery items by category */}
      <div className="space-y-3 mb-5">
        {sortedCategories.map((cat) => {
          const meta = CATEGORY_META[cat]
          const items = byCategory[cat]
          const catChecked = items.filter((i) => checkedGroceryItems.includes(i.id)).length
          const allCatChecked = catChecked === items.length

          return (
            <div key={cat} className="bg-white rounded-2xl shadow-sm overflow-hidden">
              <div className={`flex items-center justify-between px-4 py-2.5 border-b border-gray-50 ${allCatChecked ? 'bg-gray-50' : ''}`}>
                <div className="flex items-center gap-2">
                  <span>{meta.emoji}</span>
                  <h3 className={`font-bold text-sm ${allCatChecked ? 'text-gray-400' : 'text-gray-700'}`}>
                    {meta.label}
                  </h3>
                </div>
                <span className="text-xs text-gray-400 font-medium">{catChecked}/{items.length}</span>
              </div>
              <div className="divide-y divide-gray-50">
                {items.map((item) => {
                  const isChecked = checkedGroceryItems.includes(item.id)
                  return (
                    <button
                      key={item.id}
                      onClick={() => toggleGroceryItem(item.id)}
                      className={`w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-gray-50 transition-colors ${isChecked ? 'opacity-50' : ''}`}
                    >
                      {isChecked ? (
                        <CheckSquare size={18} className="text-primary-500 flex-shrink-0" />
                      ) : (
                        <Square size={18} className="text-gray-300 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <span className={`text-sm font-medium ${isChecked ? 'line-through text-gray-400' : 'text-gray-800'}`}>
                          {item.name}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400 font-medium flex-shrink-0">
                        {formatQuantity(item.totalQuantity)} {item.unit}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Export section */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <h3 className="font-bold text-gray-700 text-sm mb-3">Export List</h3>
        <div className="space-y-2">
          <button
            onClick={() => exportToAppleNotes(groceryList)}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-gray-200 hover:border-gray-300 text-gray-700 font-medium text-sm transition-colors"
          >
            <FileText size={16} className="text-gray-500" />
            Open in Apple Notes
          </button>
          <button
            onClick={handleShare}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-primary-200 bg-primary-50 hover:bg-primary-100 text-primary-700 font-medium text-sm transition-colors"
          >
            <Share2 size={16} />
            Share List
          </button>
          <button
            onClick={handleCopy}
            className="w-full flex items-center gap-3 py-3 px-4 rounded-xl border-2 border-sage-200 bg-sage-50 hover:bg-sage-100 text-sage-700 font-medium text-sm transition-colors"
          >
            <Copy size={16} />
            {copyFeedback ? '✓ Copied to clipboard!' : 'Copy to Clipboard'}
          </button>
        </div>
      </div>
    </div>
  )
}

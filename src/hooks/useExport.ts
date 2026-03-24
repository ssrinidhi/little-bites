import type { GroceryListItem, GroceryCategory } from '../types'

const CATEGORY_LABELS: Record<GroceryCategory, string> = {
  produce: '🥦 Produce',
  dairy: '🥛 Dairy',
  protein: '🥩 Protein',
  grains: '🌾 Grains',
  pantry: '🥫 Pantry',
  frozen: '❄️ Frozen',
  condiments: '🧴 Condiments',
  beverages: '🧃 Beverages',
  bakery: '🍞 Bakery',
}

function formatGroceryList(items: GroceryListItem[]): string {
  const byCategory = items.reduce((acc, item) => {
    if (!acc[item.category]) acc[item.category] = []
    acc[item.category].push(item)
    return acc
  }, {} as Record<string, GroceryListItem[]>)

  const lines: string[] = ['Little Bites — Weekly Grocery List\n']
  for (const [cat, catItems] of Object.entries(byCategory)) {
    lines.push(CATEGORY_LABELS[cat as GroceryCategory] || cat)
    for (const item of catItems) {
      lines.push(`  • ${item.totalQuantity} ${item.unit} ${item.name}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

function fallbackCopy(text: string) {
  const ta = document.createElement('textarea')
  ta.value = text
  ta.style.cssText = 'position:fixed;top:0;left:0;opacity:0;pointer-events:none'
  document.body.appendChild(ta)
  ta.focus()
  ta.select()
  try { document.execCommand('copy') } catch { /* nothing we can do */ }
  document.body.removeChild(ta)
}

export function useExport() {
  const copyToClipboard = (items: GroceryListItem[]) => {
    const text = formatGroceryList(items)
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => fallbackCopy(text))
    } else {
      fallbackCopy(text)
    }
  }

  const exportToAppleNotes = (items: GroceryListItem[]) => {
    const title = encodeURIComponent('Grocery List - Little Bites')
    const body = encodeURIComponent(formatGroceryList(items))
    window.location.href = `mobilenotes://new?title=${title}&body=${body}`
    setTimeout(() => copyToClipboard(items), 500)
  }

  const exportViaWebShare = async (items: GroceryListItem[]) => {
    const text = formatGroceryList(items)
    if (navigator.share) {
      await navigator.share({ title: 'Grocery List - Little Bites', text })
    } else {
      copyToClipboard(items)
    }
  }

  return { exportToAppleNotes, exportViaWebShare, copyToClipboard }
}

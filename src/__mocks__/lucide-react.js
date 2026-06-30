import React from 'react'

const iconNames = [
  'Menu', 'X', 'ShoppingCart', 'Heart', 'User', 'Search', 'ChevronDown', 'ChevronUp',
  'ChevronLeft', 'ChevronRight', 'ArrowUp', 'ArrowRight', 'Trash2', 'Plus', 'Minus',
  'Mail', 'Phone', 'MapPin', 'Clock', 'Shield', 'Truck', 'CreditCard', 'Package',
  'Bell', 'BellRing', 'Check', 'AlertCircle', 'AlertTriangle', 'Info', 'Loader2',
  'Star', 'Eye', 'EyeOff', 'Edit3', 'LogOut', 'Settings', 'Instagram', 'Facebook',
  'Linkedin', 'Quote', 'Sparkles', 'Image', 'Upload', 'FileText', 'Tag', 'Filter',
  'Grid', 'List', 'Share2', 'ExternalLink', 'Home', 'BookOpen', 'Award', 'Gem',
  'Palette', 'ScrollText', 'Send', 'MessageCircle', 'Play', 'Pause', 'Volume2',
  'Archive', 'Camera', 'TrendingUp', 'BarChart3', 'PieChart', 'DollarSign',
  'ShoppingBag', 'RefreshCw'
]

const IconMock = React.forwardRef((props, ref) => {
  const { className, size, color, strokeWidth, ...rest } = props
  const name = rest['aria-label'] || rest.label || 'icon'
  return React.createElement('svg', {
    ...rest,
    ref,
    'data-testid': `lucide-${name.toLowerCase().replace(/\s+/g, '-')}`,
    className,
    width: size || 24,
    height: size || 24,
  })
})

IconMock.displayName = 'LucideIcon'

const exports = {}
for (const name of iconNames) {
  exports[name] = IconMock
}

exports.default = IconMock
module.exports = exports

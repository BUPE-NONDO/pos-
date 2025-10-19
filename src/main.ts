import { Product, CartItem } from '@/types/schemas'
import { POSService } from '@/lib/pos'
import { DatabaseService } from '@/lib/database'
import { PrintService } from '@/lib/print'
import { getSupabaseStatus, isSupabaseConfigured } from '@/lib/supabase'
import './styles.css'

/**
 * Main POS Application
 * Manages state, UI updates, and user interactions
 */
class POSApp {
  private cart: CartItem[] = []
  private products: Product[] = []
  private filteredProducts: Product[] = []
  private cashierId: string = ''
  private readonly TAX_RATE = 0.16 // 16% VAT for Zambia

  // DOM element references
  private dom = {
    productGrid: document.getElementById('productGrid') as HTMLDivElement,
    productSearch: document.getElementById('productSearch') as HTMLInputElement,
    cartItemsList: document.getElementById('cartItemsList') as HTMLDivElement,
    emptyCartMessage: document.getElementById('emptyCartMessage') as HTMLParagraphElement,
    chargeButton: document.getElementById('chargeButton') as HTMLButtonElement,
    quoteButton: document.getElementById('quoteButton') as HTMLButtonElement,
    clearButton: document.getElementById('clearButton') as HTMLButtonElement,
    chargeAmountSpan: document.getElementById('chargeAmount') as HTMLSpanElement,
    subtotalDisplay: document.getElementById('subtotalDisplay') as HTMLSpanElement,
    taxDisplay: document.getElementById('taxDisplay') as HTMLSpanElement,
    totalDisplay: document.getElementById('totalDisplay') as HTMLSpanElement,
    statusMessage: document.getElementById('statusMessage') as HTMLDivElement,
    userIdDisplay: document.getElementById('userIdDisplay') as HTMLSpanElement,
    darkModeToggle: document.getElementById('darkModeToggle') as HTMLButtonElement,
    moonIcon: document.getElementById('moonIcon') as SVGElement,
    sunIcon: document.getElementById('sunIcon') as SVGElement,
  }

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    // Generate cashier ID
    this.cashierId = POSService.generateCashierId()
    this.dom.userIdDisplay.textContent = this.cashierId

    // Load product catalog
    this.loadProducts()

    // Set up event listeners
    this.setupEventListeners()

    // Set up dark mode
    this.setupDarkMode()

    // Check Supabase connection
    this.checkBackendConnection()

    console.log('✅ StockPilot POS initialized successfully')
  }

  private loadProducts(): void {
    // In production, this would fetch from a database/API
    this.products = [
      {
        id: 1,
        name: 'Paracetamol Tabs (20pk)',
        price: 45.0,
        sku: 'MED001',
        image: 'https://placehold.co/100x100/10B981/000?text=Pills',
      },
      {
        id: 2,
        name: 'Multivitamins (60 caps)',
        price: 120.0,
        sku: 'SUP002',
        image: 'https://placehold.co/100x100/3B82F6/fff?text=Vitamins',
      },
      {
        id: 3,
        name: 'Alcohol Swabs (100pk)',
        price: 35.0,
        sku: 'FIRST03',
        image: 'https://placehold.co/100x100/6366F1/fff?text=Swabs',
      },
      {
        id: 4,
        name: 'Adult Diapers (10pk)',
        price: 180.0,
        sku: 'CARE004',
        image: 'https://placehold.co/100x100/FACC15/000?text=Diapers',
      },
      {
        id: 5,
        name: 'Band-Aids (50 strips)',
        price: 50.0,
        sku: 'FIRST05',
        image: 'https://placehold.co/100x100/EF4444/fff?text=BandAid',
      },
      {
        id: 6,
        name: 'Cough Syrup (100ml)',
        price: 75.0,
        sku: 'MED006',
        image: 'https://placehold.co/100x100/E879F9/fff?text=Syrup',
      },
      {
        id: 7,
        name: 'Digital Thermometer',
        price: 90.0,
        sku: 'EQUIP07',
        image: 'https://placehold.co/100x100/F97316/fff?text=Temp',
      },
      {
        id: 8,
        name: 'Antiseptic Cream (50g)',
        price: 60.0,
        sku: 'FIRST08',
        image: 'https://placehold.co/100x100/FDE047/000?text=Cream',
      },
      {
        id: 9,
        name: 'Rehydration Salts (3pk)',
        price: 30.0,
        sku: 'SUP009',
        image: 'https://placehold.co/100x100/A855F7/fff?text=Salts',
      },
      {
        id: 10,
        name: 'Cotton Wool (200g)',
        price: 40.0,
        sku: 'FIRST10',
        image: 'https://placehold.co/100x100/34D399/000?text=Cotton',
      },
    ]

    this.filteredProducts = [...this.products]
    this.renderProductGrid()
  }

  private setupEventListeners(): void {
    // Search functionality
    this.dom.productSearch.addEventListener('input', (e) => {
      const target = e.target as HTMLInputElement
      this.handleSearch(target.value)
    })

    // Cart action buttons
    this.dom.chargeButton.addEventListener('click', () => this.handleCharge())
    this.dom.quoteButton.addEventListener('click', () => this.handleQuote())
    this.dom.clearButton.addEventListener('click', () => this.handleClear())

    // Dark mode toggle
    this.dom.darkModeToggle.addEventListener('click', () => this.toggleDarkMode())
  }

  private setupDarkMode(): void {
    const html = document.documentElement
    const isDark =
      localStorage.getItem('darkMode') === 'true' ||
      (!localStorage.getItem('darkMode') && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      html.classList.add('dark')
      this.dom.sunIcon.classList.remove('hidden')
      this.dom.moonIcon.classList.add('hidden')
    }
  }

  private toggleDarkMode(): void {
    const html = document.documentElement
    const isDark = html.classList.toggle('dark')
    localStorage.setItem('darkMode', isDark.toString())

    if (isDark) {
      this.dom.sunIcon.classList.remove('hidden')
      this.dom.moonIcon.classList.add('hidden')
    } else {
      this.dom.sunIcon.classList.add('hidden')
      this.dom.moonIcon.classList.remove('hidden')
    }
  }

  private checkBackendConnection(): void {
    const status = getSupabaseStatus()
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Running in offline mode:', status)
      console.warn('💡 Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync')
    } else {
      console.log('✅ Backend connected:', status)
    }
  }

  public addToCart(productId: number): void {
    const product = this.products.find(p => p.id === productId)
    if (!product) return

    try {
      this.cart = POSService.addToCart(this.cart, product)
      this.renderCart()
    } catch (error) {
      console.error('Error adding to cart:', error)
      this.showMessage('Failed to add product to cart', 'error')
    }
  }

  public updateQuantity(productId: number, change: number): void {
    this.cart = POSService.updateQuantity(this.cart, productId, change)
    this.renderCart()
  }

  private handleSearch(searchTerm: string): void {
    this.filteredProducts = POSService.searchProducts(this.products, searchTerm)
    this.renderProductGrid()
  }

  private async handleCharge(): Promise<void> {
    const validation = POSService.validateCart(this.cart)
    if (!validation.valid) {
      this.showMessage(validation.message || 'Invalid cart', 'warning')
      return
    }

    // Disable buttons during processing
    this.setButtonsEnabled(false)

    const totals = POSService.calculateTotals(this.cart, this.TAX_RATE)
    const transId = POSService.generateTransactionId()

    this.showMessage(`Processing sale ${transId}...`, 'info')

    try {
      const transaction = {
        transId,
        timestamp: new Date().toISOString(),
        totalAmount: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        taxRate: this.TAX_RATE,
        items: [...this.cart],
        cashierId: this.cashierId,
        status: 'Completed' as const,
      }

      // Save to database
      await DatabaseService.saveTransaction(transaction)

      // Print receipt
      PrintService.printReceipt(transaction)

      // Show success message
      this.showMessage(
        `Transaction Complete! Total: ${POSService.formatCurrency(totals.total)}`,
        'success'
      )

      // Clear cart
      this.cart = POSService.clearCart()
      this.renderCart()
    } catch (error) {
      console.error('Transaction error:', error)
      this.showMessage('Transaction failed. Please try again.', 'error')
    } finally {
      this.setButtonsEnabled(true)
    }
  }

  private async handleQuote(): Promise<void> {
    const validation = POSService.validateCart(this.cart)
    if (!validation.valid) {
      this.showMessage(validation.message || 'Invalid cart', 'warning')
      return
    }

    // Disable buttons during processing
    this.setButtonsEnabled(false)

    const totals = POSService.calculateTotals(this.cart, this.TAX_RATE)
    const quoteId = POSService.generateQuotationId()

    this.showMessage(`Saving quotation ${quoteId}...`, 'info')

    try {
      const validUntil = new Date()
      validUntil.setDate(validUntil.getDate() + 30)

      const quotation = {
        quoteId,
        timestamp: new Date().toISOString(),
        totalAmount: totals.total,
        subtotal: totals.subtotal,
        tax: totals.tax,
        taxRate: this.TAX_RATE,
        items: [...this.cart],
        preparedBy: this.cashierId,
        status: 'Quoted' as const,
        validUntil: validUntil.toISOString(),
      }

      // Save to database
      await DatabaseService.saveQuotation(quotation)

      // Print quotation
      PrintService.printQuotation(quotation)

      // Show success message
      this.showMessage(`Quotation ${quoteId} saved and printing...`, 'success')

      // Clear cart
      this.cart = POSService.clearCart()
      this.renderCart()
    } catch (error) {
      console.error('Quotation error:', error)
      this.showMessage('Failed to save quotation. Please try again.', 'error')
    } finally {
      this.setButtonsEnabled(true)
    }
  }

  private handleClear(): void {
    if (this.cart.length > 0) {
      const confirmed = confirm('Clear all items from cart?')
      if (!confirmed) return
    }

    this.cart = POSService.clearCart()
    this.renderCart()
    this.showMessage('Cart cleared', 'info')
  }

  private setButtonsEnabled(enabled: boolean): void {
    this.dom.chargeButton.disabled = !enabled
    this.dom.quoteButton.disabled = !enabled
    this.dom.clearButton.disabled = !enabled

    if (!enabled) {
      this.dom.chargeButton.classList.add('btn-loading')
      this.dom.quoteButton.classList.add('btn-loading')
    } else {
      this.dom.chargeButton.classList.remove('btn-loading')
      this.dom.quoteButton.classList.remove('btn-loading')
    }
  }

  private renderProductGrid(): void {
    this.dom.productGrid.innerHTML = ''

    if (this.filteredProducts.length === 0) {
      this.dom.productGrid.innerHTML =
        '<p class="col-span-full text-center text-stone-500 pt-10">No products match your search.</p>'
      return
    }

    this.filteredProducts.forEach(product => {
      const card = document.createElement('button')
      card.className =
        'product-card p-3 bg-white dark:bg-stone-800 rounded-xl shadow-lg border border-stone-200 dark:border-stone-700 text-left hover:ring-2 hover:ring-primary transition duration-150 flex flex-col items-center text-center'

      card.innerHTML = `
        <div class="w-full h-20 mb-2 rounded-lg bg-primary/10 dark:bg-primary/20 flex items-center justify-center overflow-hidden">
          <img src="${product.image || 'https://placehold.co/80x80/2DD4BF/000?text=Item'}" 
               alt="${product.name}" 
               class="h-full w-auto object-cover opacity-80"
               onerror="this.src='https://placehold.co/80x80/2DD4BF/000?text=Item'" />
        </div>
        <p class="text-sm font-semibold text-stone-900 dark:text-stone-100 w-full truncate mt-1">${product.name}</p>
        <p class="text-xs font-bold text-primary w-full mt-1">${POSService.formatCurrency(product.price)}</p>
      `

      card.addEventListener('click', () => this.addToCart(product.id))
      this.dom.productGrid.appendChild(card)
    })
  }

  private renderCart(): void {
    this.dom.cartItemsList.innerHTML = ''

    if (this.cart.length === 0) {
      this.dom.emptyCartMessage.classList.remove('hidden')
      this.dom.chargeButton.disabled = true
      this.dom.quoteButton.disabled = true
      this.dom.chargeAmountSpan.textContent = POSService.formatCurrency(0)
    } else {
      this.dom.emptyCartMessage.classList.add('hidden')
      this.dom.chargeButton.disabled = false
      this.dom.quoteButton.disabled = false

      this.cart.forEach(item => {
        const lineTotal = item.price * item.quantity
        const itemElement = document.createElement('div')
        itemElement.className =
          'fade-in flex justify-between items-center bg-white dark:bg-stone-900 p-3 rounded-lg shadow-sm border border-stone-200 dark:border-stone-700'

        itemElement.innerHTML = `
          <div class="flex flex-col flex-grow">
            <span class="font-medium text-sm text-stone-900 dark:text-stone-100">${item.name}</span>
            <span class="text-xs text-stone-500 dark:text-stone-400">${POSService.formatCurrency(item.price)} x ${item.quantity}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center space-x-1">
              <button class="qty-btn w-6 h-6 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full text-sm font-bold hover:bg-stone-200 dark:hover:bg-stone-600 transition" data-id="${item.id}" data-change="-1">-</button>
              <span class="font-bold text-sm w-4 text-center">${item.quantity}</span>
              <button class="qty-btn w-6 h-6 bg-stone-100 dark:bg-stone-700 text-stone-700 dark:text-stone-300 rounded-full text-sm font-bold hover:bg-stone-200 dark:hover:bg-stone-600 transition" data-id="${item.id}" data-change="1">+</button>
            </div>
            <span class="font-bold text-base text-primary w-20 text-right">${POSService.formatCurrency(lineTotal)}</span>
          </div>
        `

        // Add event listeners for quantity buttons
        itemElement.querySelectorAll('.qty-btn').forEach(btn => {
          btn.addEventListener('click', (e) => {
            const target = e.target as HTMLButtonElement
            const id = parseInt(target.dataset.id!)
            const change = parseInt(target.dataset.change!)
            this.updateQuantity(id, change)
          })
        })

        this.dom.cartItemsList.appendChild(itemElement)
      })
    }

    // Update totals
    const totals = POSService.calculateTotals(this.cart, this.TAX_RATE)
    this.dom.subtotalDisplay.textContent = POSService.formatCurrency(totals.subtotal)
    this.dom.taxDisplay.textContent = POSService.formatCurrency(totals.tax)
    this.dom.totalDisplay.textContent = POSService.formatCurrency(totals.total)
    this.dom.chargeAmountSpan.textContent = POSService.formatCurrency(totals.total)
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const colorMap = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    }

    this.dom.statusMessage.textContent = message
    this.dom.statusMessage.className = `${colorMap[type]} p-3 rounded-lg text-center font-medium transition-opacity duration-300 mt-4 fade-in`
    this.dom.statusMessage.classList.remove('hidden')

    setTimeout(() => {
      this.dom.statusMessage.classList.add('hidden')
    }, 5000)
  }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const app = new POSApp()
  
  // Expose app instance globally for development/debugging
  ;(window as any).__posApp = app
})

// Register service worker for PWA functionality
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(registration => {
        console.log('✅ Service Worker registered:', registration)
      })
      .catch(error => {
        console.warn('⚠️ Service Worker registration failed:', error)
      })
  })
}



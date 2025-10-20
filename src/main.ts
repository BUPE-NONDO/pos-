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
    moonIcon: document.getElementById('moonIcon') as HTMLElement | null,
    sunIcon: document.getElementById('sunIcon') as HTMLElement | null,
    installButton: document.getElementById('installButton') as HTMLButtonElement | null,
  }

  // PWA Install prompt
  private deferredPrompt: any = null

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

    // Set up PWA install
    this.setupPWAInstall()

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
        image: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=200&h=200&fit=crop',
      },
      {
        id: 2,
        name: 'Multivitamins (60 caps)',
        price: 120.0,
        sku: 'SUP002',
        image: 'https://images.unsplash.com/photo-1550572017-4fade99d4575?w=200&h=200&fit=crop',
      },
      {
        id: 3,
        name: 'Alcohol Swabs (100pk)',
        price: 35.0,
        sku: 'FIRST03',
        image: 'https://images.unsplash.com/photo-1603398938378-e54eab446dde?w=200&h=200&fit=crop',
      },
      {
        id: 4,
        name: 'Adult Diapers (10pk)',
        price: 180.0,
        sku: 'CARE004',
        image: 'https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=200&h=200&fit=crop',
      },
      {
        id: 5,
        name: 'Band-Aids (50 strips)',
        price: 50.0,
        sku: 'FIRST05',
        image: 'https://images.unsplash.com/photo-1603560987833-5b36f7e9b5fe?w=200&h=200&fit=crop',
      },
      {
        id: 6,
        name: 'Cough Syrup (100ml)',
        price: 75.0,
        sku: 'MED006',
        image: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?w=200&h=200&fit=crop',
      },
      {
        id: 7,
        name: 'Digital Thermometer',
        price: 90.0,
        sku: 'EQUIP07',
        image: 'https://images.unsplash.com/photo-1584362917165-526a968579e8?w=200&h=200&fit=crop',
      },
      {
        id: 8,
        name: 'Antiseptic Cream (50g)',
        price: 60.0,
        sku: 'FIRST08',
        image: 'https://images.unsplash.com/photo-1556228578-0d85b1a4d571?w=200&h=200&fit=crop',
      },
      {
        id: 9,
        name: 'Rehydration Salts (3pk)',
        price: 30.0,
        sku: 'SUP009',
        image: 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop',
      },
      {
        id: 10,
        name: 'Cotton Wool (200g)',
        price: 40.0,
        sku: 'FIRST10',
        image: 'https://images.unsplash.com/photo-1612277795421-9bc7706a4a34?w=200&h=200&fit=crop',
      },
    ]

    this.filteredProducts = [...this.products]
    this.renderProductGrid()
  }

  private setupEventListeners(): void {
    // Search functionality
    this.dom.productSearch.addEventListener('input', e => {
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
      (!localStorage.getItem('darkMode') &&
        window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (isDark) {
      html.classList.add('dark')
      this.dom.sunIcon?.classList.remove('hidden')
      this.dom.moonIcon?.classList.add('hidden')
    }
  }

  private toggleDarkMode(): void {
    const html = document.documentElement
    const isDark = html.classList.toggle('dark')
    localStorage.setItem('darkMode', isDark.toString())

    if (isDark) {
      this.dom.sunIcon?.classList.remove('hidden')
      this.dom.moonIcon?.classList.add('hidden')
    } else {
      this.dom.sunIcon?.classList.add('hidden')
      this.dom.moonIcon?.classList.remove('hidden')
    }
  }

  private checkBackendConnection(): void {
    const status = getSupabaseStatus()
    if (!isSupabaseConfigured()) {
      console.warn('⚠️ Running in offline mode:', status)
      console.warn(
        '💡 Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env to enable cloud sync'
      )
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

    this.filteredProducts.forEach((product, index) => {
      const card = document.createElement('button')
      card.className =
        'product-card group p-4 bg-gradient-to-br from-primary/60 via-purple-dark/80 to-primary/60 backdrop-blur-sm rounded-2xl shadow-lg hover:shadow-glow-gold border-2 border-gold/30 hover:border-gold/60 transition-all duration-300 flex items-center sm:flex-col sm:items-center gap-4 sm:gap-0 sm:text-center hover:-translate-y-1 hover:scale-[1.02] active:scale-95'
      
      // Add stagger animation delay
      card.style.animationDelay = `${index * 0.05}s`

      card.innerHTML = `
        <div class="w-20 h-20 sm:w-full sm:h-24 flex-shrink-0 rounded-xl bg-gradient-to-br from-purple-dark/50 to-primary/50 flex items-center justify-center overflow-hidden ring-2 ring-gold/40 group-hover:ring-gold/70 transition-all duration-300">
          <img src="${product.image || 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'}" 
               alt="${product.name}" 
               class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
               onerror="this.src='https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'" />
        </div>
        <div class="flex-1 sm:w-full sm:mt-3">
          <p class="text-base sm:text-sm font-semibold text-white line-clamp-2 sm:truncate group-hover:text-gold transition-colors duration-300">${product.name}</p>
          <div class="inline-block mt-1 px-3 py-1 rounded-full bg-gradient-to-r from-gold/20 to-gold/30 border border-gold/40">
            <p class="text-sm sm:text-xs font-bold text-gold">${POSService.formatCurrency(product.price)}</p>
          </div>
        </div>
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
          'cart-item-fade-in flex justify-between items-center bg-gradient-to-r from-primary/50 to-purple-dark/50 backdrop-blur-sm p-3 rounded-xl shadow-md border-2 border-gold/30 hover:border-gold/50 transition-all duration-300'

        itemElement.innerHTML = `
          <div class="flex flex-col flex-grow">
            <span class="font-semibold text-sm text-gold">${item.name}</span>
            <span class="text-xs text-white/70">${POSService.formatCurrency(item.price)} x ${item.quantity}</span>
          </div>
          <div class="flex items-center gap-3">
            <div class="flex items-center space-x-1 bg-purple-dark/60 rounded-full px-1 py-0.5 border border-gold/30">
              <button class="qty-btn w-7 h-7 bg-gradient-to-br from-primary to-accent text-white rounded-full text-sm font-bold hover:shadow-glow-purple active:scale-90 transition-all duration-200" data-id="${item.id}" data-change="-1">-</button>
              <span class="font-bold text-sm w-6 text-center text-gold">${item.quantity}</span>
              <button class="qty-btn w-7 h-7 bg-gradient-to-br from-primary to-gold text-white rounded-full text-sm font-bold hover:shadow-glow-gold active:scale-90 transition-all duration-200" data-id="${item.id}" data-change="1">+</button>
            </div>
            <span class="font-bold text-base text-gold w-20 text-right">${POSService.formatCurrency(lineTotal)}</span>
          </div>
        `

        // Add event listeners for quantity buttons
        itemElement.querySelectorAll('.qty-btn').forEach(btn => {
          btn.addEventListener('click', e => {
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

  /**
   * Set up PWA install functionality
   */
  private setupPWAInstall(): void {
    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', e => {
      // Prevent the default mini-infobar from appearing
      e.preventDefault()

      // Store the event for later use
      this.deferredPrompt = e

      // Show the install button
      if (this.dom.installButton) {
        this.dom.installButton.classList.remove('hidden')
        console.log('✅ PWA install prompt captured')
      }
    })

    // Handle install button click
    if (this.dom.installButton) {
      this.dom.installButton.addEventListener('click', async () => {
        if (!this.deferredPrompt) {
          console.log('⚠️ No install prompt available')
          this.showInstallInstructions()
          return
        }

        // Show the install prompt
        this.deferredPrompt.prompt()

        // Wait for user's response
        const { outcome } = await this.deferredPrompt.userChoice

        if (outcome === 'accepted') {
          console.log('✅ User accepted install')
          this.showMessage('App installing...', 'success')
        } else {
          console.log('❌ User dismissed install')
        }

        // Clear the prompt
        this.deferredPrompt = null

        // Hide the button
        if (this.dom.installButton) {
          this.dom.installButton.classList.add('hidden')
        }
      })
    }

    // Listen for app installed event
    window.addEventListener('appinstalled', () => {
      console.log('✅ PWA installed successfully')
      this.showMessage('App installed successfully! 🎉', 'success')
      this.deferredPrompt = null

      if (this.dom.installButton) {
        this.dom.installButton.classList.add('hidden')
      }
    })

    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      console.log('✅ App is running in standalone mode')
      if (this.dom.installButton) {
        this.dom.installButton.classList.add('hidden')
      }
    }
  }

  /**
   * Show install instructions for iOS and other browsers
   */
  private showInstallInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase()
    let instructions = ''

    if (/iphone|ipad|ipod/.test(userAgent)) {
      // iOS devices
      instructions =
        '📱 To install on iOS:\n\n' +
        '1. Tap the Share button (⬆️)\n' +
        '2. Scroll down and tap "Add to Home Screen"\n' +
        '3. Tap "Add" to confirm'
    } else if (/android/.test(userAgent)) {
      // Android devices
      instructions =
        '📱 To install on Android:\n\n' +
        '1. Tap the menu (⋮) in your browser\n' +
        '2. Tap "Add to Home screen" or "Install app"\n' +
        '3. Follow the prompts'
    } else {
      // Desktop browsers
      instructions =
        '💻 To install on your computer:\n\n' +
        "1. Look for the install icon in your browser's address bar\n" +
        '2. Click it and follow the prompts\n\n' +
        'Or use your browser menu: Settings → Install StockPilot'
    }

    alert(instructions)
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

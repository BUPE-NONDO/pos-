import { Product, CartItem } from '@/types/schemas'
import { POSService } from '@/lib/pos'
import { DatabaseService } from '@/lib/database'
import { PrintService } from '@/lib/print'
import { getSupabaseStatus, isSupabaseConfigured } from '@/lib/supabase'
import './styles.css'

/**
 * Taolo POS Application - Powered by Gifted Solutions
 * Modern point-of-sale system for Zambian businesses
 * @version 1.0.0
 */
class POSApp {
  private cart: CartItem[] = []
  private products: Product[] = []
  private filteredProducts: Product[] = []
  private cashierId: string = ''
  private readonly TAX_RATE = 0.16

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

  private deferredPrompt: unknown | null = null

  constructor() {
    this.initialize()
  }

  private async initialize(): Promise<void> {
    this.cashierId = POSService.generateCashierId()
    this.dom.userIdDisplay.textContent = this.cashierId
    this.loadProducts()
    this.setupEventListeners()
    this.setupDarkMode()
    this.setupPWAInstall()
    this.setupNetworkHandlers()
    this.checkBackendConnection()
    console.log('✅ Taolo POS v1.0 - Zambia Edition')
  }

  private setupNetworkHandlers(): void {
    const indicator = document.getElementById('networkIndicator') as HTMLDivElement | null
    const syncBadge = document.getElementById('syncBadge') as HTMLDivElement | null
    const pendingCountEl = document.getElementById('pendingCount') as HTMLSpanElement | null

    function updateIndicator() {
      if (!indicator) return
      if (navigator.onLine) {
        indicator.classList.remove('bg-gray-400')
        indicator.classList.remove('bg-red-400')
        indicator.classList.add('bg-green-400')
      } else {
        indicator.classList.remove('bg-green-400')
        indicator.classList.remove('bg-gray-400')
        indicator.classList.add('bg-red-400')
      }
    }

    updateIndicator()

    window.addEventListener('online', async () => {
      updateIndicator()
      // attempt to use Background Sync if available
      if ('serviceWorker' in navigator && 'SyncManager' in window) {
        try {
          const reg = await navigator.serviceWorker.ready
          // runtime-check: SyncManager may not be present in all browsers
          const maybeReg: unknown = reg
          // runtime-check for SyncManager - use a small allowed any here
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          if (typeof (maybeReg as any).sync === 'object' && typeof (maybeReg as any).sync.register === 'function') {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            await (maybeReg as any).sync.register('sync-mutations')
          }
          console.log('✅ Registered background sync: sync-mutations')
        } catch {
          console.warn('⚠️ Background sync registration failed')
          // fallback: post message to service worker to start immediate sync
          navigator.serviceWorker.controller?.postMessage({ type: 'SYNC_MUTATIONS' })
        }
      } else if (navigator.serviceWorker && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SYNC_MUTATIONS' })
      }

      // also attempt client-side drain as a fallback
      try {
        const syncModule = await import('@/lib/sync')
        await syncModule.drain()
      } catch {
        // ignore for now
      }
    })

    window.addEventListener('offline', () => {
      updateIndicator()
    })

    // Listen for service worker messages about sync
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', async (event) => {
        const data = event.data || {}
        if (data.type === 'SYNC_STARTED') {
          if (syncBadge) syncBadge.classList.remove('hidden')
        }
        if (data.type === 'SYNC_COMPLETE') {
          if (syncBadge) syncBadge.classList.add('hidden')
        }

        if (data.type === 'SYNC_MUTATIONS') {
          try {
            const syncModule = await import('@/lib/sync')
            await syncModule.drain()
          } catch {
            // ignore
          }
        }
      })
    }

    // Poll pending mutation count every 5s
    try {
      // dynamic import to avoid circular issues
      window.setInterval(async () => {
        try {
          const offlineModule = await import('@/lib/offline')
          const count = await offlineModule.getPendingCount()
          if (pendingCountEl) pendingCountEl.textContent = String(count)
          if (syncBadge) {
            if (count > 0) syncBadge.classList.remove('hidden')
            else syncBadge.classList.add('hidden')
          }
        } catch {
          // ignore
        }
      }, 5000)
    } catch {
      // ignore
    }
  }

  private loadProducts(): void {
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
    this.dom.productSearch.addEventListener('input', e => {
      const target = e.target as HTMLInputElement
      this.handleSearch(target.value)
    })

    this.dom.chargeButton.addEventListener('click', () => this.handleCharge())
    this.dom.quoteButton.addEventListener('click', () => this.handleQuote())
    this.dom.clearButton.addEventListener('click', () => this.handleClear())
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
    } else {
      html.classList.remove('dark')
      this.dom.sunIcon?.classList.add('hidden')
      this.dom.moonIcon?.classList.remove('hidden')
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
      console.warn('⚠️ Offline mode - Set Supabase credentials in .env for cloud sync')
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

      await DatabaseService.saveTransaction(transaction)
      PrintService.printReceipt(transaction)
      this.showMessage(
        `Transaction Complete! ${POSService.formatCurrency(totals.total)}`,
        'success'
      )
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

      await DatabaseService.saveQuotation(quotation)
      PrintService.printQuotation(quotation)
      this.showMessage(`Quotation ${quoteId} saved!`, 'success')
      this.cart = POSService.clearCart()
      this.renderCart()
    } catch (error) {
      console.error('Quotation error:', error)
      this.showMessage('Failed to save quotation.', 'error')
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
        '<p class="col-span-full text-center text-gray-500 dark:text-gray-400 pt-10">No products match your search.</p>'
      return
    }

    this.filteredProducts.forEach((product, index) => {
      const card = document.createElement('button')
      card.className =
        'product-card group p-4 bg-white dark:bg-gray-800 rounded-xl shadow-card hover:shadow-card-hover border border-gray-200 dark:border-gray-700 transition-all duration-200 flex items-center sm:flex-col sm:items-center gap-4 sm:gap-0 sm:text-center hover:-translate-y-0.5 active:scale-[0.98]'

      card.style.animationDelay = `${index * 0.03}s`

      card.innerHTML = `
        <div class="w-20 h-20 sm:w-full sm:h-28 flex-shrink-0 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center overflow-hidden">
          <img src="${product.image || 'https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'}" 
               alt="${product.name}" 
               class="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
               onerror="this.src='https://images.unsplash.com/photo-1471864190281-a93a3070b6de?w=200&h=200&fit=crop'" />
        </div>
        <div class="flex-1 sm:w-full sm:mt-3">
          <p class="text-sm font-medium text-gray-900 dark:text-white line-clamp-2 mb-2">${product.name}</p>
          <p class="text-base font-semibold text-primary">${POSService.formatCurrency(product.price)}</p>
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
          'cart-item-fade-in flex justify-between items-center bg-white dark:bg-gray-900 p-3.5 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 transition-all duration-200'

        itemElement.innerHTML = `
          <div class="flex flex-col flex-grow min-w-0">
            <span class="font-medium text-sm text-gray-900 dark:text-white truncate">${item.name}</span>
            <span class="text-xs text-gray-500 dark:text-gray-400">${POSService.formatCurrency(item.price)} × ${item.quantity}</span>
          </div>
          <div class="flex items-center gap-3 ml-3">
            <div class="flex items-center space-x-1 bg-gray-100 dark:bg-gray-800 rounded-lg px-1 py-0.5">
              <button class="qty-btn w-7 h-7 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-md text-sm font-medium hover:bg-gray-300 dark:hover:bg-gray-600 active:scale-95 transition-all duration-150" data-id="${item.id}" data-change="-1">−</button>
              <span class="font-semibold text-sm w-8 text-center text-gray-900 dark:text-white">${item.quantity}</span>
              <button class="qty-btn w-7 h-7 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary/90 active:scale-95 transition-all duration-150" data-id="${item.id}" data-change="1">+</button>
            </div>
            <span class="font-semibold text-base text-gray-900 dark:text-white w-20 text-right">${POSService.formatCurrency(lineTotal)}</span>
          </div>
        `

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

    const totals = POSService.calculateTotals(this.cart, this.TAX_RATE)
    this.dom.subtotalDisplay.textContent = POSService.formatCurrency(totals.subtotal)
    this.dom.taxDisplay.textContent = POSService.formatCurrency(totals.tax)
    this.dom.totalDisplay.textContent = POSService.formatCurrency(totals.total)
    this.dom.chargeAmountSpan.textContent = POSService.formatCurrency(totals.total)
  }

  private showMessage(message: string, type: 'success' | 'error' | 'warning' | 'info'): void {
    const colorMap = {
      success:
        'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-300 dark:border-green-800',
      error:
        'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-300 dark:border-red-800',
      warning:
        'bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-300 dark:border-yellow-800',
      info: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-300 dark:border-blue-800',
    }

    this.dom.statusMessage.textContent = message
    this.dom.statusMessage.className = `${colorMap[type]} p-3 rounded-lg text-center text-sm font-medium border transition-opacity duration-200 mt-4 fade-in`
    this.dom.statusMessage.classList.remove('hidden')

    setTimeout(() => {
      this.dom.statusMessage.classList.add('hidden')
    }, 5000)
  }

  private setupPWAInstall(): void {
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault()
      this.deferredPrompt = e

      if (this.dom.installButton) {
        this.dom.installButton.classList.remove('hidden')
      }
    })

    if (this.dom.installButton) {
      this.dom.installButton.addEventListener('click', async () => {
        if (!this.deferredPrompt) {
          this.showInstallInstructions()
          return
        }

        // runtime-check the shape of the deferredPrompt
        const dp = this.deferredPrompt as unknown as { prompt?: () => void; userChoice?: Promise<{ outcome?: string }> }
        if (dp && typeof dp.prompt === 'function') {
          dp.prompt()
          try {
            const uc = await (dp.userChoice ?? Promise.resolve({}))
            const outcome = (uc as { outcome?: string } | undefined)?.outcome
            if (outcome === 'accepted') {
              this.showMessage('App installing...', 'success')
            }
          } catch {
            // ignore
          }
        }

        this.deferredPrompt = null

        if (this.dom.installButton) {
          this.dom.installButton.classList.add('hidden')
        }
      })
    }

    window.addEventListener('appinstalled', () => {
      this.showMessage('App installed successfully! 🎉', 'success')
      this.deferredPrompt = null

      if (this.dom.installButton) {
        this.dom.installButton.classList.add('hidden')
      }
    })

    if (window.matchMedia('(display-mode: standalone)').matches) {
      if (this.dom.installButton) {
        this.dom.installButton.classList.add('hidden')
      }
    }
  }

  private showInstallInstructions(): void {
    const userAgent = navigator.userAgent.toLowerCase()
    let instructions = ''

    if (/iphone|ipad|ipod/.test(userAgent)) {
      instructions = '📱 iOS:\n1. Tap Share (⬆️)\n2. Add to Home Screen\n3. Tap Add'
    } else if (/android/.test(userAgent)) {
      instructions = '📱 Android:\n1. Tap menu (⋮)\n2. Add to Home screen\n3. Follow prompts'
    } else {
      instructions =
        '💻 Desktop:\n1. Look for install icon in address bar\n2. Click and follow prompts'
    }

    alert(instructions)
  }
}

document.addEventListener('DOMContentLoaded', () => {
  const app = new POSApp()
  window.__posApp = app as unknown
})

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/service-worker.js')
      .then(() => console.log('✅ Service Worker registered'))
      .catch(() => console.warn('⚠️ Service Worker registration failed'))
  })
}

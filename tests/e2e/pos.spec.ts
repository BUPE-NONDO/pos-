import { test, expect } from '@playwright/test'

test.describe('StockPilot POS - E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    // Wait for the app to fully load
    await page.waitForSelector('#productGrid')
  })

  test('should display the POS interface correctly', async ({ page }) => {
    // Check header elements
    await expect(page.locator('text=StockPilot POS')).toBeVisible()
    await expect(page.locator('#userIdDisplay')).toBeVisible()
    await expect(page.locator('#darkModeToggle')).toBeVisible()

    // Check catalog section
    await expect(page.locator('text=Pharmacy Catalog')).toBeVisible()
    await expect(page.locator('#productSearch')).toBeVisible()
    await expect(page.locator('#productGrid')).toBeVisible()

    // Check cart section
    await expect(page.locator('text=Transaction Cart')).toBeVisible()
    await expect(page.locator('#chargeButton')).toBeVisible()
    await expect(page.locator('#quoteButton')).toBeVisible()
    await expect(page.locator('#clearButton')).toBeVisible()
  })

  test('should load and display products', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    
    // Wait for products to load
    await expect(productGrid.locator('button')).toHaveCount(10)

    // Check that first product is visible and has required elements
    const firstProduct = productGrid.locator('button').first()
    await expect(firstProduct).toBeVisible()
    await expect(firstProduct.locator('img')).toBeVisible()
    await expect(firstProduct.locator('text=Paracetamol')).toBeVisible()
  })

  test('should search and filter products', async ({ page }) => {
    const searchInput = page.locator('#productSearch')
    const productGrid = page.locator('#productGrid')

    // Initially should show all 10 products
    await expect(productGrid.locator('button')).toHaveCount(10)

    // Search for "para"
    await searchInput.fill('para')
    await page.waitForTimeout(300) // Debounce

    // Should show only Paracetamol
    await expect(productGrid.locator('button')).toHaveCount(1)
    await expect(productGrid.locator('text=Paracetamol')).toBeVisible()

    // Clear search
    await searchInput.fill('')
    await page.waitForTimeout(300)

    // Should show all products again
    await expect(productGrid.locator('button')).toHaveCount(10)
  })

  test('should add product to cart', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const cartList = page.locator('#cartItemsList')
    const emptyMessage = page.locator('#emptyCartMessage')

    // Initially cart should be empty
    await expect(emptyMessage).toBeVisible()

    // Click on first product
    await productGrid.locator('button').first().click()

    // Empty message should disappear
    await expect(emptyMessage).not.toBeVisible()

    // Cart should contain the item
    await expect(cartList.locator('.fade-in')).toHaveCount(1)
    await expect(cartList.locator('text=Paracetamol')).toBeVisible()

    // Totals should update
    await expect(page.locator('#subtotalDisplay')).not.toHaveText('ZMW 0.00')
    await expect(page.locator('#totalDisplay')).not.toHaveText('ZMW 0.00')

    // Buttons should be enabled
    await expect(page.locator('#chargeButton')).toBeEnabled()
    await expect(page.locator('#quoteButton')).toBeEnabled()
  })

  test('should increment product quantity in cart', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const cartList = page.locator('#cartItemsList')

    // Add product to cart
    await productGrid.locator('button').first().click()

    // Click add button again (or use + button in cart)
    await productGrid.locator('button').first().click()

    // Should still have only 1 cart item but with quantity 2
    await expect(cartList.locator('.fade-in')).toHaveCount(1)
    await expect(cartList.locator('text=x 2')).toBeVisible()
  })

  test('should update quantity using cart controls', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const cartList = page.locator('#cartItemsList')

    // Add product to cart
    await productGrid.locator('button').first().click()

    // Click the + button
    await cartList.locator('button[data-change="1"]').click()
    await expect(cartList.locator('text=x 2')).toBeVisible()

    // Click the - button
    await cartList.locator('button[data-change="-1"]').click()
    await expect(cartList.locator('text=x 1')).toBeVisible()

    // Click - again to remove item
    await cartList.locator('button[data-change="-1"]').click()
    await expect(page.locator('#emptyCartMessage')).toBeVisible()
  })

  test('should clear cart', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const clearButton = page.locator('#clearButton')
    const emptyMessage = page.locator('#emptyCartMessage')

    // Add a product to cart
    await productGrid.locator('button').first().click()
    await expect(emptyMessage).not.toBeVisible()

    // Click clear button and confirm
    page.on('dialog', dialog => dialog.accept())
    await clearButton.click()

    // Cart should be empty
    await expect(emptyMessage).toBeVisible()
    await expect(page.locator('#chargeButton')).toBeDisabled()
    await expect(page.locator('#quoteButton')).toBeDisabled()
  })

  test('should toggle dark mode', async ({ page }) => {
    const darkModeToggle = page.locator('#darkModeToggle')
    const html = page.locator('html')

    // Get initial state
    const initialHasClass = await html.evaluate(el => el.classList.contains('dark'))

    // Click toggle
    await darkModeToggle.click()

    // Wait for transition
    await page.waitForTimeout(100)

    // Class should have toggled
    const afterClick = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterClick).toBe(!initialHasClass)

    // Toggle again
    await darkModeToggle.click()
    await page.waitForTimeout(100)

    // Should return to initial state
    const afterSecondClick = await html.evaluate(el => el.classList.contains('dark'))
    expect(afterSecondClick).toBe(initialHasClass)
  })

  test('should add multiple different products to cart', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const cartList = page.locator('#cartItemsList')

    // Add first product
    await productGrid.locator('button').nth(0).click()

    // Add second product
    await productGrid.locator('button').nth(1).click()

    // Add third product
    await productGrid.locator('button').nth(2).click()

    // Should have 3 items in cart
    await expect(cartList.locator('.fade-in')).toHaveCount(3)

    // Check that totals are calculated
    const totalText = await page.locator('#totalDisplay').textContent()
    expect(totalText).not.toBe('ZMW 0.00')
  })

  test('should calculate totals correctly', async ({ page }) => {
    const productGrid = page.locator('#productGrid')

    // Add Paracetamol (45 ZMW)
    await productGrid.locator('text=Paracetamol').click()

    // Get displayed totals
    const subtotalText = await page.locator('#subtotalDisplay').textContent()
    const taxText = await page.locator('#taxDisplay').textContent()
    const totalText = await page.locator('#totalDisplay').textContent()

    // Subtotal should be 45
    expect(subtotalText).toContain('45')

    // Tax should be 16% of 45 = 7.20
    expect(taxText).toContain('7.20')

    // Total should be 52.20
    expect(totalText).toContain('52.20')
  })

  test('should show status messages', async ({ page }) => {
    const productGrid = page.locator('#productGrid')
    const clearButton = page.locator('#clearButton')
    const statusMessage = page.locator('#statusMessage')

    // Add product
    await productGrid.locator('button').first().click()

    // Click clear and accept dialog
    page.on('dialog', dialog => dialog.accept())
    await clearButton.click()

    // Status message should appear
    await expect(statusMessage).toBeVisible()
    await expect(statusMessage).toContainText('Cart cleared')

    // Message should disappear after timeout
    await page.waitForTimeout(5500)
    await expect(statusMessage).toBeHidden()
  })
})

test.describe('StockPilot POS - Mobile View', () => {
  test.use({ viewport: { width: 375, height: 667 } })

  test('should be responsive on mobile', async ({ page }) => {
    await page.goto('/')

    // Main elements should still be visible
    await expect(page.locator('text=StockPilot POS')).toBeVisible()
    await expect(page.locator('#productGrid')).toBeVisible()
    await expect(page.locator('#cartItemsList')).toBeVisible()

    // Products should be in grid
    const productGrid = page.locator('#productGrid')
    await expect(productGrid.locator('button')).toHaveCount(10)

    // Add product and verify cart works on mobile
    await productGrid.locator('button').first().click()
    await expect(page.locator('#emptyCartMessage')).not.toBeVisible()
  })
})



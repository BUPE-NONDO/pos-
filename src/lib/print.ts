import { Transaction, Quotation } from '@/types/schemas'
import { POSService } from './pos'

/**
 * Print Service - Handles receipt and quotation printing
 * Generates print-optimized HTML for thermal receipts and A4 quotations
 */

export class PrintService {
  /**
   * Print a thermal receipt for a completed transaction
   * @param transaction - The transaction to print
   */
  static printReceipt(transaction: Transaction): void {
    const date = new Date(transaction.timestamp).toLocaleString('en-ZM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    })

    const receiptHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Receipt - ${transaction.transId}</title>
        <style>
          @media print {
            @page { size: 80mm auto; margin: 0; }
            body { margin: 0; padding: 0; }
          }
          body {
            font-family: 'Courier New', monospace;
            width: 80mm;
            margin: 0 auto;
            padding: 5mm;
            font-size: 10pt;
          }
          .center { text-align: center; }
          .bold { font-weight: bold; }
          .header { margin-bottom: 1em; border-bottom: 1px dashed #000; padding-bottom: 0.5em; }
          .item-row { display: flex; justify-content: space-between; margin: 0.2em 0; }
          .totals { border-top: 1px solid #000; margin-top: 1em; padding-top: 0.5em; }
          .final-total { font-size: 1.2em; font-weight: bold; border-top: 2px solid #000; padding-top: 0.5em; }
          .footer { text-align: center; margin-top: 2em; font-size: 0.9em; }
          .receipt-actions { position: fixed; top: 10px; right: 10px; z-index: 1000; display: flex; gap: 8px; }
          @media print {
            button { display: none !important; }
            .receipt-actions { display: none !important; }
          }
          @media screen and (max-width: 768px) {
            .receipt-actions {
              position: static !important;
              justify-content: center;
              margin-bottom: 1em;
              padding: 10px;
              background: #f9fafb;
              border-radius: 8px;
            }
          }
        </style>
      </head>
      <body>
        <div class="receipt-actions">
          <button onclick="window.print()" style="padding: 8px 16px; background: #1173d4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: 600;">🖨️ Print</button>
          <button onclick="if(navigator.share){navigator.share({title:'StockPilot Receipt',text:'Transaction receipt'}).catch(e=>console.log(e))}" style="padding: 8px 16px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 12px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); font-weight: 600;">📤 Share</button>
        </div>
        <div class="header center">
          <h2 class="bold">StockPilot Pharmacy</h2>
          <p>Lusaka, Zambia<br>TIN: 100-000-000</p>
        </div>
        
        <div>
          <p><strong>Date:</strong> ${date}</p>
          <p><strong>Trans ID:</strong> ${transaction.transId}</p>
          <p><strong>Cashier:</strong> ${transaction.cashierId.substring(0, 15)}</p>
        </div>
        
        <div style="border-top: 1px dashed #000; margin: 1em 0; padding-top: 0.5em;">
          ${transaction.items
            .map(
              item => `
            <div class="item-row">
              <span>${item.name} (${item.quantity}x)</span>
              <span class="bold">${POSService.formatCurrency(item.price * item.quantity)}</span>
            </div>
          `
            )
            .join('')}
        </div>
        
        <div class="totals">
          <div class="item-row">
            <span>Subtotal:</span>
            <span>${POSService.formatCurrency(transaction.subtotal)}</span>
          </div>
          <div class="item-row">
            <span>VAT (${(transaction.taxRate * 100).toFixed(0)}%):</span>
            <span>${POSService.formatCurrency(transaction.tax)}</span>
          </div>
          <div class="item-row final-total">
            <span>TOTAL:</span>
            <span>${POSService.formatCurrency(transaction.totalAmount)}</span>
          </div>
        </div>
        
        <div class="footer">
          <p>*** THANK YOU FOR YOUR BUSINESS ***</p>
        </div>
      </body>
      </html>
    `

    this.openPrintWindow(receiptHTML)
  }

  /**
   * Print a formal A4 quotation document
   * @param quotation - The quotation to print
   */
  static printQuotation(quotation: Quotation): void {
    const date = new Date(quotation.timestamp).toLocaleString('en-ZM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const validUntil = new Date()
    validUntil.setDate(validUntil.getDate() + 30)
    const validUntilStr = validUntil.toLocaleString('en-ZM', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })

    const quotationHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Quotation - ${quotation.quoteId}</title>
        <style>
          @media print {
            @page { size: A4; margin: 2cm; }
          }
          body {
            font-family: Arial, sans-serif;
            margin: 2cm;
            color: #333;
            font-size: 10pt;
          }
          .header {
            text-align: center;
            margin-bottom: 2em;
            border-bottom: 2px solid #1173d4;
            padding-bottom: 1em;
          }
          .header h1 {
            font-size: 1.8em;
            color: #1173d4;
            margin: 0;
          }
          .details {
            display: flex;
            justify-content: space-between;
            margin-bottom: 1.5em;
          }
          .details div { width: 45%; }
          .details p { margin: 0.2em 0; }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 2em;
          }
          th, td {
            padding: 8px 12px;
            text-align: left;
            border-bottom: 1px solid #ddd;
          }
          th {
            background-color: #f0f0f0;
          }
          .total-section {
            border-top: 2px solid #333;
            padding-top: 1em;
            margin-top: 1em;
          }
          .total-row {
            display: flex;
            justify-content: flex-end;
            font-size: 1.1em;
            margin: 0.3em 0;
          }
          .total-row span:first-child {
            font-weight: bold;
            width: 150px;
            text-align: right;
            margin-right: 20px;
          }
          .total-row span:last-child {
            width: 100px;
            text-align: right;
          }
          .final-total {
            font-size: 1.5em;
            color: #1173d4;
            margin-top: 0.5em;
            border-top: 1px solid #ddd;
            padding-top: 0.5em;
          }
          .notes {
            margin-top: 3em;
            font-size: 0.9em;
            border-top: 1px dashed #ccc;
            padding-top: 1em;
          }
          @media print {
            button { display: none !important; }
            .mobile-actions { display: none !important; }
          }
          @media screen and (max-width: 768px) {
            body {
              margin: 0.5cm;
              padding: 10px;
              font-size: 9pt;
            }
            .mobile-actions {
              position: static !important;
              display: flex !important;
              justify-content: center !important;
              flex-direction: row !important;
              margin-bottom: 1em;
              padding: 10px;
              background: #f9fafb;
              border-radius: 8px;
            }
            .header h1 {
              font-size: 1.4em;
            }
            .details {
              flex-direction: column;
            }
            .details div {
              width: 100% !important;
              margin-bottom: 1em;
            }
            table {
              font-size: 0.85em;
            }
            th, td {
              padding: 6px 4px;
            }
            .total-row {
              font-size: 1em;
            }
          }
        </style>
      </head>
      <body>
        <div class="mobile-actions">
          <button onclick="window.print()" style="padding: 10px 16px; background: #1173d4; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; font-weight: 600;">🖨️ Print</button>
          <button onclick="if(navigator.share){navigator.share({title:'StockPilot Quotation',text:'View your pharmacy quotation'}).catch(e=>console.log(e))}" style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 5px; cursor: pointer; font-size: 14px; box-shadow: 0 2px 4px rgba(0,0,0,0.2); white-space: nowrap; font-weight: 600;">📤 Share</button>
        </div>
        <div class="header">
          <h1>StockPilot Pharmacy - Quotation</h1>
          <p>Lusaka, Zambia | Email: sales@stockpilot.zm | Tel: +260 977 XXX XXX</p>
        </div>

        <div class="details">
          <div>
            <p><strong>Quotation Date:</strong> ${date}</p>
            <p><strong>Quote ID:</strong> ${quotation.quoteId}</p>
          </div>
          <div>
            <p><strong>Valid Until:</strong> ${validUntilStr}</p>
            <p><strong>Prepared by:</strong> ${quotation.preparedBy.substring(0, 20)}</p>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 50%;">Description</th>
              <th style="text-align: right;">Unit Price (ZMW)</th>
              <th style="text-align: center;">Qty</th>
              <th style="text-align: right;">Line Total (ZMW)</th>
            </tr>
          </thead>
          <tbody>
            ${quotation.items
              .map(
                item => `
              <tr>
                <td>${item.name}</td>
                <td style="text-align: right;">${POSService.formatCurrency(item.price).replace('ZMW', '').trim()}</td>
                <td style="text-align: center;">${item.quantity}</td>
                <td style="text-align: right;">${POSService.formatCurrency(
                  item.price * item.quantity
                )
                  .replace('ZMW', '')
                  .trim()}</td>
              </tr>
            `
              )
              .join('')}
          </tbody>
        </table>

        <div class="total-section">
          <div class="total-row">
            <span>Subtotal:</span>
            <span>${POSService.formatCurrency(quotation.subtotal)}</span>
          </div>
          <div class="total-row">
            <span>VAT (${(quotation.taxRate * 100).toFixed(0)}%):</span>
            <span>${POSService.formatCurrency(quotation.tax)}</span>
          </div>
          <div class="total-row final-total">
            <span>TOTAL QUOTE:</span>
            <span>${POSService.formatCurrency(quotation.totalAmount)}</span>
          </div>
        </div>

        <div class="notes">
          <p><strong>Note:</strong> Prices are valid for 30 days and are subject to stock availability.</p>
          <p>For inquiries, please reference Quote ID: ${quotation.quoteId}.</p>
        </div>
      </body>
      </html>
    `

    this.openPrintWindow(quotationHTML)
  }

  /**
   * Check if user is on mobile device
   */
  private static isMobileDevice(): boolean {
    return (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
      window.innerWidth <= 768
    )
  }

  /**
   * Open a new window with print dialog (optimized for mobile and desktop)
   * @param html - HTML content to print
   */
  private static openPrintWindow(html: string): void {
    const isMobile = this.isMobileDevice()

    try {
      if (isMobile) {
        // Mobile-optimized approach: Create a viewable page
        this.openMobileViewPage(html)
      } else {
        // Desktop: Try traditional print window
        this.openDesktopPrintWindow(html)
      }
    } catch (error) {
      console.error('Print window error:', error)
      // Fallback: Download as HTML
      this.downloadAsHTML(html)
    }
  }

  /**
   * Mobile-optimized view page with share and download options
   */
  private static openMobileViewPage(html: string): void {
    // Create a blob URL for the content
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)

    // Try to open in new tab
    const newWindow = window.open(url, '_blank')

    if (!newWindow) {
      // Fallback: Download the file
      this.downloadAsHTML(html)
      alert(
        '📱 Document ready!\n\n' +
          'The document has been downloaded.\n' +
          'Open it to view, share, or print.'
      )
    } else {
      // Clean up blob URL after a delay
      setTimeout(() => URL.revokeObjectURL(url), 5000)
    }
  }

  /**
   * Desktop print window
   */
  private static openDesktopPrintWindow(html: string): void {
    const printWindow = window.open('', '_blank', 'height=800,width=800,scrollbars=yes')

    if (!printWindow || printWindow.closed || typeof printWindow.closed === 'undefined') {
      // Popup blocked - download instead
      this.downloadAsHTML(html)
      alert(
        '✅ Document downloaded!\n\n' +
          'Popup blocker detected. The document has been downloaded.\n' +
          'Open it and click the Print button.'
      )
      return
    }

    // Write content and trigger print
    printWindow.document.open()
    printWindow.document.write(html)
    printWindow.document.close()

    // Wait for content to load before printing
    printWindow.onload = () => {
      printWindow.focus()
      setTimeout(() => {
        printWindow.print()
      }, 250)
    }
  }

  /**
   * Download HTML as file
   */
  private static downloadAsHTML(html: string): void {
    const blob = new Blob([html], { type: 'text/html' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `StockPilot-Document-${Date.now()}.html`
    a.style.display = 'none'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    setTimeout(() => URL.revokeObjectURL(url), 100)
  }
}

import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, calculateTotal, formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, CheckCircle2, Loader2 } from 'lucide-react';
import { toPng } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAdSystem } from '../hooks/useAdSystem';
import { MockAdVideo } from '../components/MockAdVideo';

export const PreviewScreen = () => {
  const { getInvoice, currency, markAsPaid, theme } = useStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [showAd, setShowAd] = useState(false);
  
  const { isOnline, markRewarded, hasRewarded } = useAdSystem();
  
  const invoice = getInvoice(id || '');

  useEffect(() => {
    if (invoice && hasRewarded('invoice', invoice.id)) {
      setRemoveWatermark(true);
    }
  }, [invoice, hasRewarded]);

  if (!invoice) {
    return <div className="p-6 text-center">Invoice not found</div>;
  }

  const total = calculateTotal(invoice.items);

  const isDark = theme === 'dark';
  const templateColor = invoice.template?.color;
  const displayColor = isDark && templateColor === '#141414' ? '#ffffff' : templateColor;

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareAction = async (action: 'share_image' | 'share_pdf' | 'download_image' | 'download_pdf' | 'share_text' | 'print' | 'whatsapp') => {
    setIsSharing(true);
    setShowShareMenu(false);
    
    try {
      if (action === 'share_text') {
        const text = `Your invoice is ready, please make payment to the account details on the invoice`;
        if (navigator.share) {
          await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text });
        } else {
          alert('Text sharing is not supported on this device.');
        }
        return;
      }

      if (!invoiceRef.current) return;

      // Use html-to-image instead of html2canvas to handle modern CSS colors
      const dataUrl = await toPng(invoiceRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
        filter: (node) => {
          if (node.classList && node.classList.contains('hide-on-export')) {
            return false;
          }
          return true;
        }
      });

      if (action === 'whatsapp') {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        const file = new File([blob], `Invoice-${invoice.invoiceNumber}.png`, { type: 'image/png' });

        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        if (isMobile && navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch (err: any) {
            if (err.name !== 'AbortError') downloadFile(file);
          }
        } else {
          try {
            await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
            const text = encodeURIComponent(`Your invoice is ready, please make payment to the account details on the invoice`);
            window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
            alert('✅ Invoice image copied to clipboard!\n\nWhen WhatsApp Web opens, just paste (Ctrl+V or Cmd+V) into the chat to attach the image.');
          } catch (err) {
            downloadFile(file);
            const text = encodeURIComponent(`Your invoice is ready, please make payment to the account details on the invoice\n\n(Please attach the downloaded image)`);
            window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
          }
        }
        return;
      }
      
      let file: File;
      const isPdf = action === 'share_pdf' || action === 'download_pdf' || action === 'print';
      
      if (!isPdf) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        file = new File([blob], `Invoice-${invoice.invoiceNumber}.png`, { type: 'image/png' });
      } else {
        const pdf = new jsPDF({
          orientation: 'portrait',
          unit: 'px',
          format: [invoiceRef.current.offsetWidth * 2, invoiceRef.current.offsetHeight * 2]
        });
        pdf.addImage(dataUrl, 'PNG', 0, 0, invoiceRef.current.offsetWidth * 2, invoiceRef.current.offsetHeight * 2);
        const pdfBlob = pdf.output('blob');
        
        if (action === 'print') {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          } else {
            // Fallback if popup blocked
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
              setTimeout(() => {
                iframe.contentWindow?.print();
              }, 150);
            };
          }
          return;
        }
        
        file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      }
      
      if (action.startsWith('share_')) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            // CRITICAL: Omitting title and text ensures WhatsApp accepts the file instead of falling back to text
            await navigator.share({
              files: [file]
            });
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              downloadFile(file);
            }
          }
        } else {
          downloadFile(file);
        }
      } else {
        downloadFile(file);
      }
    } catch (err) {
      console.error('Action failed', err);
      alert('Failed to process request. Please try again.');
    } finally {
      setIsSharing(false);
    }
  };

  const handleMarkPaid = () => {
    markAsPaid(invoice.id);
    navigate(`/receipt/${invoice.id}`);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 pt-4 pb-48"
    >
      <div 
        ref={invoiceRef}
        className="relative bg-surface-lowest rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/5"
      >
        {/* Header Section */}
        <div className="p-8 md:p-10 pb-6">
          <div className="flex justify-between items-start mb-10">
            <div>
              <div className="hide-on-export inline-flex items-center gap-1.5 px-3 py-1 bg-surface-low text-on-surface-variant rounded-full text-[10px] font-bold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-outline-variant"></span>
                Unpaid
              </div>
              {invoice.brandName && (
                <p className="text-sm font-bold text-on-surface tracking-tight">{invoice.brandName}</p>
              )}
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Invoice</p>
              <p className="text-xs font-mono text-on-surface-variant">{invoice.invoiceNumber}</p>
            </div>
          </div>
          
          <div className="mb-8 w-full overflow-hidden">
            <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-2">Total Due</p>
            <h1 
              className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tighter break-all"
              style={{ color: displayColor || 'inherit' }}
            >
              {formatCurrency(total, currency.symbol)}
            </h1>
          </div>

          {/* Bento Grid for Info */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-surface-low/50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Billed To</p>
              <p className="text-sm font-bold text-on-surface">{invoice.customerName}</p>
            </div>
            <div className="bg-surface-low/50 rounded-2xl p-4">
              <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Date</p>
              <p className="text-sm font-bold text-on-surface">{formatDate(invoice.createdAt)}</p>
            </div>
          </div>
        </div>

        {/* Ticket Perforation Divider */}
        <div className="relative h-8 flex items-center justify-center overflow-hidden">
          <div className="absolute left-[-16px] w-8 h-8 bg-background rounded-full border border-outline-variant/10"></div>
          <div className="w-full border-t-2 border-dashed border-outline-variant/20 mx-6"></div>
          <div className="absolute right-[-16px] w-8 h-8 bg-background rounded-full border border-outline-variant/10"></div>
        </div>

        {/* Items Section */}
        <div className="p-8 md:p-10 pt-4">
          <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-on-surface-variant mb-6">Itemized Charges</h3>
          
          <div className="space-y-5">
            {invoice.items.map((item) => (
              <div key={item.id} className="flex justify-between items-start group">
                <div className="pr-4">
                  <h4 className="text-sm font-bold text-on-surface">{item.name}</h4>
                  <p className="text-on-surface-variant text-xs mt-1 font-mono">
                    {item.quantity} × {formatCurrency(item.price, currency.symbol)}
                  </p>
                </div>
                <span className="text-sm font-mono font-bold text-on-surface whitespace-nowrap mt-0.5">
                  {formatCurrency(item.quantity * item.price, currency.symbol)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Payment Details Section */}
        {invoice.bankDetails && (
          <div className="px-8 md:px-10 pb-8">
            <div 
              className="text-white rounded-3xl p-6 relative overflow-hidden"
              style={{ backgroundColor: invoice.template?.color || '#141414' }}
            >
              {/* Decorative gradient blob */}
              <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-3xl"></div>
              
              <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/50 mb-4 relative z-10">Payment Details</h3>
              <div className="space-y-2 relative z-10">
                {invoice.bankDetails.bankName && <p className="text-sm font-bold">{invoice.bankDetails.bankName}</p>}
                {invoice.bankDetails.accountNumber && <p className="text-xl font-mono font-bold tracking-wider text-secondary-container select-all">{invoice.bankDetails.accountNumber}</p>}
                {invoice.bankDetails.accountName && <p className="text-base font-medium text-white select-all">{invoice.bankDetails.accountName}</p>}
              </div>
            </div>
          </div>
        )}

        {/* Decorative Barcode */}
        <div className="px-8 md:px-10 pb-6 flex justify-center opacity-20">
          <div className="h-8 w-full max-w-[200px] flex gap-1 justify-center items-center">
            {[...Array(30)].map((_, i) => (
              <div key={i} className="h-full bg-on-surface" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
            ))}
          </div>
        </div>

        {/* App Branding Footer */}
        {!removeWatermark && (
          <div className="px-8 md:px-10 pb-8 flex items-center justify-center gap-2 opacity-40">
            <span className="text-[10px] font-bold uppercase tracking-widest">Generated by</span>
            <div className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="100" height="100" rx="24" fill="currentColor" />
                <path d="M30 34L50 68L70 34" stroke="white" strokeWidth="14" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="text-xs font-black tracking-tight">VendorFlow</span>
            </div>
          </div>
        )}

        {/* Watermark */}
        {!removeWatermark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-0">
            <p className="text-4xl sm:text-5xl md:text-6xl font-black text-on-surface opacity-[0.03] -rotate-45 select-none whitespace-nowrap">
              VendorFlow
            </p>
          </div>
        )}
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-surface-lowest border-t border-outline-variant/10 p-6 pb-safe shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
        <div className="max-w-3xl mx-auto space-y-4">
          {isOnline && !removeWatermark && (
            <div className="bg-surface-low rounded-2xl p-4 flex items-center justify-between">
              <span className="text-sm font-medium text-on-surface">Remove watermark</span>
              <button 
                onClick={() => setShowAd(true)}
                className="text-sm font-bold text-primary flex items-center gap-1 active:opacity-70 transition-opacity"
              >
                Watch short video
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </div>
          )}
          <div className="flex gap-4">
            <button 
              onClick={handleMarkPaid}
              className="flex-1 py-4 bg-secondary-container text-on-secondary-container rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              Mark as Paid
            </button>
            <button 
              onClick={() => setShowShareMenu(true)}
              disabled={isSharing}
              className="flex-1 py-4 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg disabled:opacity-70"
            >
              {isSharing ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Share2 size={18} strokeWidth={2.5} />}
              {isSharing ? 'Preparing...' : 'Share Invoice'}
            </button>
          </div>
        </div>
      </div>

      {showAd && (
        <MockAdVideo 
          type="rewarded"
          onClose={() => setShowAd(false)}
          onComplete={() => {
            markRewarded('invoice', invoice.id);
            setRemoveWatermark(true);
          }}
        />
      )}

      <AnimatePresence>
        {showShareMenu && (
          <div 
            className="fixed inset-0 bg-black/40 z-[100] flex items-end sm:items-center justify-center p-4"
            onClick={() => setShowShareMenu(false)}
          >
            <motion.div 
              initial={{ y: 100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 100, opacity: 0 }}
              className="bg-surface-lowest w-full max-w-sm rounded-[2rem] p-6 space-y-3 shadow-2xl mb-4 sm:mb-0"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-extrabold text-on-surface mb-4">Share or Save</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Direct Share</p>
                  <button 
                    onClick={() => handleShareAction('whatsapp')}
                    className="w-full py-3.5 bg-[#25D366] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    Send via WhatsApp
                  </button>
                  <p className="text-xs text-on-surface-variant text-center mt-2 px-2">
                    Image is copied to clipboard. Just paste it in the chat alongside the pre-filled text!
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Share via Device</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShareAction('share_image')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Image
                    </button>
                    <button 
                      onClick={() => handleShareAction('share_pdf')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      PDF
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Download to Device</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShareAction('download_image')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Image
                    </button>
                    <button 
                      onClick={() => handleShareAction('download_pdf')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      PDF
                    </button>
                  </div>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Other Actions</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShareAction('print')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Print
                    </button>
                    <button 
                      onClick={() => handleShareAction('share_text')}
                      className="flex-1 py-3.5 bg-surface-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Text Only
                    </button>
                  </div>
                </div>
              </div>

              <button 
                onClick={() => setShowShareMenu(false)}
                className="w-full py-4 mt-2 text-on-surface-variant font-bold text-sm flex items-center justify-center transition-all active:scale-[0.98]"
              >
                Cancel
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

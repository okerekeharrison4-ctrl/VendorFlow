import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, calculateTotal, formatDate } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, CheckCircle2, Home, Loader2 } from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAdSystem } from '../hooks/useAdSystem';
import { MockAdVideo } from '../components/MockAdVideo';
import { track } from '../utils/analytics';

export const ReceiptScreen = () => {
  const { getInvoice, currency, theme } = useStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const receiptRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [showRewardPrompt, setShowRewardPrompt] = useState(false);
  
  const { isOnline, markRewarded, hasRewarded, rewardedAdsWatchedThisSession } = useAdSystem();
  
  const invoice = getInvoice(id || '');

  useEffect(() => {
    if (invoice && hasRewarded('receipt', invoice.id)) {
      setRemoveWatermark(true);
    }
  }, [invoice, hasRewarded]);

  useEffect(() => {
    // Micro-delay before showing reward prompt
    const timer = setTimeout(() => {
      setShowRewardPrompt(true);
      if (isOnline && !removeWatermark) {
        track('reward_prompt_shown', { type: 'receipt', id: invoice?.id });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isOnline, removeWatermark, invoice?.id]);

  if (!invoice) {
    return <div className="p-6 text-center">Receipt not found</div>;
  }

  const total = calculateTotal(invoice.items);

  const isDark = theme === 'dark';
  const templateColor = invoice.template?.color;
  const displayColor = isDark && templateColor === '#141414' ? '#ffffff' : templateColor;
  const displayColor10 = isDark && templateColor === '#141414' ? '#ffffff10' : `${templateColor}10`;
  const displayColor20 = isDark && templateColor === '#141414' ? '#ffffff20' : `${templateColor}20`;

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
        const text = `Your receipt is ready, thank you for your payment!`;
        if (navigator.share) {
          await navigator.share({ title: `Receipt ${invoice.invoiceNumber}`, text });
        } else {
          alert('Text sharing is not supported on this device.');
        }
        return;
      }

      if (!receiptRef.current) return;

      // Small delay to ensure any animations or rendering are finished
      await new Promise(resolve => setTimeout(resolve, 100));

      const isPdf = action === 'share_pdf' || action === 'download_pdf' || action === 'print';
      const isWhatsApp = action === 'whatsapp';

      // Use toBlob for better performance and memory management
      const blob = await toBlob(receiptRef.current, { 
        pixelRatio: 2,
        backgroundColor: '#ffffff',
        cacheBust: true,
      });

      if (!blob) throw new Error('Failed to generate image blob');

      if (isWhatsApp) {
        const file = new File([blob], `Receipt-${invoice.invoiceNumber}.png`, { type: 'image/png' });
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
            const text = encodeURIComponent(`Your receipt is ready, thank you for your payment!`);
            window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
            alert('✅ Receipt image copied to clipboard!\n\nWhen WhatsApp Web opens, just paste (Ctrl+V or Cmd+V) into the chat to attach the image.');
          } catch (err) {
            downloadFile(file);
            const text = encodeURIComponent(`Your receipt is ready, thank you for your payment!\n\n(Please attach the downloaded image)`);
            window.open(`https://web.whatsapp.com/send?text=${text}`, '_blank');
          }
        }
        return;
      }
      
      let file: File;
      
      if (!isPdf) {
        file = new File([blob], `Receipt-${invoice.invoiceNumber}.png`, { type: 'image/png' });
      } else {
        // Convert blob to dataUrl for jsPDF
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve) => {
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });

        const img = new Image();
        await new Promise((resolve) => {
          img.onload = resolve;
          img.src = dataUrl;
        });

        const pdf = new jsPDF({
          orientation: img.width > img.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [img.width, img.height]
        });
        
        pdf.addImage(dataUrl, 'PNG', 0, 0, img.width, img.height);
        const pdfBlob = pdf.output('blob');
        
        if (action === 'print') {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(blobUrl, '_blank');
          if (printWindow) {
            printWindow.onload = () => {
              printWindow.print();
            };
          } else {
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
        
        file = new File([pdfBlob], `Receipt-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      }
      
      if (action.startsWith('share_')) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
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
      alert('Failed to process request. This might be due to device memory or browser restrictions. Please try again or use a different share option.');
    } finally {
      setIsSharing(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className="px-6 pt-8 pb-32 flex flex-col items-center"
    >
      <div ref={receiptRef} className="relative w-full max-w-md flex flex-col items-center bg-background pb-6 overflow-hidden">
        <div className="text-center mb-10 pt-4">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full mb-6 shadow-sm" style={{ backgroundColor: templateColor ? displayColor20 : 'var(--color-secondary-container)', color: templateColor ? displayColor : 'var(--color-secondary)' }}>
            <CheckCircle2 size={40} strokeWidth={2.5} />
          </div>
          <h2 className="text-4xl font-extrabold tracking-tight text-on-surface mb-3">PAID</h2>
          <p className="text-on-surface-variant text-sm">Payment successfully recorded for {invoice.customerName}.</p>
        </div>

        <div className="w-full bg-surface-lowest rounded-[2rem] shadow-[0_20px_40px_rgba(0,0,0,0.04)] overflow-hidden border border-outline-variant/5">
          {/* Header Section */}
          <div className="p-8 pb-6">
            <div className="flex justify-between items-start mb-8">
              <div>
                {invoice.brandName && (
                  <p className="text-sm font-bold text-on-surface tracking-tight">{invoice.brandName}</p>
                )}
              </div>
              <div className="text-right">
                <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Receipt</p>
                <p className="text-xs font-mono text-on-surface-variant">{invoice.invoiceNumber}</p>
              </div>
            </div>

            {/* Bento Grid for Info */}
            <div className="grid grid-cols-2 gap-3 mb-8">
              <div className="bg-surface-low/50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Receipt For</p>
                <p className="text-sm font-bold text-on-surface">{invoice.customerName}</p>
              </div>
              <div className="bg-surface-low/50 rounded-2xl p-4">
                <p className="text-[10px] font-bold text-outline-variant uppercase tracking-widest mb-1">Paid On</p>
                <p className="text-sm font-bold text-on-surface">{formatDate(invoice.paidAt || Date.now())}</p>
              </div>
            </div>
            
            <div className="rounded-3xl p-6 flex flex-col items-center justify-center border w-full overflow-hidden" style={{ backgroundColor: templateColor ? displayColor10 : 'var(--color-secondary-container)', borderColor: templateColor ? displayColor20 : 'var(--color-secondary)' }}>
              <p className="text-[10px] font-bold tracking-widest uppercase mb-2 text-center" style={{ color: templateColor ? displayColor : 'var(--color-secondary)' }}>Total Amount Paid</p>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tighter break-all text-center" style={{ color: templateColor ? displayColor : 'var(--color-on-secondary-container)' }}>
                {formatCurrency(total, currency.symbol)}
              </h3>
            </div>
          </div>

          {/* Ticket Perforation Divider */}
          <div className="relative h-8 flex items-center justify-center overflow-hidden">
            <div className="absolute left-[-16px] w-8 h-8 bg-background rounded-full border border-outline-variant/10"></div>
            <div className="w-full border-t-2 border-dashed border-outline-variant/20 mx-6"></div>
            <div className="absolute right-[-16px] w-8 h-8 bg-background rounded-full border border-outline-variant/10"></div>
          </div>

          {/* Items Section */}
          <div className="p-8 pt-4">
            <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-6">Details</p>
            <div className="space-y-4">
              {invoice.items.map(item => (
                <div key={item.id} className="flex justify-between items-center">
                  <span className="font-bold text-on-surface text-sm">{item.name}</span>
                  <span className="font-mono font-bold text-on-surface text-sm">
                    {formatCurrency(item.quantity * item.price, currency.symbol)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Decorative Barcode */}
          <div className="px-8 pb-6 flex justify-center opacity-20">
            <div className="h-8 w-full max-w-[200px] flex gap-1 justify-center items-center">
              {[...Array(30)].map((_, i) => (
                <div key={i} className="h-full bg-on-surface" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
              ))}
            </div>
          </div>

          {/* App Branding Footer */}
          {!removeWatermark && (
            <div className="px-8 pb-8 flex items-center justify-center gap-2 opacity-40">
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
        </div>

        {/* Watermark */}
        {!removeWatermark && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden z-50">
            <p className="text-4xl sm:text-5xl md:text-6xl font-black text-on-surface opacity-[0.03] -rotate-45 select-none whitespace-nowrap">
              VendorFlow
            </p>
          </div>
        )}
      </div>

      <div className="w-full max-w-md mt-4 space-y-4">
        <AnimatePresence>
          {isOnline && !removeWatermark && showRewardPrompt && (
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="bg-surface-low rounded-2xl p-4 flex items-center justify-between"
            >
              <span className="text-sm font-medium text-on-surface">Send a clean receipt to your customer</span>
              <button 
                onClick={() => {
                  track('reward_clicked', { type: 'receipt', id: invoice?.id });
                  setShowAd(true);
                }}
                className="text-sm font-bold text-primary flex items-center gap-1 active:opacity-70 transition-opacity"
              >
                Watch video
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
              </button>
            </motion.div>
          )}
          {removeWatermark && rewardedAdsWatchedThisSession >= 3 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1 }}
              className="text-center"
            >
              <p className="text-xs text-on-surface-variant italic">You can always send clean invoices faster</p>
            </motion.div>
          )}
        </AnimatePresence>
        <button 
          onClick={() => setShowShareMenu(true)}
          disabled={isSharing}
          className="w-full py-4 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-all disabled:opacity-70"
        >
          {isSharing ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Share2 size={18} strokeWidth={2.5} />}
          {isSharing ? 'Preparing...' : 'Share Receipt'}
        </button>
        <button 
          onClick={() => navigate('/')}
          className="w-full py-4 text-on-surface-variant font-semibold text-sm hover:bg-surface-low rounded-full transition-colors flex items-center justify-center gap-2"
        >
          <Home size={18} strokeWidth={2.5} />
          Return Home
        </button>
      </div>

      {showAd && (
        <MockAdVideo 
          type="rewarded"
          onClose={() => setShowAd(false)}
          onComplete={() => {
            markRewarded('receipt', invoice.id);
            setRemoveWatermark(true);
          }}
          successMessage="Your receipt is ready"
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

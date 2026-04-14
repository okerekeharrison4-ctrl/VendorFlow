import React, { useRef, useState, useEffect } from 'react';
import { useStore } from '../store/StoreContext';
import { useNavigate, useParams } from 'react-router-dom';
import { formatCurrency, calculateTotal, formatDate, isColorDark } from '../utils/helpers';
import { motion, AnimatePresence } from 'motion/react';
import { Share2, CheckCircle2, Loader2 } from 'lucide-react';
import { TemplateRenderer } from '../components/TemplateRenderer';
import { toCanvas } from 'html-to-image';
import { jsPDF } from 'jspdf';
import { useAdSystem } from '../hooks/useAdSystem';
import { TimedInterstitialAd } from '../components/TimedInterstitialAd';
import { track } from '../utils/analytics';

export const PreviewScreen = () => {
  const { getInvoice, currency, markAsPaid, theme, isPremium, logoUrl } = useStore();
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [removeWatermark, setRemoveWatermark] = useState(false);
  const [showAd, setShowAd] = useState(false);
  const [showRewardPrompt, setShowRewardPrompt] = useState(false);
  
  const { isOnline, markRewarded, hasRewarded, rewardedAdsWatchedThisSession } = useAdSystem();
  
  const invoice = getInvoice(id || '');

  useEffect(() => {
    if (invoice && (hasRewarded('invoice', invoice.id) || isPremium)) {
      setRemoveWatermark(true);
    }
  }, [invoice, hasRewarded, isPremium]);

  useEffect(() => {
    // Micro-delay before showing reward prompt
    const timer = setTimeout(() => {
      setShowRewardPrompt(true);
      if (isOnline && !removeWatermark) {
        track('reward_prompt_shown', { type: 'invoice', id: invoice?.id });
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [isOnline, removeWatermark, invoice?.id]);

  if (!invoice) {
    return <div className="p-6 text-center">Invoice not found</div>;
  }

  const subtotal = calculateTotal(invoice.items);
  const total = invoice.taxAmount ? subtotal + invoice.taxAmount : subtotal;

  const isDark = theme === 'dark';
  const templateColor = invoice.template?.color;
  const isCssVar = templateColor?.startsWith('var(');
  const displayColor = isCssVar ? templateColor : (isDark && isColorDark(templateColor || '') ? '#ffffff' : templateColor);

  const downloadFile = (file: File) => {
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleShareAction = async (action: 'share_image' | 'share_pdf' | 'download_image' | 'download_pdf' | 'share_text' | 'print' | 'whatsapp' | 'email') => {
    setIsSharing(true);
    setShowShareMenu(false);
    
    try {
      if (action === 'share_text') {
        const text = `Your invoice is ready, please make payment to the account details on the invoice`;
        if (navigator.share) {
          await navigator.share({ title: `Invoice ${invoice.invoiceNumber}`, text });
        } else {
          try {
            await navigator.clipboard.writeText(text);
            alert('✅ Message copied to clipboard!');
          } catch (err) {
            alert('Sharing is not supported on this device.');
          }
        }
        return;
      }

      if (!invoiceRef.current) return;

      // Small delay to ensure any animations or rendering are finished
      await new Promise(resolve => setTimeout(resolve, 150));

      // Use toCanvas as it's often more reliable across browsers
      const canvas = await toCanvas(invoiceRef.current, { 
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

      if (!canvas) throw new Error('Failed to generate canvas');

      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png', 1.0));
      if (!blob) throw new Error('Failed to generate blob');

      const isPdf = action === 'share_pdf' || action === 'download_pdf' || action === 'print' || action === 'email';
      const isWhatsApp = action === 'whatsapp';

      if (isWhatsApp) {
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
            // Try clipboard first
            if (navigator.clipboard && window.ClipboardItem) {
              await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
              alert('✅ Invoice image copied to clipboard!\n\nWhen WhatsApp opens, just paste (Ctrl+V) to attach the image.');
            } else {
              downloadFile(file);
              alert('✅ Invoice downloaded!\n\nPlease attach it in WhatsApp.');
            }
            const text = encodeURIComponent(`Your invoice is ready, please make payment to the account details on the invoice`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
          } catch (err) {
            downloadFile(file);
            const text = encodeURIComponent(`Your invoice is ready, please make payment to the account details on the invoice`);
            window.open(`https://wa.me/?text=${text}`, '_blank');
          }
        }
        return;
      }
      
      let file: File;
      
      if (!isPdf) {
        file = new File([blob], `Invoice-${invoice.invoiceNumber}.png`, { type: 'image/png' });
      } else {
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        
        pdf.addImage(canvas, 'PNG', 0, 0, canvas.width, canvas.height);
        const pdfBlob = pdf.output('blob');
        
        if (action === 'print') {
          const blobUrl = URL.createObjectURL(pdfBlob);
          const printWindow = window.open(blobUrl, '_blank');
          if (!printWindow) {
            // Fallback for blocked popups
            const iframe = document.createElement('iframe');
            iframe.style.display = 'none';
            iframe.src = blobUrl;
            document.body.appendChild(iframe);
            iframe.onload = () => {
              setTimeout(() => {
                iframe.contentWindow?.print();
              }, 200);
            };
          }
          return;
        }
        
        file = new File([pdfBlob], `Invoice-${invoice.invoiceNumber}.pdf`, { type: 'application/pdf' });
      }
      
      if (action === 'email') {
        const subject = `Invoice ${invoice.invoiceNumber} from ${invoice.brandName || 'VendorFlow'}`;
        const body = `Hi ${invoice.customerName},\n\nPlease find attached the invoice ${invoice.invoiceNumber} for ${formatCurrency(total, currency.symbol)}.\n\nThank you for your business!\n\nBest regards,\n${invoice.brandName || 'VendorFlow'}`;
        
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
        
        if (isMobile && navigator.canShare && navigator.canShare({ files: [file], title: subject, text: body })) {
          try {
            await navigator.share({ files: [file], title: subject, text: body });
          } catch (err: any) {
            if (err.name !== 'AbortError') {
              downloadFile(file);
              window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n(Please attach the downloaded invoice PDF)')}`;
            }
          }
        } else {
          downloadFile(file);
          alert('✅ Invoice PDF downloaded!\n\nPlease attach it to the email that will open next.');
          window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body + '\n\n(Please attach the downloaded invoice PDF)')}`;
        }
        return;
      }
      
      if (action.startsWith('share_')) {
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          try {
            await navigator.share({ files: [file] });
          } catch (err: any) {
            if (err.name !== 'AbortError') downloadFile(file);
          }
        } else {
          downloadFile(file);
          alert('Sharing not supported. File has been downloaded to your device.');
        }
      } else {
        downloadFile(file);
      }
    } catch (err) {
      console.error('Action failed', err);
      alert('Failed to process request. Please try again or use a different option.');
    } finally {
      setIsSharing(false);
    }
  };

  const [isPaid, setIsPaid] = useState(false);
  
  const handleMarkPaid = () => {
    setIsPaid(true);
    setTimeout(() => {
      markAsPaid(invoice.id);
      navigate(`/receipt/${invoice.id}`);
    }, 800);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0 }}
      className="px-6 md:px-12 pt-4 md:pt-8 pb-48 md:pb-12"
    >
      <div className="w-full overflow-x-auto hide-scrollbar pb-4 -mx-2 px-2 sm:mx-0 sm:px-0">
        <motion.div 
          ref={invoiceRef}
          layoutId={`invoice-${id}`}
          className="relative bg-white rounded-3xl shadow-ambient overflow-hidden min-w-[380px] sm:min-w-full mx-auto"
          style={{ '--theme-hue': invoice.template?.hue || 135 } as React.CSSProperties}
        >
          <TemplateRenderer 
            invoice={invoice} 
            templateConfig={invoice.template || { color: '#000000', style: 'modern' }} 
            total={total}
            currencySymbol={currency.symbol}
            isPremium={isPremium}
            logoUrl={logoUrl}
            isPaid={isPaid}
            removeWatermark={removeWatermark}
          />
        </motion.div>
      </div>

      <div className="fixed bottom-0 left-0 w-full bg-surface-container-lowest  p-6 pb-safe shadow-ambient z-40">
        <div className="max-w-3xl mx-auto space-y-4">
          <AnimatePresence>
            {isOnline && !removeWatermark && showRewardPrompt && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 10 }}
                className="bg-surface-container-low rounded-3xl p-4 flex items-center justify-between"
              >
                <span className="text-sm font-medium text-on-surface">Remove watermark for 24 hours</span>
                <button 
                  onClick={() => {
                    track('reward_clicked', { type: 'invoice', id: invoice?.id });
                    setShowAd(true);
                  }}
                  className="text-sm font-bold text-primary flex items-center gap-1 active:opacity-70 transition-opacity"
                >
                  Watch short video
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
          <div className="flex gap-4">
            <button 
              onClick={handleMarkPaid}
              className="flex-1 py-4 bg-gradient-to-r from-secondary-container to-secondary-container-heavy text-on-secondary-container rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-ambient"
            >
              <CheckCircle2 size={18} strokeWidth={2.5} />
              Mark as Paid
            </button>
            <button 
              onClick={() => setShowShareMenu(true)}
              disabled={isSharing}
              className="flex-1 py-4 bg-gradient-to-r from-primary to-primary-heavy text-on-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-ambient disabled:opacity-70 hover:opacity-90"
            >
              {isSharing ? <Loader2 size={18} className="animate-spin" strokeWidth={2.5} /> : <Share2 size={18} strokeWidth={2.5} />}
              {isSharing ? 'Preparing...' : 'Share Invoice'}
            </button>
          </div>
        </div>
      </div>

      {showAd && (
        <TimedInterstitialAd 
          type="rewarded"
          onClose={() => setShowAd(false)}
          onComplete={() => {
            markRewarded('invoice', invoice.id);
            setRemoveWatermark(true);
          }}
          successMessage="Your invoice is ready to send"
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
              className="bg-surface-container-lowest w-full max-w-sm rounded-3xl p-6 space-y-3 shadow-ambient mb-4 sm:mb-0"
              onClick={e => e.stopPropagation()}
            >
              <h3 className="text-lg font-extrabold text-on-surface mb-4">Share or Save</h3>
              
              <div className="space-y-4">
                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Direct Share</p>
                  <div className="space-y-2">
                    <button 
                      onClick={() => handleShareAction('whatsapp')}
                      className="w-full py-3.5 bg-[#25D366] text-white rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                      </svg>
                      Send via WhatsApp
                    </button>
                    <button 
                      onClick={() => handleShareAction('email')}
                      className="w-full py-3.5 bg-primary text-on-primary rounded-full font-bold text-sm flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      Send via Email
                    </button>
                  </div>
                  <p className="text-xs text-on-surface-variant text-center mt-2 px-2">
                    For WhatsApp, image is copied to clipboard. Just paste it in the chat!
                  </p>
                </div>

                <div>
                  <p className="text-[10px] font-bold tracking-widest text-outline-variant uppercase mb-2">Share via Device</p>
                  <div className="flex gap-2">
                    <button 
                      onClick={() => handleShareAction('share_image')}
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Image
                    </button>
                    <button 
                      onClick={() => handleShareAction('share_pdf')}
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
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
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Image
                    </button>
                    <button 
                      onClick={() => handleShareAction('download_pdf')}
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
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
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
                    >
                      Print
                    </button>
                    <button 
                      onClick={() => handleShareAction('share_text')}
                      className="flex-1 py-3.5 bg-surface-container-low text-on-surface rounded-full font-bold text-sm transition-all active:scale-[0.98]"
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

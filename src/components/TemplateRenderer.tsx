import React from 'react';
import { Invoice, TemplateConfig } from '../types';
import { formatCurrency } from '../utils/helpers';

const getDynamicTextSize = (text: string, baseSize: string) => {
  const length = text ? text.toString().length : 0;
  
  if (baseSize === 'text-6xl') {
    if (length > 20) return 'text-3xl';
    if (length > 12) return 'text-4xl';
    if (length > 8) return 'text-5xl';
    return 'text-6xl';
  }
  if (baseSize === 'text-5xl') {
    if (length > 20) return 'text-2xl';
    if (length > 12) return 'text-3xl';
    if (length > 8) return 'text-4xl';
    return 'text-5xl';
  }
  if (baseSize === 'text-4xl') {
    if (length > 20) return 'text-xl';
    if (length > 12) return 'text-2xl';
    if (length > 8) return 'text-3xl';
    return 'text-4xl';
  }
  if (baseSize === 'text-3xl') {
    if (length > 20) return 'text-lg';
    if (length > 15) return 'text-xl';
    if (length > 10) return 'text-2xl';
    return 'text-3xl';
  }
  if (baseSize === 'text-2xl') {
    if (length > 20) return 'text-base';
    if (length > 15) return 'text-lg';
    if (length > 10) return 'text-xl';
    return 'text-2xl';
  }
  if (baseSize === 'text-xl') {
    if (length > 20) return 'text-sm';
    if (length > 15) return 'text-base';
    if (length > 10) return 'text-lg';
    return 'text-xl';
  }
  return baseSize;
};

interface TemplateRendererProps {
  invoice: Invoice;
  templateConfig: TemplateConfig;
  total: number;
  currencySymbol: string;
  isPremium?: boolean;
  logoUrl?: string;
  isPaid?: boolean;
  removeWatermark?: boolean;
}

export const TemplateRenderer: React.FC<TemplateRendererProps> = ({ 
  invoice, 
  templateConfig, 
  total, 
  currencySymbol,
  isPremium,
  logoUrl,
  isPaid,
  removeWatermark
}) => {
  const style = templateConfig.style || 'modern';
  const props = { invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark };

  switch (style) {
    case 'bold':
      return <BoldTemplate {...props} />;
    case 'elegant':
      return <ElegantTemplate {...props} />;
    case 'corporate':
      return <CorporateTemplate {...props} />;
    case 'classic':
      return <ClassicTemplate {...props} />;
    case 'minimal':
      return <MinimalTemplate {...props} />;
    default:
      return <ModernTemplate {...props} />;
  }
};

const ClassicTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => (
  <div className="p-8 bg-white text-gray-900 font-serif border-4 border-double border-gray-300">
    {isPremium && logoUrl && (
      <div className="mb-6 flex justify-center">
        <img src={logoUrl} alt="Logo" className="w-24 h-24 object-contain" referrerPolicy="no-referrer" />
      </div>
    )}
    <div className="text-center mb-8 border-b-2 border-gray-800 pb-4">
      <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-3xl')} font-bold uppercase tracking-widest`}>{invoice.brandName}</h1>
      {invoice.vendorTaxId && <p className="text-sm text-gray-600 mt-1">TIN/VAT: {invoice.vendorTaxId}</p>}
      <p className="text-sm text-gray-600 mt-2">INVOICE NO. {invoice.invoiceNumber}</p>
    </div>
    <div className="mb-8">
      <p className="font-bold uppercase text-sm mb-2">Bill To:</p>
      <p className="text-lg">{invoice.customerName}</p>
      {invoice.clientTaxId && <p className="text-sm text-gray-600 mt-1">TIN/VAT: {invoice.clientTaxId}</p>}
    </div>
    <table className="w-full mb-8 table-fixed">
      <thead className="border-b border-gray-400">
        <tr className="text-left">
          <th className="py-2 font-bold uppercase text-sm w-3/5">Item</th>
          <th className="py-2 font-bold uppercase text-sm text-center w-1/5">Qty</th>
          <th className="py-2 font-bold uppercase text-sm text-right w-1/5">Amount</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item: any) => (
          <tr key={item.id} className="border-b border-gray-200">
            <td className="py-3 break-words pr-2">{item.name}</td>
            <td className="py-3 text-center tabular-nums">{item.quantity}</td>
            <td className="py-3 text-right tabular-nums break-all">{formatCurrency(item.price * item.quantity, currencySymbol)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="flex justify-end border-t-2 border-gray-800 pt-4">
      <div className="text-right max-w-[70%]">
        {invoice.taxAmount ? (
          invoice.taxInclusive ? (
            <div className="flex justify-between gap-4 mb-2 text-gray-500">
              <p className="uppercase text-xs">Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</p>
              <p className="text-xs tabular-nums break-all">{formatCurrency(invoice.taxAmount, currencySymbol)}</p>
            </div>
          ) : (
            <>
              <div className="flex justify-between gap-4 mb-1">
                <p className="font-bold uppercase text-sm">Subtotal:</p>
                <p className="text-sm tabular-nums break-all">{formatCurrency(invoice.subtotal || total, currencySymbol)}</p>
              </div>
              <div className="flex justify-between gap-4 mb-2">
                <p className="font-bold uppercase text-sm">{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</p>
                <p className="text-sm tabular-nums break-all">{formatCurrency(invoice.taxAmount, currencySymbol)}</p>
              </div>
            </>
          )
        ) : null}
        <div className="flex justify-between gap-4">
          <p className="font-bold uppercase text-sm inline-block">Total Due:</p>
          <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-2xl')} font-bold inline-block tabular-nums break-all`}>{formatCurrency(total, currencySymbol)}</p>
        </div>
      </div>
    </div>
    {invoice.bankDetails && !isPaid && (
      <div className="mt-8 border-t border-gray-300 pt-4">
        <p className="font-bold uppercase text-sm mb-2">Payment Details:</p>
        <p className="text-sm">Bank: {invoice.bankDetails.bankName}</p>
        <p className="text-sm">Account Name: {invoice.bankDetails.accountName}</p>
        <p className="text-sm">Account No: {invoice.bankDetails.accountNumber}</p>
      </div>
    )}
    {!removeWatermark && (
      <div className="text-center text-gray-400 text-xs mt-12 italic">
        Generated by VendorFlow
      </div>
    )}
  </div>
);

const MinimalTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => (
  <div className="p-10 bg-white text-gray-800 font-sans">
    <div className="flex justify-between items-end mb-12 gap-4">
      <div className="min-w-0 flex-1">
        {isPremium && logoUrl && (
          <div className="mb-4">
            <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
          </div>
        )}
        <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-2xl')} font-medium tracking-tight break-words`}>{invoice.brandName}</h1>
        {invoice.vendorTaxId && <p className="text-sm text-gray-400 mt-1">TIN/VAT: {invoice.vendorTaxId}</p>}
      </div>
      <div className="text-right shrink-0 max-w-[50%]">
        <p className="text-gray-400 text-sm">Invoice</p>
        <p className="font-medium break-words">{invoice.invoiceNumber}</p>
      </div>
    </div>
    <div className="mb-12">
      <p className="text-gray-400 text-sm mb-1">To</p>
      <p className="text-lg">{invoice.customerName}</p>
      {invoice.clientTaxId && <p className="text-sm text-gray-400 mt-1">TIN/VAT: {invoice.clientTaxId}</p>}
    </div>
    <div className="space-y-4 mb-12">
      {invoice.items.map((item: any) => (
        <div key={item.id} className="flex justify-between items-center gap-4">
          <div className="min-w-0 flex-1">
            <p className="break-words">{item.name}</p>
            {item.quantity > 1 && <p className="text-sm text-gray-400 tabular-nums">Qty: {item.quantity}</p>}
          </div>
          <p className="tabular-nums shrink-0 break-all max-w-[40%] text-right">{formatCurrency(item.price * item.quantity, currencySymbol)}</p>
        </div>
      ))}
    </div>
    <div className="border-t border-gray-100 pt-6 space-y-2">
      {invoice.taxAmount ? (
        invoice.taxInclusive ? (
          <div className="flex justify-between items-center gap-4">
            <p className="text-gray-400 text-sm">Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</p>
            <p className="text-sm tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</p>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center gap-4">
              <p className="text-gray-400">Subtotal</p>
              <p className="font-medium tabular-nums break-all text-right">{formatCurrency(invoice.subtotal || total, currencySymbol)}</p>
            </div>
            <div className="flex justify-between items-center gap-4">
              <p className="text-gray-400">{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</p>
              <p className="font-medium tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</p>
            </div>
          </>
        )
      ) : null}
      <div className="flex justify-between items-center gap-4 pt-2">
        <p className="text-gray-400">Total</p>
        <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-2xl')} font-medium tabular-nums break-all text-right`}>{formatCurrency(total, currencySymbol)}</p>
      </div>
    </div>
    {invoice.bankDetails && !isPaid && (
      <div className="mt-12">
        <p className="text-gray-400 text-sm mb-2">Payment Details</p>
        <div className="text-sm space-y-1">
          <p><span className="text-gray-400 mr-2">Bank</span> {invoice.bankDetails.bankName}</p>
          <p><span className="text-gray-400 mr-2">Account</span> {invoice.bankDetails.accountName}</p>
          <p><span className="text-gray-400 mr-2">Acct number</span> {invoice.bankDetails.accountNumber}</p>
        </div>
      </div>
    )}
    {!removeWatermark && (
      <div className="text-center text-gray-300 text-xs mt-16">
        Generated by VendorFlow
      </div>
    )}
  </div>
);

const ModernTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => {
  const templateColor = invoice.template?.color || '#000000';
  
  return (
    <div className="bg-white text-black font-sans relative overflow-hidden">
      {/* Colored Header Strip */}
      <div className="h-3 w-full" style={{ backgroundColor: templateColor }}></div>
      
      <div className="p-8 pb-6">
        <div className="flex justify-between items-start mb-8 gap-4">
          <div className="min-w-0 flex-1">
            {isPremium && logoUrl && (
              <div className="mb-4">
                <img src={logoUrl} alt="Logo" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
              </div>
            )}
            <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-3xl')} font-black tracking-tight mb-1 break-words uppercase`}>{invoice.brandName}</h1>
            {invoice.vendorTaxId && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">TIN/VAT: {invoice.vendorTaxId}</p>}
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
              {isPaid ? 'Official Receipt' : 'Official Invoice'}
            </p>
          </div>
          <div className="text-right shrink-0 max-w-[40%]">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Ticket No.</p>
            <p className="text-sm font-mono font-bold break-words bg-gray-100 px-2 py-1 rounded inline-block">{invoice.invoiceNumber}</p>
          </div>
        </div>

        <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Billed To</p>
          <p className="text-base font-bold">{invoice.customerName}</p>
          {invoice.clientTaxId && <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">TIN/VAT: {invoice.clientTaxId}</p>}
        </div>

        <div className="mb-2">
          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4 border-b border-gray-200 pb-2">
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className="space-y-4">
            {invoice.items.map((item: any) => (
              <div key={item.id} className="flex justify-between items-start gap-4">
                <div className="min-w-0 flex-1">
                  <p className="font-bold text-sm break-words">{item.name}</p>
                  <p className="text-xs text-gray-500 font-mono mt-0.5">{item.quantity} x {formatCurrency(item.price, currencySymbol)}</p>
                </div>
                <span className="font-mono font-bold text-sm shrink-0 break-all text-right">{formatCurrency(item.price * item.quantity, currencySymbol)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Ticket Perforation */}
      <div className="relative h-6 flex items-center justify-center overflow-hidden opacity-60">
        <div className="absolute left-[-12px] w-6 h-6 bg-gray-200 rounded-full shadow-inner"></div>
        <div className="w-full border-t-2 border-dashed border-gray-300 mx-4"></div>
        <div className="absolute right-[-12px] w-6 h-6 bg-gray-200 rounded-full shadow-inner"></div>
      </div>

      <div className="p-8 pt-6">
        <div className="mb-8 space-y-2">
          {invoice.taxAmount ? (
            invoice.taxInclusive ? (
              <div className="flex justify-between items-end">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</p>
                <p className="text-sm font-mono tabular-nums break-all text-right">
                  {formatCurrency(invoice.taxAmount, currencySymbol)}
                </p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Subtotal</p>
                  <p className="text-lg font-mono tabular-nums break-all text-right">
                    {formatCurrency(invoice.subtotal || total, currencySymbol)}
                  </p>
                </div>
                <div className="flex justify-between items-end">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</p>
                  <p className="text-lg font-mono tabular-nums break-all text-right">
                    {formatCurrency(invoice.taxAmount, currencySymbol)}
                  </p>
                </div>
              </>
            )
          ) : null}
          <div className="flex justify-between items-end pt-2">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{isPaid ? 'Total Paid' : 'Total Due'}</p>
            <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-3xl')} font-black font-mono tabular-nums break-all text-right`} style={{ color: templateColor }}>
              {formatCurrency(total, currencySymbol)}
            </p>
          </div>
        </div>

        {invoice.bankDetails && !isPaid && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-8 border border-gray-100">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Payment Details</p>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between"><span className="text-gray-500">Bank:</span> <span className="font-bold text-right">{invoice.bankDetails.bankName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Account:</span> <span className="font-bold text-right">{invoice.bankDetails.accountName}</span></div>
              <div className="flex justify-between"><span className="text-gray-500">Acct number:</span> <span className="font-mono font-bold text-right">{invoice.bankDetails.accountNumber}</span></div>
            </div>
          </div>
        )}

        {/* Decorative Barcode */}
        <div className="flex justify-center opacity-30 mb-8">
          <div className="h-10 w-full max-w-[250px] flex gap-[2px] justify-center items-center">
            {[...Array(40)].map((_, i) => (
              <div key={i} className="h-full bg-black" style={{ width: `${Math.random() * 4 + 1}px` }}></div>
            ))}
          </div>
        </div>

        {!removeWatermark && (
          <div className="text-center text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            Generated by VendorFlow
          </div>
        )}
      </div>

      {isPaid && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-10 -rotate-12">
          <p className="text-8xl font-black tracking-tighter" style={{ color: templateColor }}>PAID</p>
        </div>
      )}
    </div>
  );
};

const BoldTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => (
  <div className="p-8 bg-black text-white">
    {isPremium && logoUrl && (
      <div className="mb-4">
        <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
    )}
    <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-6xl')} font-black mb-2 uppercase break-words`}>{invoice.brandName}</h1>
    {invoice.vendorTaxId && <p className="text-lg mb-4 font-mono text-gray-400 break-words">TIN/VAT: {invoice.vendorTaxId}</p>}
    <p className="text-2xl mb-8 font-mono break-words">{invoice.invoiceNumber}</p>
    <div className="border-t border-b border-white py-4 mb-8">
      <p className="text-lg break-words">Billed to: {invoice.customerName}</p>
      {invoice.clientTaxId && <p className="text-sm font-mono text-gray-400 mt-1 break-words">TIN/VAT: {invoice.clientTaxId}</p>}
    </div>
    <div className="mb-8 border-b border-white pb-4">
      {invoice.items.map((item: any) => (
        <div key={item.id} className="flex justify-between py-2 font-mono text-lg gap-4">
          <span className="break-words min-w-0 flex-1">{item.name} x {item.quantity}</span>
          <span className="tabular-nums shrink-0 break-all max-w-[40%] text-right">{formatCurrency(item.price * item.quantity, currencySymbol)}</span>
        </div>
      ))}
    </div>
    {invoice.taxAmount ? (
      invoice.taxInclusive ? (
        <div className="mb-4 flex justify-between gap-4 font-mono text-sm text-gray-400">
          <span>Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</span>
          <span className="tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
        </div>
      ) : (
        <div className="mb-4 space-y-2 font-mono text-lg">
          <div className="flex justify-between gap-4">
            <span>Subtotal:</span>
            <span className="tabular-nums break-all text-right">{formatCurrency(invoice.subtotal || total, currencySymbol)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</span>
            <span className="tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
          </div>
        </div>
      )
    ) : null}
    <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-4xl')} font-black uppercase break-all tabular-nums`}>Total: {formatCurrency(total, currencySymbol)}</p>
    {invoice.bankDetails && !isPaid && (
      <div className="mt-8 border-t border-white pt-4">
        <p className="text-xl font-bold uppercase mb-2">Payment Details</p>
        <p className="text-lg font-mono">Bank: {invoice.bankDetails.bankName}</p>
        <p className="text-lg font-mono">Name: {invoice.bankDetails.accountName}</p>
        <p className="text-lg font-mono">Acct number: {invoice.bankDetails.accountNumber}</p>
      </div>
    )}
    {!removeWatermark && (
      <div className="text-center text-gray-500 text-sm mt-8">
        Generated by VendorFlow
      </div>
    )}
  </div>
);

const ElegantTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => (
  <div className="p-12 bg-stone-50 text-stone-800 font-serif">
    {isPremium && logoUrl && (
      <div className="mb-4">
        <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
    )}
    <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-5xl')} font-light mb-2 break-words`}>{invoice.brandName}</h1>
    {invoice.vendorTaxId && <p className="text-sm mb-2 text-stone-500 break-words">TIN/VAT: {invoice.vendorTaxId}</p>}
    <p className="text-lg mb-12 italic break-words">Invoice No. {invoice.invoiceNumber}</p>
    <div className="mb-12">
      <p className="text-sm uppercase tracking-widest mb-2">Billed to</p>
      <p className="text-xl break-words">{invoice.customerName}</p>
      {invoice.clientTaxId && <p className="text-sm text-stone-500 mt-1 break-words">TIN/VAT: {invoice.clientTaxId}</p>}
    </div>
    <div className="mb-8 border-b border-stone-300 pb-4">
      {invoice.items.map((item: any) => (
        <div key={item.id} className="flex justify-between py-2 gap-4">
          <span className="break-words min-w-0 flex-1">{item.name}</span>
          <span className="tabular-nums shrink-0 break-all max-w-[40%] text-right">{formatCurrency(item.price * item.quantity, currencySymbol)}</span>
        </div>
      ))}
    </div>
    {invoice.taxAmount ? (
      invoice.taxInclusive ? (
        <div className="mb-4 flex justify-between gap-4 text-sm text-stone-500">
          <span>Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</span>
          <span className="tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
        </div>
      ) : (
        <div className="mb-4 space-y-2 text-lg">
          <div className="flex justify-between gap-4">
            <span>Subtotal</span>
            <span className="tabular-nums break-all text-right">{formatCurrency(invoice.subtotal || total, currencySymbol)}</span>
          </div>
          <div className="flex justify-between gap-4">
            <span>{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%)</span>
            <span className="tabular-nums break-all text-right">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
          </div>
        </div>
      )
    ) : null}
    <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-3xl')} tabular-nums break-all`}>Total: {formatCurrency(total, currencySymbol)}</p>
    {invoice.bankDetails && !isPaid && (
      <div className="mt-12 border-t border-stone-300 pt-6">
        <p className="text-sm uppercase tracking-widest mb-4">Payment Details</p>
        <p className="text-lg">Bank: {invoice.bankDetails.bankName}</p>
        <p className="text-lg">Account Name: {invoice.bankDetails.accountName}</p>
        <p className="text-lg">Account No: {invoice.bankDetails.accountNumber}</p>
      </div>
    )}
    {!removeWatermark && (
      <div className="text-center text-stone-400 text-sm mt-8">
        Generated by VendorFlow
      </div>
    )}
  </div>
);

const CorporateTemplate = ({ invoice, total, currencySymbol, isPremium, logoUrl, isPaid, removeWatermark }: any) => (
  <div className="p-8 bg-white text-slate-900 border-t-8 border-slate-900">
    {isPremium && logoUrl && (
      <div className="mb-4">
        <img src={logoUrl} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
    )}
    <div className="flex justify-between mb-12 gap-4">
      <div className="min-w-0 flex-1">
        <h1 className={`${getDynamicTextSize(invoice.brandName, 'text-3xl')} font-bold break-words`}>{invoice.brandName}</h1>
        {invoice.vendorTaxId && <p className="text-sm text-slate-500 mt-1">TIN/VAT: {invoice.vendorTaxId}</p>}
      </div>
      <div className="text-right shrink-0 max-w-[50%]">
        <p className="font-bold">INVOICE</p>
        <p className="break-words">{invoice.invoiceNumber}</p>
      </div>
    </div>
    <div className="mb-8">
      <p className="font-bold mb-1">Billed To:</p>
      <p className="text-lg">{invoice.customerName}</p>
      {invoice.clientTaxId && <p className="text-sm text-slate-500 mt-1">TIN/VAT: {invoice.clientTaxId}</p>}
    </div>
    <table className="w-full mb-8 table-fixed">
      <thead className="border-b-2 border-slate-900">
        <tr className="text-left">
          <th className="py-2 w-3/5">Description</th>
          <th className="py-2 w-1/5 text-center">Qty</th>
          <th className="py-2 w-1/5 text-right">Price</th>
        </tr>
      </thead>
      <tbody>
        {invoice.items.map((item: any) => (
          <tr key={item.id} className="border-b">
            <td className="py-2 break-words pr-2">{item.name}</td>
            <td className="py-2 tabular-nums text-center">{item.quantity}</td>
            <td className="py-2 tabular-nums break-all text-right">{formatCurrency(item.price, currencySymbol)}</td>
          </tr>
        ))}
      </tbody>
    </table>
    <div className="text-right space-y-2">
      {invoice.taxAmount ? (
        invoice.taxInclusive ? (
          <div className="flex justify-end gap-4 text-sm text-slate-500">
            <span>Includes {invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</span>
            <span className="tabular-nums break-all">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
          </div>
        ) : (
          <>
            <div className="flex justify-end gap-4">
              <span className="font-bold">Subtotal:</span>
              <span className="tabular-nums break-all">{formatCurrency(invoice.subtotal || total, currencySymbol)}</span>
            </div>
            <div className="flex justify-end gap-4">
              <span className="font-bold">{invoice.taxLabel || 'Tax'} ({invoice.taxRate}%):</span>
              <span className="tabular-nums break-all">{formatCurrency(invoice.taxAmount, currencySymbol)}</span>
            </div>
          </>
        )
      ) : null}
      <p className={`${getDynamicTextSize(formatCurrency(total, currencySymbol), 'text-xl')} font-bold tabular-nums break-all pt-2`}>Total Due: {formatCurrency(total, currencySymbol)}</p>
    </div>
    {invoice.bankDetails && !isPaid && (
      <div className="mt-8 border-t-2 border-slate-900 pt-4">
        <p className="font-bold mb-2">Payment Details</p>
        <p className="text-sm"><span className="font-bold">Bank:</span> {invoice.bankDetails.bankName}</p>
        <p className="text-sm"><span className="font-bold">Account Name:</span> {invoice.bankDetails.accountName}</p>
        <p className="text-sm"><span className="font-bold">Account No:</span> {invoice.bankDetails.accountNumber}</p>
      </div>
    )}
    {!removeWatermark && (
      <div className="text-center text-slate-400 text-sm mt-8">
        Generated by VendorFlow
      </div>
    )}
  </div>
);

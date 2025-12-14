import React, { useState, useEffect } from 'react';
import { GlassCard } from './ui/GlassCard';
import { GlassInput } from './ui/GlassInput';
import { GlassButton } from './ui/GlassButton';
import { db } from '../services/mockDb';
import { Product, Customer, BillItem, Bill } from '../types';
import { Search, ShoppingCart, Trash, User, Printer, Share2, Plus, X, Save, PackagePlus } from 'lucide-react';

export const BillingPOS: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [search, setSearch] = useState('');
  const [cart, setCart] = useState<BillItem[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [paymentType, setPaymentType] = useState<'CASH' | 'LOAN'>('CASH');
  const [discount, setDiscount] = useState(0);
  const [successBill, setSuccessBill] = useState<Bill | null>(null);

  // Manual Item State
  const [isCustomItemMode, setIsCustomItemMode] = useState(false);
  const [customItem, setCustomItem] = useState({ name: '', sellingPrice: '', costPrice: '', quantity: 1 });

  // New Customer State
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [newCustomerData, setNewCustomerData] = useState({ name: '', phone: '' });

  useEffect(() => {
    const init = async () => {
      setProducts(await db.products.getAll());
      setCustomers(await db.customers.getAll());
    };
    init();
  }, []);

  const addToCart = (product: Product) => {
    const existing = cart.find(item => item.productId === product.id);
    if (existing) {
      setCart(cart.map(item => item.productId === product.id ? { ...item, quantity: item.quantity + 1, profit: (item.sellingPrice - item.costPrice) * (item.quantity + 1) } : item));
    } else {
      const item: BillItem = {
        productId: product.id,
        name: product.name,
        quantity: 1,
        costPrice: product.totalCost,
        sellingPrice: product.sellingPrice,
        profit: product.sellingPrice - product.totalCost,
        warranty: false
      };
      setCart([...cart, item]);
    }
  };

  const addCustomItemToCart = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customItem.name || !customItem.sellingPrice) return;

    const sellingPrice = Number(customItem.sellingPrice);
    const costPrice = Number(customItem.costPrice) || 0; // Optional, defaults to 0
    const quantity = Number(customItem.quantity) || 1;

    const item: BillItem = {
      productId: `manual-${Date.now()}`,
      name: customItem.name,
      quantity: quantity,
      costPrice: costPrice,
      sellingPrice: sellingPrice,
      profit: (sellingPrice - costPrice) * quantity,
      warranty: false
    };

    setCart([...cart, item]);
    setCustomItem({ name: '', sellingPrice: '', costPrice: '', quantity: 1 });
    setIsCustomItemMode(false);
  };

  const handleCreateCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerData.name) return;

    const newCus: Customer = {
      id: crypto.randomUUID(),
      name: newCustomerData.name,
      phone: newCustomerData.phone,
      totalLoan: 0,
      totalPaid: 0,
      balanceDue: 0
    };

    await db.customers.add(newCus);
    const updatedCustomers = await db.customers.getAll();
    setCustomers(updatedCustomers);
    setSelectedCustomer(newCus.id);
    setIsNewCustomerMode(false);
    setNewCustomerData({ name: '', phone: '' });
  };

  const removeFromCart = (index: number) => {
    setCart(cart.filter((_, i) => i !== index));
  };

  const updateQuantity = (index: number, qty: number) => {
    if (qty < 1) return;
    const newCart = [...cart];
    const item = newCart[index];
    item.quantity = qty;
    item.profit = (item.sellingPrice - item.costPrice) * qty;
    setCart(newCart);
  };

  const toggleWarranty = (index: number) => {
    const newCart = [...cart];
    newCart[index].warranty = !newCart[index].warranty;
    setCart(newCart);
  };

  const calculateTotals = () => {
    const totalAmount = cart.reduce((sum, item) => sum + (item.sellingPrice * item.quantity), 0);
    const totalCost = cart.reduce((sum, item) => sum + (item.costPrice * item.quantity), 0);
    const totalProfit = cart.reduce((sum, item) => sum + item.profit, 0);
    const finalAmount = totalAmount - discount;
    return { totalAmount, totalCost, totalProfit, finalAmount };
  };

  const { totalAmount, totalCost, totalProfit, finalAmount } = calculateTotals();

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    if (paymentType === 'LOAN' && !selectedCustomer) {
      alert("Customer required for LOAN sales");
      return;
    }

    const customer = customers.find(c => c.id === selectedCustomer);

    const bill: Bill = {
      id: crypto.randomUUID(),
      number: `INV-${Date.now().toString().slice(-4)}`,
      date: new Date().toISOString(),
      customerId: selectedCustomer || null,
      customerName: customer ? customer.name : 'Walk-in Customer',
      items: cart,
      totalAmount,
      totalCost,
      totalProfit, // PROFIT SAVED HERE PERMANENTLY
      discount,
      finalAmount,
      paymentType
    };

    await db.bills.create(bill);
    setSuccessBill(bill);
    setCart([]);
    setDiscount(0);
    setSearch('');
  };

  const shareOnWhatsApp = () => {
    if (!successBill) return;
    const text = `*WR Smile & Supplies*%0A` +
      `Bill No: ${successBill.number}%0A` +
      `Date: ${new Date(successBill.date).toLocaleDateString()}%0A` +
      `------------------------%0A` +
      successBill.items.map(i => `${i.name} x${i.quantity} = ${i.sellingPrice * i.quantity}`).join('%0A') +
      `%0A------------------------%0A` +
      `*Total: LKR ${successBill.finalAmount}*`;
    
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const filteredProducts = products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()));

  if (successBill) {
    return (
      <GlassCard className="max-w-md mx-auto text-center py-12">
        <div className="w-16 h-16 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <ShoppingCart size={32} />
        </div>
        <h2 className="text-2xl font-bold mb-2">Sale Complete!</h2>
        <p className="text-gray-400 mb-8">Bill #{successBill.number} has been saved.</p>
        <div className="flex gap-4 justify-center">
          <GlassButton onClick={() => window.print()} className="flex items-center gap-2">
            <Printer size={16} /> Print
          </GlassButton>
          <GlassButton onClick={shareOnWhatsApp} className="flex items-center gap-2 bg-[#25D366]/80 hover:bg-[#25D366]/60">
            <Share2 size={16} /> WhatsApp
          </GlassButton>
        </div>
        <button onClick={() => setSuccessBill(null)} className="mt-8 text-sm text-gray-400 hover:text-white underline">
          Start New Sale
        </button>
      </GlassCard>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-fade-in h-[calc(100vh-100px)]">
      {/* Product Selection */}
      <div className="lg:col-span-2 flex flex-col gap-4 h-full">
        <GlassCard className="flex-1 flex flex-col overflow-hidden">
          <div className="mb-4 sticky top-0 bg-transparent z-10 space-y-3">
             <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-3 text-gray-400" size={20} />
                  <input
                    className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:border-blue-500/50"
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
                <button 
                  onClick={() => setIsCustomItemMode(!isCustomItemMode)}
                  className={`px-4 rounded-xl border border-white/10 flex items-center gap-2 transition-all ${isCustomItemMode ? 'bg-blue-600 border-blue-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10'}`}
                >
                   {isCustomItemMode ? <X size={20} /> : <PackagePlus size={20} />}
                   <span className="hidden sm:inline">{isCustomItemMode ? 'Cancel' : 'Custom Item'}</span>
                </button>
             </div>

             {/* Custom Item Form Overlay */}
             {isCustomItemMode && (
                <form onSubmit={addCustomItemToCart} className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-xl animate-fade-in">
                  <h4 className="text-sm font-bold text-blue-300 mb-3 uppercase flex items-center gap-2">
                    <PackagePlus size={16}/> Manual Entry
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                     <GlassInput 
                        placeholder="Item Name" 
                        value={customItem.name}
                        onChange={e => setCustomItem({...customItem, name: e.target.value})}
                        className="md:col-span-1"
                        autoFocus
                        required
                     />
                     <GlassInput 
                        placeholder="Price (LKR)" 
                        type="number"
                        value={customItem.sellingPrice}
                        onChange={e => setCustomItem({...customItem, sellingPrice: e.target.value})}
                        required
                     />
                     <GlassInput 
                        placeholder="Cost (Optional)" 
                        type="number"
                        title="Enter Cost Price for accurate profit calculation"
                        value={customItem.costPrice}
                        onChange={e => setCustomItem({...customItem, costPrice: e.target.value})}
                     />
                     <div className="flex gap-2">
                        <GlassInput 
                            placeholder="Qty" 
                            type="number"
                            value={customItem.quantity}
                            onChange={e => setCustomItem({...customItem, quantity: Number(e.target.value)})}
                            className="w-20"
                        />
                        <GlassButton type="submit" className="flex-1">Add</GlassButton>
                     </div>
                  </div>
                </form>
             )}
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 overflow-y-auto p-1">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                onClick={() => addToCart(product)}
                disabled={product.stock <= 0}
                className="flex flex-col text-left p-4 rounded-xl border border-white/5 bg-white/5 hover:bg-white/10 hover:border-blue-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span className="font-semibold text-sm line-clamp-2 h-10">{product.name}</span>
                <span className="text-xs text-gray-400 mt-1">{product.category}</span>
                <div className="mt-auto pt-3 flex justify-between items-end">
                  <span className="text-green-400 font-bold font-mono">LKR {product.sellingPrice}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded ${product.stock > 10 ? 'bg-gray-700 text-gray-300' : 'bg-red-500/20 text-red-300'}`}>
                    Qty: {product.stock}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </GlassCard>
      </div>

      {/* Cart & Checkout */}
      <div className="lg:col-span-1 h-full flex flex-col">
        <GlassCard className="h-full flex flex-col p-0 overflow-hidden border-blue-500/20">
          <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
            <h3 className="font-bold flex items-center gap-2"><ShoppingCart size={18}/> Current Bill</h3>
            <span className="text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded-full">{cart.length} Items</span>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
                <ShoppingCart size={48} className="mb-2" />
                <p>Cart is empty</p>
              </div>
            ) : (
              cart.map((item, idx) => (
                <div key={idx} className="flex flex-col gap-2 p-3 rounded-lg bg-white/5 border border-white/5 hover:border-white/20 transition-colors">
                  <div className="flex justify-between">
                    <span className="font-medium text-sm">{item.name}</span>
                    <span className="font-mono text-sm">LKR {item.sellingPrice * item.quantity}</span>
                  </div>
                  <div className="flex justify-between items-center text-xs text-gray-400">
                    <div className="flex items-center gap-2">
                       <button onClick={() => updateQuantity(idx, item.quantity - 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">-</button>
                       <span className="w-4 text-center text-white font-bold">{item.quantity}</span>
                       <button onClick={() => updateQuantity(idx, item.quantity + 1)} className="w-6 h-6 rounded bg-white/10 hover:bg-white/20">+</button>
                    </div>
                    <label className="flex items-center gap-1 cursor-pointer">
                      <input type="checkbox" checked={item.warranty} onChange={() => toggleWarranty(idx)} className="rounded bg-white/10 border-white/20" />
                      Warranty
                    </label>
                    <button onClick={() => removeFromCart(idx)} className="text-red-400 hover:text-red-300"><Trash size={14}/></button>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="p-4 bg-black/20 backdrop-blur-md border-t border-white/10 space-y-4">
             {/* Customer Select */}
             <div>
                <div className="flex justify-between items-center mb-1">
                   <label className="text-xs text-gray-400 uppercase font-bold">Customer</label>
                   {!isNewCustomerMode && (
                     <button onClick={() => setIsNewCustomerMode(true)} className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1">
                       <Plus size={12}/> New
                     </button>
                   )}
                </div>

                {isNewCustomerMode ? (
                  <form onSubmit={handleCreateCustomer} className="space-y-2 bg-white/5 p-2 rounded-lg border border-white/10">
                    <GlassInput 
                      placeholder="Name" 
                      value={newCustomerData.name} 
                      onChange={e => setNewCustomerData({...newCustomerData, name: e.target.value})}
                      className="text-sm"
                      autoFocus
                    />
                    <GlassInput 
                      placeholder="Phone" 
                      value={newCustomerData.phone} 
                      onChange={e => setNewCustomerData({...newCustomerData, phone: e.target.value})}
                      className="text-sm"
                    />
                    <div className="flex gap-2">
                      <GlassButton type="submit" className="py-1 text-xs w-full">Save</GlassButton>
                      <button type="button" onClick={() => setIsNewCustomerMode(false)} className="px-3 py-1 bg-white/10 rounded text-xs hover:bg-white/20">Cancel</button>
                    </div>
                  </form>
                ) : (
                  <div className="relative">
                    <select 
                      value={selectedCustomer}
                      onChange={(e) => setSelectedCustomer(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-gray-300 appearance-none focus:outline-none focus:border-blue-500"
                    >
                      <option value="">Walk-in Customer</option>
                      {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                    <User className="absolute right-3 top-2.5 text-gray-500 pointer-events-none" size={14} />
                  </div>
                )}
             </div>

             {/* Payment Details */}
             <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Subtotal</span>
                  <span>LKR {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-400">Discount</span>
                  <input 
                    type="number" 
                    value={discount} 
                    onChange={(e) => setDiscount(Number(e.target.value))}
                    className="w-20 bg-white/5 border border-white/10 rounded text-right px-2 py-0.5 text-xs" 
                  />
                </div>
                <div className="flex justify-between pt-2 border-t border-white/10">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-lg text-blue-400">LKR {finalAmount.toLocaleString()}</span>
                </div>
             </div>

             <div className="flex gap-2">
                <button 
                  onClick={() => setPaymentType('CASH')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${paymentType === 'CASH' ? 'bg-green-500/20 border-green-500/50 text-green-300' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  CASH
                </button>
                <button 
                  onClick={() => setPaymentType('LOAN')}
                  className={`flex-1 py-2 rounded-lg text-sm font-medium border ${paymentType === 'LOAN' ? 'bg-red-500/20 border-red-500/50 text-red-300' : 'border-white/10 text-gray-400 hover:bg-white/5'}`}
                >
                  LOAN
                </button>
             </div>

             <GlassButton onClick={handleCheckout} className="w-full py-3 text-lg" disabled={cart.length === 0}>
               COMPLETE SALE
             </GlassButton>
          </div>
        </GlassCard>
      </div>
    </div>
  );
};
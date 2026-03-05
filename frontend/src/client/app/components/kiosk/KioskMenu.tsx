import { useEffect, useMemo, useState } from 'react';
import { Filter, Plus, Minus, Search, X, Flame, Clock, Tag, ArrowLeft, Sparkles } from 'lucide-react';
import type { MenuItem } from '@/client/app/data/menuData';
import { categories as sampleCategories, menuData } from '@/client/app/data/menuData';
import { fetchMenuCategories, fetchMenuItems } from '@/client/api/menu';
import { MenuItemImage } from '@/client/app/components/MenuItemImage';
import type { CartItem } from '@/client/app/App';

interface KioskMenuProps {
  onAddToCart: (item: Omit<CartItem, 'quantity'> & { quantity?: number }) => void;
  onGoToCart: () => void;
  cartCount: number;
  cart: CartItem[];
  onUpdateQuantity: (id: string, quantity: number) => void;
  onRemoveItem: (id: string) => void;
}

export default function KioskMenu({ onAddToCart, onGoToCart, cartCount, cart, onUpdateQuantity, onRemoveItem }: KioskMenuProps) {
  const [categories, setCategories] = useState<string[]>(['All']);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [filterVeg, setFilterVeg] = useState<'all' | 'veg' | 'non-veg' | 'special'>('all');
  const [filterCuisine, setFilterCuisine] = useState<'all' | 'North Indian' | 'South Indian' | 'Chinese' | 'Italian' | 'Continental'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItem, setSelectedItem] = useState<MenuItem | null>(null);
  const [customization, setCustomization] = useState({
    spiceLevel: 'medium',
    addons: [] as string[],
    specialInstructions: '',
    quantity: 1,
  });

  useEffect(() => {
    let cancelled = false;
    const cuisineLookup = new Map<string, MenuItem['cuisine']>(
      menuData.map((m) => [m.name.toLowerCase(), m.cuisine]),
    );
    Promise.all([fetchMenuCategories(), fetchMenuItems()])
      .then(([cats, items]) => {
        if (cancelled) return;
        setCategories(cats);
        const enriched = items.map((item) =>
          item.cuisine ? item : { ...item, cuisine: cuisineLookup.get(item.name.toLowerCase()) },
        );
        setMenuItems(enriched);
      })
      .catch(() => {
        if (cancelled) return;
        setCategories(sampleCategories);
        setMenuItems(menuData);
      });
    return () => { cancelled = true; };
  }, []);

  const filteredItems = useMemo(() => {
    return menuItems.filter((item) => {
      const categoryMatch = selectedCategory === 'All' || item.category === selectedCategory;
      const vegMatch =
        filterVeg === 'all' ||
        (filterVeg === 'veg' && item.isVeg) ||
        (filterVeg === 'non-veg' && !item.isVeg) ||
        (filterVeg === 'special' && item.todaysSpecial);
      const cuisineMatch =
        filterCuisine === 'all' || item.cuisine === filterCuisine;
      const searchMatch =
        searchQuery === '' ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description.toLowerCase().includes(searchQuery.toLowerCase());
      return categoryMatch && vegMatch && cuisineMatch && searchMatch && item.available;
    });
  }, [filterCuisine, filterVeg, menuItems, searchQuery, selectedCategory]);

  const addons = [
    { id: 'extra-cheese', name: 'Extra Cheese', price: 50 },
    { id: 'extra-paneer', name: 'Extra Paneer', price: 80 },
    { id: 'extra-chicken', name: 'Extra Chicken', price: 100 },
    { id: 'butter-on-top', name: 'Butter on Top', price: 30 },
  ];

  const handleAddToCart = () => {
    if (!selectedItem) return;
    const cartItem: Omit<CartItem, 'quantity'> & { quantity?: number } = {
      id: `${selectedItem.id}-${Date.now()}`,
      name: selectedItem.name,
      price: selectedItem.price,
      image: selectedItem.image,
      isVeg: selectedItem.isVeg,
      spiceLevel: customization.spiceLevel,
      addons: customization.addons,
      specialInstructions: customization.specialInstructions,
      quantity: customization.quantity,
    };
    onAddToCart(cartItem);
    setSelectedItem(null);
    setCustomization({ spiceLevel: 'medium', addons: [], specialInstructions: '', quantity: 1 });
  };

  const handleQuickAdd = (item: MenuItem) => {
    const cartItem: Omit<CartItem, 'quantity'> & { quantity?: number } = {
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      isVeg: item.isVeg,
      quantity: 1,
    };
    onAddToCart(cartItem);
  };

  const getCartQuantity = (itemId: string) => {
    const cartItem = cart.find(c => c.id === itemId);
    return cartItem ? cartItem.quantity : 0;
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2]">
      {/* Kiosk Header */}
      <div className="bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white py-4 px-4 sm:px-6 shadow-lg">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>
              Kiosk Order
            </h1>
            <p className="text-white/70 text-xs sm:text-sm">Browse menu & add items to your order</p>
          </div>
          <button
            onClick={onGoToCart}
            className="relative px-4 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-[#C8A47A] to-[#8B5A2B] text-white rounded-xl font-bold text-sm sm:text-base hover:shadow-lg transition-all active:scale-95"
          >
            View Cart
            {cartCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs w-6 h-6 rounded-full flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 pb-2">
        {/* Search Bar */}
        <div className="relative mb-4">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#8B5A2B]/50" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search for your favorite dish..."
            className="w-full pl-10 pr-10 py-3 bg-white border border-[#E8D5B5] rounded-xl text-[#3E2723] placeholder-[#8B5A2B]/40 focus:outline-none focus:ring-2 focus:ring-[#C8A47A] focus:border-transparent"
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} className="absolute right-3 top-1/2 -translate-y-1/2">
              <X className="w-5 h-5 text-gray-400" />
            </button>
          )}
        </div>

        {/* Filters Card */}
        <div className="mb-8 space-y-6 bg-white/40 backdrop-blur-md p-4 sm:p-8 rounded-3xl border border-white/60 shadow-xl">
          {/* Category Filter */}
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#8B5A2B]/10 rounded-lg">
                <Filter className="w-5 h-5 text-[#8B5A2B]" />
              </div>
              <span className="font-bold text-[#3E2723] text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Browse Categories</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-bold text-sm uppercase tracking-wider ${
                    selectedCategory === category
                      ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-lg shadow-[#8B5A2B]/30 scale-105'
                      : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-[#8B5A2B] hover:text-[#8B5A2B]'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Diet & Special Filter */}
          <div className="pt-6 border-t border-[#E8DED0]/50">
            <div className="flex flex-wrap gap-4">
              <button
                onClick={() => setFilterVeg('all')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl border-2 transition-all font-bold uppercase tracking-widest text-xs ${
                  filterVeg === 'all'
                    ? 'bg-[#3E2723] text-white border-[#3E2723] shadow-lg shadow-black/10'
                    : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-[#3E2723]'
                }`}
              >
                All
              </button>
              <button
                onClick={() => setFilterVeg('veg')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest text-xs ${
                  filterVeg === 'veg'
                    ? 'bg-green-700 text-white border-green-700 shadow-lg shadow-green-700/20'
                    : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-green-700 hover:text-green-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-green-400"></span> Veg
              </button>
              <button
                onClick={() => setFilterVeg('non-veg')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest text-xs ${
                  filterVeg === 'non-veg'
                    ? 'bg-red-700 text-white border-red-700 shadow-lg shadow-red-700/20'
                    : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-red-700 hover:text-red-700'
                }`}
              >
                <span className="w-2.5 h-2.5 rounded-full bg-red-400"></span> Non-Veg
              </button>
              <button
                onClick={() => setFilterVeg('special')}
                className={`flex-1 md:flex-none px-8 py-3 rounded-xl border-2 flex items-center justify-center gap-2 transition-all font-bold uppercase tracking-widest text-xs ${
                  filterVeg === 'special'
                    ? 'bg-[#C8A47A] text-[#2D1B10] border-[#C8A47A] shadow-lg shadow-[#C8A47A]/30'
                    : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-[#C8A47A] hover:text-[#8B5A2B]'
                }`}
              >
                <Sparkles className="w-3 h-3" /> Chef's Special
              </button>
            </div>
          </div>

          {/* Cuisine Filter */}
          <div className="pt-6 border-t border-[#E8DED0]/50">
            <div className="flex items-center gap-3 mb-5">
              <div className="p-2 bg-[#8B5A2B]/10 rounded-lg">
                <Filter className="w-5 h-5 text-[#8B5A2B]" />
              </div>
              <span className="font-bold text-[#3E2723] text-xl" style={{ fontFamily: "'Playfair Display', serif" }}>Cuisine</span>
            </div>
            <div className="flex flex-wrap gap-3">
              {(['all', 'North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental'] as const).map((cuisine) => (
                <button
                  key={cuisine}
                  onClick={() => setFilterCuisine(cuisine)}
                  className={`px-6 py-3 rounded-full border-2 transition-all duration-300 font-bold text-sm uppercase tracking-wider ${
                    filterCuisine === cuisine
                      ? 'bg-[#8B5A2B] text-white border-[#8B5A2B] shadow-lg shadow-[#8B5A2B]/30 scale-105'
                      : 'bg-white/80 text-[#6D4C41] border-[#E8DED0] hover:border-[#8B5A2B] hover:text-[#8B5A2B]'
                  }`}
                >
                  {cuisine === 'all' ? 'All Cuisines' : cuisine}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pb-32">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="bg-white rounded-xl border border-[#E8D5B5] overflow-hidden shadow-sm hover:shadow-md transition-all"
            >
              <div className="relative h-40 overflow-hidden cursor-pointer" onClick={() => setSelectedItem(item)}>
                <MenuItemImage
                  src={item.image}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />
                {item.todaysSpecial && (
                  <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Flame className="w-3 h-3" /> Today's Special
                  </div>
                )}
                {item.offer && (
                  <div className="absolute top-2 right-2 bg-green-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Tag className="w-3 h-3" /> {item.offer}
                  </div>
                )}
                <div className={`absolute bottom-2 left-2 w-4 h-4 rounded-sm border-2 flex items-center justify-center ${item.isVeg ? 'border-green-600' : 'border-red-600'}`}>
                  <div className={`w-2 h-2 rounded-full ${item.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
                </div>
              </div>
              <div className="p-3">
                <div className="flex items-start justify-between mb-1">
                  <h3 className="font-bold text-[#3E2723] text-sm leading-tight">{item.name}</h3>
                  <span className="text-[#8B5A2B] font-bold text-sm whitespace-nowrap ml-2">₹{item.price}</span>
                </div>
                <p className="text-xs text-gray-500 line-clamp-2 mb-2">{item.description}</p>
                <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{item.prepTime}</span>
                  <span>{item.calories} kcal</span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setSelectedItem(item)}
                    className="flex-1 py-2 text-xs font-semibold text-[#8B5A2B] bg-[#FAF0E4] hover:bg-[#F0DFC4] rounded-lg transition-colors"
                  >
                    Customize
                  </button>
                  {getCartQuantity(item.id) > 0 ? (
                    <div className="flex-1 flex items-center border border-[#E8D5B5] rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          const qty = getCartQuantity(item.id);
                          if (qty <= 1) onRemoveItem(item.id);
                          else onUpdateQuantity(item.id, qty - 1);
                        }}
                        className="flex-1 py-2 flex items-center justify-center text-[#8B5A2B] hover:bg-[#FAF0E4] transition-colors active:scale-95"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="flex-1 py-2 text-center text-sm font-bold text-[#3E2723]">
                        {getCartQuantity(item.id)}
                      </span>
                      <button
                        onClick={() => onUpdateQuantity(item.id, getCartQuantity(item.id) + 1)}
                        className="flex-1 py-2 flex items-center justify-center text-[#8B5A2B] hover:bg-[#FAF0E4] transition-colors active:scale-95"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleQuickAdd(item)}
                      className="flex-1 py-2 text-xs font-semibold text-white bg-gradient-to-r from-[#8B5A2B] to-[#C8A47A] hover:shadow-md rounded-lg transition-all flex items-center justify-center gap-1 active:scale-95"
                    >
                      <Plus className="w-3 h-3" /> Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {filteredItems.length === 0 && (
          <div className="text-center py-16">
            <p className="text-gray-400 text-lg">No items found</p>
            <p className="text-gray-300 text-sm mt-1">Try adjusting your filters or search query</p>
          </div>
        )}
      </div>

      {/* Floating Cart Bar */}
      {cartCount > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-[#3E2723] to-[#5D4037] text-white p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.2)] z-40">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div>
              <span className="font-bold text-sm">{cartCount} item{cartCount !== 1 ? 's' : ''} added</span>
              <p className="text-white/60 text-xs">Tap to review & place order</p>
            </div>
            <button
              onClick={onGoToCart}
              className="px-6 py-3 bg-gradient-to-r from-[#C8A47A] to-[#D4AF37] text-[#3E2723] rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
            >
              View Cart →
            </button>
          </div>
        </div>
      )}

      {/* Customization Modal */}
      {selectedItem && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white w-full sm:max-w-lg sm:rounded-2xl rounded-t-2xl max-h-[90vh] overflow-y-auto">
            {/* Item Image */}
            <div className="relative h-48 sm:h-56 overflow-hidden sm:rounded-t-2xl">
              <MenuItemImage
                src={selectedItem.image}
                alt={selectedItem.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedItem(null)}
                className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm rounded-full p-2 hover:bg-white transition-colors"
              >
                <X className="w-5 h-5 text-[#3E2723]" />
              </button>
              <div className={`absolute bottom-3 left-3 w-5 h-5 rounded-sm border-2 flex items-center justify-center ${selectedItem.isVeg ? 'border-green-600 bg-white' : 'border-red-600 bg-white'}`}>
                <div className={`w-2.5 h-2.5 rounded-full ${selectedItem.isVeg ? 'bg-green-600' : 'bg-red-600'}`} />
              </div>
            </div>

            <div className="p-5">
              <div className="flex items-start justify-between mb-2">
                <h2 className="text-xl font-bold text-[#3E2723]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {selectedItem.name}
                </h2>
                <span className="text-lg font-bold text-[#8B5A2B]">₹{selectedItem.price}</span>
              </div>
              <p className="text-sm text-gray-500 mb-4">{selectedItem.description}</p>
              <div className="flex items-center gap-4 text-xs text-gray-400 mb-5">
                <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" />{selectedItem.prepTime}</span>
                <span>{selectedItem.calories} kcal</span>
              </div>

              {/* Spice Level */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#3E2723] mb-2">Spice Level</p>
                <div className="flex gap-2">
                  {['mild', 'medium', 'spicy', 'extra-spicy'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setCustomization((p) => ({ ...p, spiceLevel: level }))}
                      className={`px-3 py-1.5 rounded-full text-xs font-semibold capitalize border transition-all ${
                        customization.spiceLevel === level
                          ? 'bg-[#8B5A2B] text-white border-[#8B5A2B]'
                          : 'bg-white text-[#5D4037] border-[#E8D5B5] hover:bg-[#FAF0E4]'
                      }`}
                    >
                      {level.replace('-', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              {/* Add-ons */}
              <div className="mb-4">
                <p className="text-sm font-semibold text-[#3E2723] mb-2">Add-ons</p>
                <div className="space-y-2">
                  {addons.map((addon) => (
                    <label key={addon.id} className="flex items-center gap-3 p-2 rounded-lg hover:bg-[#FAF0E4] cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        checked={customization.addons.includes(addon.name)}
                        onChange={() => {
                          setCustomization((p) => ({
                            ...p,
                            addons: p.addons.includes(addon.name)
                              ? p.addons.filter((a) => a !== addon.name)
                              : [...p.addons, addon.name],
                          }));
                        }}
                        className="w-4 h-4 rounded border-[#E8D5B5] text-[#8B5A2B] focus:ring-[#C8A47A]"
                      />
                      <span className="text-sm text-[#3E2723] flex-1">{addon.name}</span>
                      <span className="text-xs text-[#8B5A2B] font-semibold">+₹{addon.price}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Special Instructions */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-[#3E2723] mb-2">Special Instructions</p>
                <textarea
                  value={customization.specialInstructions}
                  onChange={(e) => setCustomization((p) => ({ ...p, specialInstructions: e.target.value }))}
                  placeholder="Any special requests? (optional)"
                  rows={2}
                  className="w-full px-3 py-2 border border-[#E8D5B5] rounded-lg text-sm text-[#3E2723] placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#C8A47A] resize-none"
                />
              </div>

              {/* Quantity & Add */}
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-3 bg-[#FAF0E4] rounded-xl px-3 py-2">
                  <button
                    onClick={() => setCustomization((p) => ({ ...p, quantity: Math.max(1, p.quantity - 1) }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#8B5A2B] font-bold hover:bg-[#E8D5B5] transition-colors"
                  >
                    -
                  </button>
                  <span className="w-8 text-center font-bold text-[#3E2723]">{customization.quantity}</span>
                  <button
                    onClick={() => setCustomization((p) => ({ ...p, quantity: p.quantity + 1 }))}
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-white text-[#8B5A2B] font-bold hover:bg-[#E8D5B5] transition-colors"
                  >
                    +
                  </button>
                </div>
                <button
                  onClick={handleAddToCart}
                  className="flex-1 py-3 bg-gradient-to-r from-[#8B5A2B] to-[#C8A47A] text-white rounded-xl font-bold text-sm hover:shadow-lg transition-all active:scale-95"
                >
                  Add to Cart — ₹{selectedItem.price * customization.quantity}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

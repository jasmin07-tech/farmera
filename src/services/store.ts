import { useState, useEffect } from 'react';
import {
  User,
  FarmerProfile,
  CropListing,
  Order,
  Review,
  CartItem,
  Language,
  OrderStatus,
  CropJourneyUpdate,
  SMSMessage,
  CustomerTier,
  RegularCustomerOffer,
  CustomerLoyaltyProfile,
} from '../types';
import {
  INITIAL_FARMERS,
  INITIAL_CROPS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  INITIAL_SMS_MESSAGES,
  INITIAL_REGULAR_OFFERS,
} from '../data/initialData';

const STORAGE_KEY_PREFIX = 'farmera_db_v3_';

export interface AppNotification {
  id: string;
  title: string;
  message: string;
  type: 'order' | 'payment' | 'verification' | 'system';
  timestamp: string;
  read: boolean;
}

export const PRESET_USERS: Record<string, User> = {
  farmer: {
    id: 'farmer-1',
    name: 'Murugan Selvam',
    email: 'murugan.pollachi@farmera.in',
    role: 'farmer',
    phone: '+91 96772 66757',
    avatar: 'https://images.pexels.com/photos/18620460/pexels-photo-18620460.jpeg?cs=srgb&dl=pexels-gowtham-agm-609630353-18620460.jpg&fm=jpg',
    farmerProfileId: 'farmer-1',
  },
  customer: {
    id: 'cust-1',
    name: 'Ananya Krishnan',
    email: 'ananya.k@gmail.com',
    role: 'customer',
    phone: '+91 98402 11983',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
  },
  bulk_buyer: {
    id: 'cust-2',
    name: 'Karthik Raja (GreenBasket)',
    email: 'procure@greenbasket.in',
    role: 'bulk_buyer',
    phone: '+91 98840 99401',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
  },
};

// Simple event bus for reactivity
type Listener = () => void;
const listeners = new Set<Listener>();
const notify = () => listeners.forEach((l) => l());

// Real-time SMS event listener for push notifications / toast popups
export type SMSListener = (sms: SMSMessage) => void;
const smsListeners = new Set<SMSListener>();
export const subscribeNewSMS = (cb: SMSListener) => {
  smsListeners.add(cb);
  return () => {
    smsListeners.delete(cb);
  };
};

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : fallback;
  } catch {
    return fallback;
  }
}

function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage save error:', e);
  }
}

// In-Memory Database State
let currentUser: User = loadFromStorage('currentUser', PRESET_USERS.customer);
let currentLang: Language = loadFromStorage('currentLang', 'en');
let farmers: FarmerProfile[] = loadFromStorage('farmers', INITIAL_FARMERS);
let crops: CropListing[] = loadFromStorage('crops', INITIAL_CROPS);

// Ensure updated initial data (like new crops, new farmers, updated photos) is always synchronized
INITIAL_CROPS.forEach((initCrop) => {
  const existingIdx = crops.findIndex((c) => c.id === initCrop.id);
  if (existingIdx === -1) {
    crops.push(initCrop);
  } else {
    // Keep photos synchronized with initial catalog updates
    crops[existingIdx].photos = initCrop.photos;
    crops[existingIdx].name = initCrop.name;
    crops[existingIdx].district = initCrop.district;
  }
});
saveToStorage('crops', crops);

INITIAL_FARMERS.forEach((initFarmer) => {
  const existingIdx = farmers.findIndex((f) => f.id === initFarmer.id);
  if (existingIdx === -1) {
    farmers.push(initFarmer);
  } else {
    farmers[existingIdx].profilePhoto = initFarmer.profilePhoto;
    farmers[existingIdx].district = initFarmer.district;
    farmers[existingIdx].phone = initFarmer.phone;
  }
});
saveToStorage('farmers', farmers);

let orders: Order[] = loadFromStorage('orders', INITIAL_ORDERS);
// Synchronize any newly added initial orders
INITIAL_ORDERS.forEach((initOrder) => {
  if (!orders.some((o) => o.id === initOrder.id)) {
    orders.push(initOrder);
  }
});
saveToStorage('orders', orders);

let reviews: Review[] = loadFromStorage('reviews', INITIAL_REVIEWS);
let smsMessages: SMSMessage[] = loadFromStorage('smsMessages', INITIAL_SMS_MESSAGES);
INITIAL_SMS_MESSAGES.forEach((initSms) => {
  if (!smsMessages.some((m) => m.id === initSms.id)) {
    smsMessages.push(initSms);
  }
});
saveToStorage('smsMessages', smsMessages);

let regularOffers: RegularCustomerOffer[] = loadFromStorage('regularOffers', INITIAL_REGULAR_OFFERS);
let customerTierOverride: CustomerTier | null = loadFromStorage('customerTierOverride', null);
let customerPointsBalance: Record<string, number> = loadFromStorage('customerPointsBalance', {
  'cust-1': 240, // Ananya Krishnan initial loyalty points
  'cust-2': 500,
});

export function calculateCustomerLoyalty(
  userId: string,
  ordersList: Order[],
  tierOverride?: CustomerTier | null,
  pointsMap: Record<string, number> = {}
): CustomerLoyaltyProfile {
  const userOrders = ordersList.filter(
    (o) => o.customerId === userId && (o.status === 'delivered' || o.status === 'confirmed' || o.status === 'dispatched')
  );
  const totalOrdersCount = userOrders.length;
  const totalSpent = userOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // Determine base tier from order count & total spend
  let autoTier: CustomerTier = 'bronze';
  if (totalOrdersCount >= 7 || totalSpent >= 4000) {
    autoTier = 'platinum';
  } else if (totalOrdersCount >= 3 || totalSpent >= 1500) {
    autoTier = 'gold';
  } else if (totalOrdersCount >= 2 || totalSpent >= 600) {
    autoTier = 'silver';
  } else {
    autoTier = 'bronze';
  }

  const effectiveTier = tierOverride || autoTier;

  const tierMetadata: Record<
    CustomerTier,
    {
      name: string;
      nextTier: string;
      ordersNeeded: number;
      perks: string[];
    }
  > = {
    bronze: {
      name: 'Seedling Patron (New)',
      nextTier: 'Silver Farm Friend',
      ordersNeeded: Math.max(0, 2 - totalOrdersCount),
      perks: [
        'Direct farm gate price transparency',
        'Digital Farm Passport crop tracking',
        'Place 1 more order to unlock Regular Patron Status & 10% discount',
      ],
    },
    silver: {
      name: 'Silver Farm Friend (Regular Patron)',
      nextTier: 'Gold Harvest VIP',
      ordersNeeded: Math.max(0, 3 - totalOrdersCount),
      perks: [
        '10% Regular Patron discount on all crops (Code: REGULAR10)',
        'Flat ₹120 off on Family Harvest Baskets ₹699+ (Code: HARVESTLOYAL)',
        'Free Eco-Crate delivery on orders above ₹249 (Code: FRESHCRATE)',
        'Direct SMS dispatch & harvest status notifications',
      ],
    },
    gold: {
      name: 'Gold Harvest VIP (Frequent Regular)',
      nextTier: 'Platinum Agro Patron',
      ordersNeeded: Math.max(0, 7 - totalOrdersCount),
      perks: [
        '15% VIP harvest discount across all categories (Code: VIPGOLD15)',
        'Complimentary fresh native organic herb bunch with every order (Code: HERBGIFT)',
        '100% Free Eco-Crate cluster delivery (Code: FRESHCRATE)',
        'Earn 1.5x Kisan Loyalty Points on every rupee spent',
        'Priority morning cluster delivery dispatch',
      ],
    },
    platinum: {
      name: 'Platinum Agro Patron (Champion Patron)',
      nextTier: 'Max Tier Achieved',
      ordersNeeded: 0,
      perks: [
        '20% Agro Patron discount across all harvests (Code: PLATINUM20)',
        '100% Free VIP green priority delivery forever',
        'Complimentary seasonal harvest gift crate every quarter',
        'Early-access reservation for rare heirloom crops & seasonal mangoes',
        'Direct connection with FPO farm collective leadership',
      ],
    },
  };

  const info = tierMetadata[effectiveTier];
  const userPoints = pointsMap[userId] ?? Math.round(totalSpent / 10);
  const pointsValue = Math.floor(userPoints * 0.5); // 2 points = ₹1 discount

  return {
    customerId: userId,
    tier: effectiveTier,
    tierName: info.name,
    orderCount: totalOrdersCount,
    totalSpent,
    kisanPoints: userPoints,
    pointsWorthInr: pointsValue,
    nextTierOrdersNeeded: info.ordersNeeded,
    nextTierName: info.nextTier,
    isRegularCustomer: effectiveTier !== 'bronze',
    perks: info.perks,
  };
}
let cart: CartItem[] = loadFromStorage('cart', [
  { crop: INITIAL_CROPS[0], quantity: 2 },
  { crop: INITIAL_CROPS[2], quantity: 1 },
]);
let notifications: AppNotification[] = loadFromStorage('notifications', [
  {
    id: 'notif-1',
    title: 'Farmer Remuneration Settled',
    message: '₹686 credited to Meenakshi Sundaram via Direct UPI (0% platform cut).',
    type: 'payment',
    timestamp: '2 hours ago',
    read: false,
  },
  {
    id: 'notif-2',
    title: 'New Order Dispatched',
    message: 'Batch for Thiruvanmiyur route is on vehicle with AI optimized stops.',
    type: 'order',
    timestamp: '5 hours ago',
    read: false,
  },
]);

export const store = {
  // Getters
  getUser: () => currentUser,
  getLanguage: () => currentLang,
  getFarmers: () => farmers,
  getCrops: () => crops,
  getOrders: () => orders,
  getReviews: () => reviews,
  getCart: () => cart,
  getNotifications: () => notifications,
  getSMSMessages: () => smsMessages,
  getRegularOffers: () => regularOffers,
  getCustomerLoyalty: (userId?: string) =>
    calculateCustomerLoyalty(
      userId || currentUser.id,
      orders,
      customerTierOverride,
      customerPointsBalance
    ),
  getCustomerTierOverride: () => customerTierOverride,
  setCustomerTierOverride: (tier: CustomerTier | null) => {
    customerTierOverride = tier;
    saveToStorage('customerTierOverride', tier);
    notify();
  },
  addKisanPoints: (userId: string, points: number) => {
    customerPointsBalance[userId] = (customerPointsBalance[userId] || 0) + points;
    saveToStorage('customerPointsBalance', customerPointsBalance);
    notify();
  },
  redeemKisanPoints: (userId: string, points: number) => {
    customerPointsBalance[userId] = Math.max(0, (customerPointsBalance[userId] || 0) - points);
    saveToStorage('customerPointsBalance', customerPointsBalance);
    notify();
  },

  // SMS Operations
  sendSMS: (smsData: Omit<SMSMessage, 'id' | 'timestamp' | 'date' | 'read'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const newSMS: SMSMessage = {
      ...smsData,
      id: `sms-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: timeStr,
      date: 'Today',
      read: false,
    };

    smsMessages = [newSMS, ...smsMessages];
    saveToStorage('smsMessages', smsMessages);
    
    // Trigger real-time audio/toast listener
    smsListeners.forEach((listener) => {
      try {
        listener(newSMS);
      } catch (err) {
        console.error('SMS listener error:', err);
      }
    });

    notify();
    return newSMS;
  },

  markSMSRead: (id: string) => {
    smsMessages = smsMessages.map((m) => (m.id === id ? { ...m, read: true } : m));
    saveToStorage('smsMessages', smsMessages);
    notify();
  },

  markAllSMSRead: () => {
    smsMessages = smsMessages.map((m) => ({ ...m, read: true }));
    saveToStorage('smsMessages', smsMessages);
    notify();
  },

  deleteSMS: (id: string) => {
    smsMessages = smsMessages.filter((m) => m.id !== id);
    saveToStorage('smsMessages', smsMessages);
    notify();
  },

  clearAllSMS: () => {
    smsMessages = [];
    saveToStorage('smsMessages', smsMessages);
    notify();
  },

  resetSMS: () => {
    smsMessages = INITIAL_SMS_MESSAGES;
    saveToStorage('smsMessages', smsMessages);
    notify();
  },

  // Setters & Actions
  setUser: (user: User) => {
    currentUser = user;
    saveToStorage('currentUser', user);
    notify();
  },

  switchPresetUser: (role: 'farmer' | 'customer' | 'bulk_buyer') => {
    currentUser = PRESET_USERS[role];
    saveToStorage('currentUser', currentUser);
    notify();
  },

  setLanguage: (lang: Language) => {
    currentLang = lang;
    saveToStorage('currentLang', lang);
    notify();
  },

  // Farmer operations
  addFarmerProfile: (profile: FarmerProfile) => {
    farmers = [profile, ...farmers];
    saveToStorage('farmers', farmers);
    notify();
  },

  updateFarmerVerification: (farmerId: string, isVerified: boolean) => {
    farmers = farmers.map((f) =>
      f.id === farmerId
        ? {
            ...f,
            isVerified,
            verificationDate: isVerified ? new Date().toISOString().split('T')[0] : undefined,
          }
        : f
    );
    saveToStorage('farmers', farmers);
    notify();
  },

  addCropJourneyUpdate: (farmerId: string, update: CropJourneyUpdate) => {
    farmers = farmers.map((f) => {
      if (f.id === farmerId) {
        return {
          ...f,
          journeyUpdates: [update, ...f.journeyUpdates],
        };
      }
      return f;
    });
    saveToStorage('farmers', farmers);
    notify();
  },

  // Crop listings
  addCropListing: (crop: CropListing) => {
    crops = [crop, ...crops];
    saveToStorage('crops', crops);
    // Add notification
    store.addNotification({
      id: `notif-${Date.now()}`,
      title: 'New Crop Listed',
      message: `${crop.name} listed by ${crop.farmerName} (${crop.quantityAvailable} ${crop.unit} at ₹${crop.pricePerUnit}/${crop.unit}).`,
      type: 'system',
      timestamp: 'Just now',
      read: false,
    });
    notify();
  },

  updateCropListing: (cropId: string, updates: Partial<CropListing>) => {
    crops = crops.map((c) => (c.id === cropId ? { ...c, ...updates } : c));
    saveToStorage('crops', crops);
    notify();
  },

  // Cart operations
  addToCart: (crop: CropListing, quantity = 1) => {
    const existingIndex = cart.findIndex((item) => item.crop.id === crop.id);
    if (existingIndex > -1) {
      cart = cart.map((item, idx) =>
        idx === existingIndex ? { ...item, quantity: item.quantity + quantity } : item
      );
    } else {
      cart = [...cart, { crop, quantity }];
    }
    saveToStorage('cart', cart);
    notify();
  },

  removeFromCart: (cropId: string) => {
    cart = cart.filter((item) => item.crop.id !== cropId);
    saveToStorage('cart', cart);
    notify();
  },

  updateCartQuantity: (cropId: string, quantity: number) => {
    if (quantity <= 0) {
      store.removeFromCart(cropId);
      return;
    }
    cart = cart.map((item) =>
      item.crop.id === cropId ? { ...item, quantity } : item
    );
    saveToStorage('cart', cart);
    notify();
  },

  clearCart: () => {
    cart = [];
    saveToStorage('cart', cart);
    notify();
  },

  // Orders
  createOrder: (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'trackingStep' | 'paymentStatus'>) => {
    const customerId = orderData.customerId || currentUser.id;
    const loyalty = store.getCustomerLoyalty(customerId);

    // Calculate points earned (1 pt per ₹10; 1.5x multiplier for Gold/Platinum regular patrons)
    const multiplier = (loyalty.tier === 'gold' || loyalty.tier === 'platinum') ? 1.5 : 1.0;
    const earnedPoints = Math.round((orderData.totalAmount / 10) * multiplier);

    const newOrder: Order = {
      ...orderData,
      id: `ORD-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'placed',
      createdAt: new Date().toISOString(),
      paymentStatus: 'paid',
      trackingStep: 1,
      kisanPointsEarned: earnedPoints,
      customerTierAtPurchase: loyalty.tier,
    };

    // Update customer's points balance
    if (orderData.kisanPointsRedeemed && orderData.kisanPointsRedeemed > 0) {
      store.redeemKisanPoints(customerId, orderData.kisanPointsRedeemed);
    }
    store.addKisanPoints(customerId, earnedPoints);

    orders = [newOrder, ...orders];
    saveToStorage('orders', orders);
    store.clearCart();

    // Alert notification for farmer
    store.addNotification({
      id: `notif-${Date.now()}`,
      title: 'New Order Received! 🌾',
      message: `Order #${newOrder.id} placed by ${newOrder.customerName}. ₹${newOrder.farmerEarnings} will be credited to farmer accounts upon delivery.`,
      type: 'order',
      timestamp: 'Just now',
      read: false,
    });

    // 1. Send SMS to Customer with regular savings info
    const farmNames = Array.from(new Set(newOrder.items.map((i) => i.farmName))).join(', ');
    const totalSavings = (newOrder.discountAmount || 0) + (newOrder.kisanPointsDiscount || 0);
    const savingsText = totalSavings > 0
      ? ` (Regular Patron Saved ₹${totalSavings}${newOrder.appliedOfferCode ? ` with code ${newOrder.appliedOfferCode}` : ''}!)`
      : '';
    const pointsText = ` Earned +${earnedPoints} Kisan Loyalty Points (Total: ${(customerPointsBalance[customerId] || 0)} pts).`;

    store.sendSMS({
      senderId: 'VK-FRMERA',
      to: newOrder.customerPhone || '+91 98402 11983',
      recipientName: `${newOrder.customerName} (Customer)`,
      recipientRole: 'customer',
      category: 'order',
      message: `FarmEra: Order #${newOrder.id} confirmed for ₹${newOrder.totalAmount}.${savingsText} 100% fair remuneration to farmers. Harvest from ${farmNames}.${pointsText} Live tracking: farmera.in/t/${newOrder.id}`,
      orderId: newOrder.id,
      amount: newOrder.totalAmount,
    });

    // 2. Send SMS to each unique Farmer involved in the order
    const farmerMap = new Map<string, typeof newOrder.items>();
    newOrder.items.forEach((item) => {
      const list = farmerMap.get(item.farmerId) || [];
      list.push(item);
      farmerMap.set(item.farmerId, list);
    });

    farmerMap.forEach((fItems, farmerId) => {
      const farmerProfile = farmers.find((f) => f.id === farmerId);
      const farmerItemsTotal = fItems.reduce((sum, item) => sum + item.subtotal, 0);
      const itemsSummary = fItems.map((i) => `${i.quantity}${i.unit} ${i.cropName}`).join(', ');

      store.sendSMS({
        senderId: 'DM-KISAN',
        to: farmerProfile?.phone || '+91 98421 88412',
        recipientName: `${farmerProfile?.name || fItems[0].farmerName} (Farmer)`,
        recipientRole: 'farmer',
        category: 'order',
        message: `Kisan Alert: New Harvest Order #${newOrder.id} from ${newOrder.customerName}! Items: ${itemsSummary}. Direct payout ₹${farmerItemsTotal} will be credited to your UPI after gate pickup.`,
        orderId: newOrder.id,
        amount: farmerItemsTotal,
      });
    });

    notify();
    return newOrder;
  },

  updateOrderStatus: (orderId: string, status: OrderStatus) => {
    const stepMap: Record<OrderStatus, number> = {
      placed: 1,
      confirmed: 2,
      dispatched: 3,
      delivered: 4,
    };

    orders = orders.map((o) => {
      if (o.id === orderId) {
        const isDelivered = status === 'delivered';
        const isDispatched = status === 'dispatched';
        return {
          ...o,
          status,
          trackingStep: stepMap[status],
          dispatchedAt: isDispatched ? new Date().toISOString() : o.dispatchedAt,
          deliveredAt: isDelivered ? new Date().toISOString() : o.deliveredAt,
          paymentStatus: isDelivered ? 'settled_to_farmer' : o.paymentStatus,
        };
      }
      return o;
    });

    saveToStorage('orders', orders);

    const targetOrder = orders.find((o) => o.id === orderId);

    // Send Contextual Simulated SMS depending on order status change
    if (targetOrder) {
      if (status === 'confirmed') {
        store.sendSMS({
          senderId: 'VK-FRMERA',
          to: targetOrder.customerPhone || '+91 98402 11983',
          recipientName: `${targetOrder.customerName} (Customer)`,
          recipientRole: 'customer',
          category: 'order',
          message: `FarmEra: Order #${orderId} update: Farm confirmed! Produce freshly hand-picked at sunrise, graded, and packed in breathable eco-crates.`,
          orderId,
        });
      } else if (status === 'dispatched') {
        // SMS to Customer
        store.sendSMS({
          senderId: 'VK-FRMERA',
          to: targetOrder.customerPhone || '+91 98402 11983',
          recipientName: `${targetOrder.customerName} (Customer)`,
          recipientRole: 'customer',
          category: 'dispatch',
          message: `FarmEra Transit: Your harvest order #${orderId} is OUT FOR DELIVERY via AI-optimized cluster route (KA-04-E-8812). Track fresh arrival: farmera.in/t/${orderId}`,
          orderId,
        });

        // SMS to Farmer
        targetOrder.items.forEach((item) => {
          const farmerProfile = farmers.find((f) => f.id === item.farmerId);
          store.sendSMS({
            senderId: 'DM-KISAN',
            to: farmerProfile?.phone || '+91 98421 88412',
            recipientName: `${farmerProfile?.name || item.farmerName} (Farmer)`,
            recipientRole: 'farmer',
            category: 'dispatch',
            message: `Kisan Dispatch: Crates for Order #${orderId} (${item.quantity}${item.unit} ${item.cropName}) safely handed to FarmEra cluster vehicle.`,
            orderId,
          });
        });
      } else if (status === 'delivered') {
        store.addNotification({
          id: `notif-${Date.now()}`,
          title: 'Payment Credited to Farmer 💰',
          message: `Order #${orderId} marked Delivered! ₹${targetOrder.farmerEarnings || 0} credited directly to farmer account via UPI. Zero intermediary deductions.`,
          type: 'payment',
          timestamp: 'Just now',
          read: false,
        });

        // Instant Direct UPI Credit SMS to Farmer
        targetOrder.items.forEach((item) => {
          const farmerProfile = farmers.find((f) => f.id === item.farmerId);
          store.sendSMS({
            senderId: 'AX-SBIUPI',
            to: farmerProfile?.phone || '+91 98421 88412',
            recipientName: `${farmerProfile?.name || item.farmerName} (Farmer)`,
            recipientRole: 'farmer',
            category: 'payment',
            message: `Dear Kisan ${farmerProfile?.name || item.farmerName}, ₹${item.subtotal}.00 credited to your SBI A/C ending XX4112 via Direct UPI Ref UPI/FRM-${orderId}. Zero broker commission deducted. Jai Kisan!`,
            orderId,
            amount: item.subtotal,
          });
        });

        // SMS to Customer
        store.sendSMS({
          senderId: 'VK-FRMERA',
          to: targetOrder.customerPhone || '+91 98402 11983',
          recipientName: `${targetOrder.customerName} (Customer)`,
          recipientRole: 'customer',
          category: 'order',
          message: `FarmEra: Order #${orderId} delivered fresh to your doorstep! 100% of payment released directly to farmers. View Digital Farm Passport & leave a rating: farmera.in/p/${orderId}`,
          orderId,
        });
      }
    }

    notify();
  },

  // Reviews
  addReview: (review: Omit<Review, 'id' | 'date' | 'verifiedPurchase'>) => {
    const newRev: Review = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      verifiedPurchase: true,
    };
    reviews = [newRev, ...reviews];
    saveToStorage('reviews', reviews);

    // Update order to indicate review submitted
    orders = orders.map((o) => (o.id === review.orderId ? { ...o, reviewSubmitted: true } : o));
    saveToStorage('orders', orders);

    // Update farmer rating
    const farmerRevs = reviews.filter((r) => r.farmerId === review.farmerId);
    const avgRating =
      farmerRevs.reduce((acc, r) => acc + r.rating, 0) / farmerRevs.length;

    farmers = farmers.map((f) =>
      f.id === review.farmerId
        ? {
            ...f,
            rating: Number(avgRating.toFixed(2)),
            reviewCount: f.reviewCount + 1,
          }
        : f
    );
    saveToStorage('farmers', farmers);

    notify();
  },

  addNotification: (notif: AppNotification) => {
    notifications = [notif, ...notifications];
    saveToStorage('notifications', notifications);
    notify();
  },

  markNotificationsRead: () => {
    notifications = notifications.map((n) => ({ ...n, read: true }));
    saveToStorage('notifications', notifications);
    notify();
  },

  resetDemoData: () => {
    localStorage.clear();
    currentUser = PRESET_USERS.customer;
    currentLang = 'en';
    farmers = INITIAL_FARMERS;
    crops = INITIAL_CROPS;
    orders = INITIAL_ORDERS;
    reviews = INITIAL_REVIEWS;
    cart = [
      { crop: INITIAL_CROPS[0], quantity: 2 },
      { crop: INITIAL_CROPS[2], quantity: 1 },
    ];
    smsMessages = INITIAL_SMS_MESSAGES;
    notify();
  },
};

// React hook for connecting components to store
export function useFarmStore() {
  const [, setTick] = useState(0);

  useEffect(() => {
    const listener = () => setTick((t) => t + 1);
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  }, []);

  return {
    currentUser: store.getUser(),
    currentLang: store.getLanguage(),
    farmers: store.getFarmers(),
    crops: store.getCrops(),
    orders: store.getOrders(),
    reviews: store.getReviews(),
    cart: store.getCart(),
    notifications: store.getNotifications(),
    smsMessages: store.getSMSMessages(),
    regularOffers: store.getRegularOffers(),
    customerLoyalty: store.getCustomerLoyalty(),
    customerTierOverride: store.getCustomerTierOverride(),
    actions: store,
  };
}

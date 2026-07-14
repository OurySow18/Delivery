export type PickupStatus = 'pending' | 'partial' | 'complete';

export interface DeliverInfo {
  name: string;
  address: string;
  phone: string;
  additionalInfo?: string;
}

export interface CartItem {
  productId: string;
  name: string;
  poids?: string | number;
  price?: string | number;
  img?: string;
  priceDetail?: string | number;
  priceBulk?: string | number;
  quantityDetail?: number;
  quantityBulk?: number;
  amountDetail?: string | number;
  amountBulk?: string | number;
  totalAmount?: string | number;
  description?: string;
  nbUnit?: string;
  category?: string;
  content?: string;
  selectedOption?: 'details' | 'bulk';
  secondQuantity?: number;
  vendorId?: string;
  vendorName?: string;
  vendorAddress?: string;
  vendorPhone?: string;
  vendorNotes?: string;
  vendorLatitude?: number;
  vendorLongitude?: number;
  pickedUp?: boolean;
  pickedUpAt?: string;
  pickedUpByUid?: string;
  pickedUpByEmail?: string;
  pickupValidatedByVendor?: boolean;
  pickupValidatedAt?: string;
}

export interface OrderData {
  id: string;
  userId?: string;
  orderDetails?: string;
  mail_invoice?: string;
  payed: boolean;
  delivered: boolean;
  orderId?: string;
  scanNum: string;
  paymentMethod?: string;
  paymentType?: string;
  total: number;
  cart?: CartItem[];
  company?: {
    adress?: string;
    address?: string;
    city?: string;
    logoUrl?: string;
    phone?: string;
    representative?: string | {
      username?: string;
      surname?: string;
      name?: string;
    };
  };
  timeStamp?: any;
  deliveredAt?: any;
  deliverInfos?: DeliverInfo;
  pickupCompleted?: boolean;
  pickupCompletedAt?: any;
  pickupUpdatedAt?: any;
  readyForDelivery?: boolean;
  pickupStatus?: PickupStatus;
}

export interface VendorGroupItem {
  orderId: string;
  orderScanNum: string;
  customerName: string;
  customerAddress: string;
  itemIndex: number;
  item: CartItem;
}

export interface VendorGroup {
  vendorKey: string;
  vendorName: string;
  vendorAddress: string;
  vendorPhone: string;
  vendorNotes: string;
  vendorLatitude?: number;
  vendorLongitude?: number;
  items: VendorGroupItem[];
}

interface GroupOrdersByVendorOptions {
  includePicked?: boolean;
}

export const isItemPickedUp = (item: CartItem) => item.pickedUp === true;

export const getItemQuantityLabel = (item: CartItem) => {
  const bulk = item.quantityBulk ?? 0;
  const detail = item.quantityDetail ?? 0;

  if (bulk > 0 && detail > 0) {
    return `${bulk} cartons / ${detail} details`;
  }
  if (bulk > 0) {
    return `${bulk} cartons`;
  }
  if (detail > 0) {
    return `${detail} details`;
  }
  return 'Quantite non precisee';
};

export const getVendorKey = (item: CartItem) => {
  if (item.vendorId) return item.vendorId;
  if (item.vendorName) return item.vendorName.toLowerCase().replace(/\s+/g, '-');
  return 'vendor-unknown';
};

export const getVendorLabel = (item: CartItem) => item.vendorName || 'Vendeur non renseigne';

export const getVendorGroupItemKey = (vendorKey: string, item: VendorGroupItem) =>
  `${vendorKey}:${item.orderId}:${item.itemIndex}:${item.item.productId}`;

export const getPickupSummary = (order: OrderData) => {
  const cart = order.cart ?? [];
  const totalItems = cart.length;
  const pickedUpItems = cart.filter(isItemPickedUp).length;
  const hasTrackedPickup = cart.some((item) => Boolean(item.vendorId || item.vendorName || item.pickedUp !== undefined));
  const allPickedUp = totalItems > 0 && pickedUpItems === totalItems;
  const readyForDelivery =
    order.readyForDelivery === true ||
    order.pickupCompleted === true ||
    allPickedUp ||
    !hasTrackedPickup;

  let pickupStatus: PickupStatus = 'pending';
  if (readyForDelivery && totalItems > 0) {
    pickupStatus = 'complete';
  } else if (pickedUpItems > 0) {
    pickupStatus = 'partial';
  }

  return {
    totalItems,
    pickedUpItems,
    hasTrackedPickup,
    readyForDelivery,
    pickupStatus,
  };
};

export const groupOrdersByVendor = (
  orders: OrderData[],
  options: GroupOrdersByVendorOptions = {}
): VendorGroup[] => {
  const vendorMap = new Map<string, VendorGroup>();
  const includePicked = options.includePicked === true;

  for (const order of orders) {
    for (const [itemIndex, item] of (order.cart ?? []).entries()) {
      if (!includePicked && isItemPickedUp(item)) {
        continue;
      }

      const vendorKey = getVendorKey(item);
      const group = vendorMap.get(vendorKey) ?? {
        vendorKey,
        vendorName: getVendorLabel(item),
        vendorAddress: item.vendorAddress ?? 'Adresse vendeur non renseignee',
        vendorPhone: item.vendorPhone ?? 'Telephone vendeur non renseigne',
        vendorNotes: item.vendorNotes ?? '',
        vendorLatitude: item.vendorLatitude,
        vendorLongitude: item.vendorLongitude,
        items: [],
      };

      group.items.push({
        orderId: order.id,
        orderScanNum: order.scanNum,
        customerName: order.deliverInfos?.name ?? 'Client non renseigne',
        customerAddress: order.deliverInfos?.address ?? 'Adresse client non renseignee',
        itemIndex,
        item,
      });

      vendorMap.set(vendorKey, group);
    }
  }

  return Array.from(vendorMap.values()).sort((a, b) => a.vendorName.localeCompare(b.vendorName));
};

import type { CartItem, OrderData } from '@/constants/OrderWorkflow';

type CompanyInfo = NonNullable<OrderData['company']>;
type RepresentativeInfo = CompanyInfo['representative'];

const pickFirstString = (source: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    const value = source[key];
    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
};

const getRepresentativeName = (representative: RepresentativeInfo) => {
  if (typeof representative === 'string' && representative.trim()) {
    return representative.trim();
  }

  if (representative && typeof representative === 'object') {
    const source = representative as Record<string, unknown>;
    const fullName = pickFirstString(source, ['name', 'displayName']);
    const username = pickFirstString(source, ['username', 'firstName', 'firstname']);
    const surname = pickFirstString(source, ['surname', 'lastName', 'lastname']);

    return fullName || [username, surname].filter(Boolean).join(' ') || undefined;
  }

  return undefined;
};

const getVendorProfileFromOrder = (order: OrderData) => {
  const company = order.company;
  if (!company) {
    return null;
  }

  const address = company.adress?.trim() || company.address?.trim() || '';
  const city = company.city?.trim() || '';
  const fullAddress = [address, city].filter(Boolean).join(', ');

  return {
    vendorName: getRepresentativeName(company.representative),
    vendorAddress: fullAddress || undefined,
    vendorPhone: company.phone?.trim() || undefined,
  };
};

const mergeVendorData = (item: CartItem, vendorProfile: ReturnType<typeof getVendorProfileFromOrder>) => {
  if (!vendorProfile) {
    return item;
  }

  return {
    ...item,
    vendorName: item.vendorName ?? vendorProfile.vendorName,
    vendorAddress: item.vendorAddress ?? vendorProfile.vendorAddress,
    vendorPhone: item.vendorPhone ?? vendorProfile.vendorPhone,
  };
};

export const hydrateOrdersWithVendorProfiles = async (orders: OrderData[]) => {
  return orders.map((order) => ({
    ...order,
    cart: (order.cart ?? []).map((item) => mergeVendorData(item, getVendorProfileFromOrder(order))),
  }));
};

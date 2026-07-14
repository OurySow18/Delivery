import type { CartItem, OrderData } from '@/constants/OrderWorkflow';
import { db } from '@/firebase';
import { doc, getDoc } from '@firebase/firestore';

type CompanyInfo = NonNullable<OrderData['company']>;
type RepresentativeInfo = CompanyInfo['representative'];
type VendorProfile = {
  vendorName?: string;
  vendorAddress?: string;
  vendorPhone?: string;
  vendorLatitude?: number;
  vendorLongitude?: number;
};

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

const getVendorProfileFromOrder = (order: OrderData): VendorProfile | null => {
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

const getApprovedCoordinates = (source: Record<string, unknown>): Pick<VendorProfile, 'vendorLatitude' | 'vendorLongitude'> | null => {
  const approvedCoordinates = source.approvedCoordinates;
  if (!approvedCoordinates || typeof approvedCoordinates !== 'object') {
    return null;
  }

  const latitude = (approvedCoordinates as Record<string, unknown>).latitude;
  const longitude = (approvedCoordinates as Record<string, unknown>).longitude;

  if (
    typeof latitude !== 'number' ||
    typeof longitude !== 'number' ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude) ||
    latitude < -90 ||
    latitude > 90 ||
    longitude < -180 ||
    longitude > 180
  ) {
    return null;
  }

  return {
    vendorLatitude: latitude,
    vendorLongitude: longitude,
  };
};

const getVendorProfileFromDocument = (source: Record<string, unknown>): VendorProfile => {
  const rawCompany = source.company;
  const company =
    rawCompany && typeof rawCompany === 'object'
      ? (rawCompany as Record<string, unknown>)
      : {};
  const address = pickFirstString(company, ['address', 'adress']);
  const city = pickFirstString(company, ['city']);
  const fullAddress = [address, city].filter(Boolean).join(', ');

  return {
    vendorName: pickFirstString(company, ['name', 'representative']),
    vendorAddress: fullAddress || undefined,
    vendorPhone: pickFirstString(company, ['phone']),
    ...getApprovedCoordinates(source),
  };
};

const mergeVendorData = (
  item: CartItem,
  vendorProfile: ReturnType<typeof getVendorProfileFromOrder>,
  officialVendorProfile: VendorProfile | null
) => {
  return {
    ...item,
    vendorName: officialVendorProfile?.vendorName ?? item.vendorName ?? vendorProfile?.vendorName,
    vendorAddress: officialVendorProfile?.vendorAddress ?? item.vendorAddress ?? vendorProfile?.vendorAddress,
    vendorPhone: officialVendorProfile?.vendorPhone ?? item.vendorPhone ?? vendorProfile?.vendorPhone,
    vendorLatitude: officialVendorProfile?.vendorLatitude ?? item.vendorLatitude,
    vendorLongitude: officialVendorProfile?.vendorLongitude ?? item.vendorLongitude,
  };
};

export const hydrateOrdersWithVendorProfiles = async (orders: OrderData[]) => {
  const vendorIds = Array.from(
    new Set(
      orders.flatMap((order) =>
        (order.cart ?? [])
          .map((item) => item.vendorId)
          .filter((vendorId): vendorId is string => Boolean(vendorId))
      )
    )
  );

  const vendorProfileEntries = await Promise.all(
    vendorIds.map(async (vendorId) => {
      try {
        const vendorSnapshot = await getDoc(doc(db, 'vendors', vendorId));
        const vendorProfile = vendorSnapshot.exists()
          ? getVendorProfileFromDocument(vendorSnapshot.data() as Record<string, unknown>)
          : null;

        return [vendorId, vendorProfile] as const;
      } catch (error) {
        console.error(`Erreur lors du chargement du vendeur ${vendorId} :`, error);
        return [vendorId, null] as const;
      }
    })
  );
  const profilesByVendorId = new Map(vendorProfileEntries);

  return orders.map((order) => ({
    ...order,
    cart: (order.cart ?? []).map((item) =>
      mergeVendorData(
        item,
        getVendorProfileFromOrder(order),
        item.vendorId ? profilesByVendorId.get(item.vendorId) ?? null : null
      )
    ),
  }));
};

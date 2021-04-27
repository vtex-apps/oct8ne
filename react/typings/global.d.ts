interface Window extends Window {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  oct8neVtex: Oct8neVtex
  oct8ne: Oct8ne
}

interface Oct8neVtex {
  log: (param: string) => void;
  cart: Cart;
  customerCart: Item[];
  enableLogs: boolean;
}

interface Oct8ne {
  restart: Function,
  currentProduct: CurrentProduct
  options: {
    vtexioInfo: {
      customerInfo: Customer | null
    }
  }
}

interface CurrentProduct {
  id: string
  thumbnail: string
}

interface Cart {
  price: number | string
  finalPrice: number
  currency: string
  totalItems: number
  cart: Item[]
}

interface Item {
  internalId: string
  title: string
  qty: number
  price?: string | number
  formattedPrice?: string
  formattedPrevPrice?: string
  productUrl?: string
}

interface Customer {
  id?: string
  firstName?: string
  lastName?: string
  email?: string
  wishList: null
  cart: Item[]
}

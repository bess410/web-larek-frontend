// Типы данных
type ProductCategory = "софт-скил" | "другое" | "дополнительное" | "кнопка" | "хард-скил"

export interface IProduct {
    id: string
    description: string
    image: string
    title: string
    category: ProductCategory
    price: number | null
}

type OrderPayment = "online" | "cash"

export interface IOrder {
    payment: OrderPayment
    email: string
    phone: string
    address: string
    total: number
    items: IProduct[]
}
// Отображение продукта на главной странице
type TProduct = Omit<IProduct, "description">
// Отображение продукта в корзине
type TBasketProduct = Pick<IProduct, "id" | "title" | "price">

export interface IOrderResult {
    id: string
    total: number
}

export interface WebLarekApi {
    getProducts: () => Promise<IProduct[]>
    getProductById: (id: string) => Promise<IProduct>
    orderProducts: (data: IOrder) => Promise<IOrderResult>
}

// Модель
type AppStateModal = "product" | "basket" | "order"
export interface IAppData {
    products: TProduct[]
    basket: TBasketProduct[]
    basketTotal: number
    selectedProduct: string | null
    openedModal: AppStateModal | null
    errorMessage: string | null

    loadProducts: () => Promise<void>
    selectProduct: (id: string) => IProduct
    addProductToBasket: (id: string) => void
    removeProductFromBasket: (id: string) => void
    orderProducts: () => Promise<IOrderResult>
    openModal: (modal: AppStateModal) => void
    closeModal: () => void
    checkOrderValidation: (data: Record<keyof IOrder, string>) => boolean
}

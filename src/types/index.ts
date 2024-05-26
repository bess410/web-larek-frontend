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
    items: string[]
}

export interface OrderResult {
    id: string
    total: number
}

export interface WebLarekApi {
    getProducts: () => Promise<IProduct[]>
    getProductById: (id: string) => Promise<IProduct>
    orderProducts: (data: IOrder) => Promise<OrderResult>
}

// Модель
type AppStateModal = "product" | "basket" | "order"
export interface IAppModel {
    products?: IProduct[]
    basket: Map<string, IProduct>
    basketTotal: number
    selectedProduct?: IProduct
    openedModal: AppStateModal | null

    loadProducts: () => Promise<void>
    selectProduct: (id: string) => Promise<void>
    addProductToBasket: (id: string) => void
    removeProductFromBasket: (id: string) => void
    orderProducts: () => Promise<OrderResult>
    openModal: (modal: AppStateModal) => void
    closeModal: () => void
}
// Отображения
export interface ProductView {
    id: string
    image: string
    title: string
    category: ProductCategory
    price: number | null
}

export interface SelectedProductView extends ProductView {
    description: string
}

export interface BasketView {
    products: Pick<ProductView, "id" | "title" | "price">[]
    total: number
}

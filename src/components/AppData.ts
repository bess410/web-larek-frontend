import {Model} from "./base/Model";
import {Events, IAppData, IOrder, IProduct} from "../types";
import {IEvents} from "./base/Events";

export type ProductsChangeEvent = {
    products: IProduct[]
}

export class AppData extends Model<IAppData> {
    private products: IProduct[];
    private basket: IProduct[];
    private order: IOrder;

    constructor(data: Partial<IAppData>, events: IEvents, products: IProduct[], basket: IProduct[], order: IOrder) {
        super(data, events);
        this.products = products;
        this.basket = basket;
        this.order = order;
    }

    setProducts(products: IProduct[]) {
        this.products = products;
        this.emitChanges(Events.PRODUCTS_CHANGED, { products: this.products });
    }

    getProducts() {
        return this.products;
    }

    getBasket() {
        return this.basket;
    }

    addProductToBasket(product: IProduct) {
        if (!this.basket.some(item => item === product)) {
            this.basket.push(product);
        }
    }

    getTotalPrice() {
        return this.basket.map(product => product.price)
            .reduce((prev, current) => prev + current, 0);
    }

    removeProductFromBasket(product: IProduct) {
        this.basket = this.basket.filter(item => item !== product);
        this.emitChanges(Events.BASKET_OPEN);
    }
}
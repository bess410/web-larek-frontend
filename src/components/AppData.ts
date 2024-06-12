import {Model} from "./base/Model";
import {Events, IAppData, IOrder, IProduct} from "../types";

export type ProductsChangeEvent = {
    products: IProduct[]
}

export class AppData extends Model<IAppData> {
    private products: IProduct[]
    private basket: IProduct[]
    private selectedProduct: string | null
    private order: IOrder

    setProducts(products: IProduct[]) {
        this.products = products;
        this.emitChanges(Events.PRODUCTS_CHANGED, { products: this.products });
    }

    getProducts() {
        return this.products;
    }
}
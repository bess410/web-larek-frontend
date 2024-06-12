import {ProductCategory} from "../types";
import {Component} from "./base/Component";
import {ensureElement} from "../utils/utils";

interface IProductActions {
    onClick: (event: MouseEvent) => void;
}

export interface IProductView {
    id: string
    description: string
    image: string
    title: string
    category: ProductCategory
    price: string
}

export class ProductView extends Component<IProductView> {
    private _image: HTMLImageElement;
    private _title: HTMLElement;
    private _category: HTMLElement;
    private _price: HTMLElement;

    constructor(container: HTMLElement, actions: IProductActions) {
        super(container);

        this._title = ensureElement<HTMLElement>('.card__title', container);
        this._image = ensureElement<HTMLImageElement>('.card__image', container);
        this._category = ensureElement<HTMLElement>('.card__category', container);
        this._price = ensureElement<HTMLElement>('.card__price', container);

        container.addEventListener('click', actions.onClick);
    }

    set title(value: string) {
        this.setText(this._title, value);
    }
    set image(value: string) {
        this.setImage(this._image, value, this.title)
    }

    set category(value: keyof typeof ProductCategory) {
        if (this._category) {
            this.setText(this._category, value);
            const categoryStyle = `card__category_${ProductCategory[value]}`;
            this._category.classList.add(categoryStyle);
        }
    }

    set price(value: string) {
        this.setText(this._price, value)
    }
}

export class ProductViewModal extends ProductView {
    private _description: HTMLElement;

    constructor(container: HTMLElement, actions: IProductActions) {
        super(container, actions);
        this._description = ensureElement<HTMLElement>('.card__text', container);
    }

    set description(value: string) {
        this.setText(this._description, value)
    }
}
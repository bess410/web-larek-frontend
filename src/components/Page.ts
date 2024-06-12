import {Component} from "./base/Component";
import {IEvents} from "./base/Events";
import {ensureElement} from "../utils/utils";

interface IPage {
    basketCounter: number;
    products: HTMLElement[];
    locked: boolean;
}

export class Page extends Component<IPage> {
    private _basketCounter: HTMLElement;
    private _products: HTMLElement;
    private _basket: HTMLElement;

    constructor(container: HTMLElement, protected events: IEvents) {
        super(container);

        this._basketCounter = ensureElement<HTMLElement>('.header__basket-counter');
        this._products = ensureElement<HTMLElement>('.gallery');
        this._basket = ensureElement<HTMLElement>('.header__basket');

        this._basket.addEventListener('click', () => {
            this.events.emit('basket:open');
        });
    }

    set products(products: HTMLElement[]) {
        this._products.replaceChildren(...products);
    }
}

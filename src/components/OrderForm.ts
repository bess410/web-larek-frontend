import {IEvents} from "./base/Events";
import {Events, IOrder} from "../types";
import {Form} from "./common/Form";

export class OrderForm extends Form<IOrder> {
    private _buttonOnlinePayment: HTMLButtonElement;
    private _buttonCashPayment: HTMLButtonElement;
    private _inputAddress: HTMLInputElement;

    constructor(container: HTMLFormElement, protected events: IEvents) {
        super(container, events);

        this._buttonOnlinePayment = container.querySelector<HTMLButtonElement>('button[name="card"]');
        this._buttonCashPayment = container.querySelector<HTMLButtonElement>('button[name="cash"]');

        this._inputAddress = container.querySelector<HTMLInputElement>('input[name="address"]');

        this._buttonOnlinePayment.addEventListener('click', () => this.togglePaymentMethod('card'));
        this._buttonCashPayment.addEventListener('click', () => this.togglePaymentMethod('cash'));
    }

    toggleCard(state: boolean = true) {
        this.toggleClass(this._buttonOnlinePayment, 'button_alt-active', state);
    }

    toggleCash(state: boolean = true) {
        this.toggleClass(this._buttonCashPayment, 'button_alt-active', state);
    }

    togglePaymentMethod(selectedPayment: string) {
        const isCardActive = this._buttonOnlinePayment.classList.contains('button_alt-active');
        const isCashActive = this._buttonCashPayment.classList.contains('button_alt-active');

        if (selectedPayment === 'card') {
            this.toggleCard(!isCardActive);
            this.payment = isCardActive ? null : 'card';
            if (!isCardActive) this.toggleCash(false);
        } else if (selectedPayment === 'cash') {
            this.toggleCash(!isCashActive);
            this.payment = isCashActive ? null : 'cash';
            if (!isCashActive) this.toggleCard(false);
        }
    }

    resetPaymentButtons() {
        this.toggleCard(false);
        this.toggleCash(false);
    }

    set address(value: string) {
        this._inputAddress.value = value;
    }

    set payment(value: string) {
        this.events.emit(Events.SET_PAYMENT_TYPE, { paymentType: value });
    }
}

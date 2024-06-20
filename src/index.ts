import './scss/styles.scss';
import {EventEmitter} from "./components/base/Events";
import {API_URL, CDN_URL} from "./utils/constants";
import {WebLarekApi} from './components/WebLarekApi';
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {AppData, ProductsChangeEvent} from "./components/AppData";
import {PageView} from "./components/PageView";
import {ProductInBasketView, ProductView, ProductViewModal} from "./components/Product";
import {Events, IOrder, IProduct} from "./types";
import {Modal} from "./components/common/Modal";
import {BasketView} from "./components/BasketView";
import {OrderForm} from "./components/OrderForm";
import {ContactsForm} from "./components/ContactsForm";
import {SuccessView} from "./components/SuccessView";

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productInBasket = ensureElement<HTMLTemplateElement>('#card-basket');
const orderTemplate = ensureElement<HTMLTemplateElement>('#order');
const contactsTemplate = ensureElement<HTMLTemplateElement>('#contacts');
const successOrderTemplate = ensureElement<HTMLTemplateElement>('#success');

// Модель данных приложения
const appData = new AppData({}, events, [], [], {
    email: '',
    phone: '',
    payment: null,
    address: '',
    total: 0,
    items: []
});

// Контейнеры
const pageView = new PageView(document.body, events);
const basketView = new BasketView(cloneTemplate(basketTemplate), events);
const orderForm = new OrderForm(cloneTemplate(orderTemplate), events);
const contactsForm = new ContactsForm(cloneTemplate(contactsTemplate), events);
const successView = new SuccessView(cloneTemplate(successOrderTemplate), {
    onClick: () => {
        modal.close();
        events.emit(Events.ORDER_CLEAR);
    },
});

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//Изменились продукты на главной странице
events.on<ProductsChangeEvent>(Events.PRODUCTS_CHANGED, () => {
    pageView.basketCounter = appData.getBasket().length;
    pageView.products = appData.getProducts().map(item => {
        const product = new ProductView(cloneTemplate(cardCatalogTemplate), {
            onClick: () => {
                events.emit(Events.PRODUCT_OPEN_IN_MODAL, item);
            }
        });
        return product.render({
            id: item.id,
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            price: item.price ? `${item.price} синапсов` : 'Бесценно'
        });
    });
});

// Открыть товар в модальном окне
events.on(Events.PRODUCT_OPEN_IN_MODAL, (product: IProduct) => {
    const card = new ProductViewModal(cloneTemplate(productModal), {
        onClick: () => events.emit(Events.ADD_PRODUCT_TO_BASKET, product),
    });

    modal.render({
        content: card.render({
            title: product.title,
            image: CDN_URL + product.image,
            category: product.category,
            description: product.description,
            price: product.price ? `${product.price} синапсов` : '',
            status: product.price === null || appData.getBasket().some(item => item === product)
        }),
    });
});

// Блокируем прокрутку страницы если открыта модалка
events.on(Events.MODAL_OPEN, () => {
    pageView.locked = true;
});

// Разблокируем прокрутку страницы если закрыли модалку
events.on(Events.MODAL_CLOSE, () => {
    pageView.locked = false;
});

// Добавляем продукт в корзину
events.on(Events.ADD_PRODUCT_TO_BASKET, (product: IProduct) => {
    appData.addProductToBasket(product);
    pageView.basketCounter = appData.getBasket().length
    modal.close();
});

// Открываем корзину
events.on(Events.BASKET_OPEN, () => {
    const products = appData.getBasket().map((item, index) => {
        const product = new ProductInBasketView(cloneTemplate(productInBasket), {
            onClick: () => events.emit(Events.REMOVE_PRODUCT_FROM_BASKET, item)
        });
        return product.render({
            index: index + 1,
            id: item.id,
            title: item.title,
            price: item.price
        });
    });
    modal.render({
        content: createElement<HTMLElement>('div', {}, [
            basketView.render({
                products,
                total: appData.getTotalPrice()
            })
        ])
    });
});

//Удаляем продукт из корзины
events.on(Events.REMOVE_PRODUCT_FROM_BASKET, (product: IProduct) => {
    appData.removeProductFromBasket(product);
    pageView.basketCounter = appData.getBasket().length
});

//Начинаем оформление заказа
events.on(Events.ORDER_START, () => {
    if (!appData.isFirstFormFill()) {
        const data = {
            address: ''
        };
        modal.render({
            content: orderForm.render({
                valid: false,
                errors: [],
                ...data
            })
        });
    } else {
        const data = {
            phone: '',
            email: ''
        };
        modal.render({
            content: contactsForm.render({
                valid: false,
                errors: [],
                ...data
            }),
        });
    }
});

events.on(Events.SET_PAYMENT_TYPE, (data: { paymentType: string }) => {
    appData.setOrderField("payment", data.paymentType);
});

// Изменилось одно из полей
events.on(/(^order|^contacts)\..*:change/,
    (data: { field: keyof Omit<IOrder, 'items' | 'total'>; value: string }) => {
        appData.setOrderField(data.field, data.value);
    }
);

// Изменилось состояние валидации формы
events.on(Events.FORM_ERRORS_CHANGED, (errors: Partial<IOrder>) => {
    const { email, phone, address, payment } = errors;
    orderForm.valid = !address && !payment;
    orderForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');

    contactsForm.valid = !email && !phone;
    contactsForm.errors = Object.values(errors)
        .filter((i) => !!i)
        .join(', ');
});

// Отправлена форма заказа
events.on(/(^order|^contacts):submit/, () => {
    if (!appData.getOrder().email || !appData.getOrder().address || !appData.getOrder().phone){
        return events.emit(Events.ORDER_START);
    }

    const products = appData.getBasket();

    api
        .createOrder({
            ...appData.getOrder(),
            items: products.map(product => product.id),
            total: appData.getTotalPrice(),
        })
        .then((result) => {
            modal.render({
                content: successView.render({
                    title: !result.error ? 'Заказ оформлен' : 'Ошибка оформления заказа',
                    description: !result.error ? `Списано ${result.total} синапсов` : result.error,
                }),
            });
        })
        .catch(console.error);
});

// Очистить заказ и корзину
events.on(Events.ORDER_CLEAR, () => {
    appData.clearBasket();
    appData.clearOrder();
    orderForm.resetPaymentButtons();
});

// Получаем продукты с сервера
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(err => {
        console.error(err);
    });
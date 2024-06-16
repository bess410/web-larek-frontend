import './scss/styles.scss';
import {EventEmitter} from "./components/base/Events";
import {API_URL, CDN_URL} from "./utils/constants";
import {WebLarekApi} from './components/WebLarekApi';
import {cloneTemplate, createElement, ensureElement} from "./utils/utils";
import {AppData, ProductsChangeEvent} from "./components/AppData";
import {Page} from "./components/Page";
import {ProductInBasketView, ProductView, ProductViewModal} from "./components/Product";
import {Events, IProduct} from "./types";
import {Modal} from "./components/base/Modal";
import {BasketView} from "./components/BasketView";

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');
const basketTemplate = ensureElement<HTMLTemplateElement>('#basket');
const productInBasket = ensureElement<HTMLTemplateElement>('#card-basket');

// Модель данных приложения
const appData = new AppData({}, events, [], [], null);

// Глобальные контейнеры
const page = new Page(document.body, events);

const basket = new BasketView(cloneTemplate(basketTemplate), events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//Изменились продукты на главной странице
events.on<ProductsChangeEvent>(Events.PRODUCTS_CHANGED, () => {
    page.products = appData.getProducts().map(item => {
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
    page.locked = true;
});

// Разблокируем прокрутку страницы если закрыли модалку
events.on(Events.MODAL_CLOSE, () => {
    page.locked = false;
});

// Добавляем продукт в корзину
events.on(Events.ADD_PRODUCT_TO_BASKET, (product: IProduct) => {
    appData.addProductToBasket(product);
    page.basketCounter = appData.getBasket().length
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
            basket.render({
                products,
                total: appData.getTotalPrice()
            })
        ])
    });
});

// Получаем продукты с сервера
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(err => {
        console.error(err);
    });
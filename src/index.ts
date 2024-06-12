import './scss/styles.scss';
import {EventEmitter} from "./components/base/Events";
import {API_URL, CDN_URL} from "./utils/constants";
import {WebLarekApi} from './components/WebLarekApi';
import {cloneTemplate, ensureElement} from "./utils/utils";
import {AppData, ProductsChangeEvent} from "./components/AppData";
import {Page} from "./components/Page";
import {ProductView, ProductViewModal} from "./components/Product";
import {Events, IProduct} from "./types";
import {Modal} from "./components/base/Modal";

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');
const modal = new Modal(ensureElement<HTMLElement>('#modal-container'), events);
const productModal = ensureElement<HTMLTemplateElement>('#card-preview');

// Модель данных приложения
const appData = new AppData({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);

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
events.on(Events.PRODUCT_OPEN_IN_MODAL, (item: IProduct) => {
    const card = new ProductViewModal(cloneTemplate(productModal), {
        onClick: () => events.emit(Events.ADD_PRODUCT_TO_BASKET, item),
    });

    modal.render({
        content: card.render({
            title: item.title,
            image: CDN_URL + item.image,
            category: item.category,
            description: item.description,
            price: item.price ? `${item.price} синапсов` : 'Бесценно'
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

// Получаем продукты с сервера
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(err => {
        console.error(err);
    });
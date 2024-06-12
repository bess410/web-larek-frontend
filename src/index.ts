import './scss/styles.scss';
import {EventEmitter} from "./components/base/Events";
import {API_URL, CDN_URL} from "./utils/constants";
import {WebLarekApi} from './components/WebLarekApi';
import {cloneTemplate, ensureElement} from "./utils/utils";
import {AppData, ProductsChangeEvent} from "./components/AppData";
import {Page} from "./components/Page";
import {ProductView} from "./components/Product";

const events = new EventEmitter();
const api = new WebLarekApi(CDN_URL, API_URL);

// Все шаблоны
const cardCatalogTemplate = ensureElement<HTMLTemplateElement>('#card-catalog');

// Модель данных приложения
const appData = new AppData({}, events);

// Глобальные контейнеры
const page = new Page(document.body, events);

// Дальше идет бизнес-логика
// Поймали событие, сделали что нужно

//Изменились продукты на главной странице
events.on<ProductsChangeEvent>('products:changed', () => {
    page.products = appData.getProducts().map(item => {
        const product = new ProductView(cloneTemplate(cardCatalogTemplate), {
            onClick: () => {
                events.emit('product:select', item);
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
})

// Получаем продукты с сервера
api.getProducts()
    .then(data => appData.setProducts(data.items))
    .catch(err => {
        console.error(err);
    });
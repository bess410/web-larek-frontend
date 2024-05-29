# Проектная работа "Веб-ларек"

Стек: HTML, SCSS, TS, Webpack

Структура проекта:

- src/ — исходные файлы проекта
- src/components/ — папка с JS компонентами
- src/components/base/ — папка с базовым кодом

Важные файлы:

- src/pages/index.html — HTML-файл главной страницы
- src/types/index.ts — файл с типами
- src/index.ts — точка входа приложения
- src/styles/styles.scss — корневой файл стилей
- src/utils/constants.ts — файл с константами
- src/utils/utils.ts — файл с утилитами

## Установка и запуск

Для установки и запуска проекта необходимо выполнить команды

```
npm install
npm run start
```

или

```
yarn
yarn start
```

## Сборка

```
npm run build
```

или

```
yarn build
```

## Данные и типы данных, используемые в приложении

Продукт

```
export interface IProduct {
    id: string
    description: string
    image: string
    title: string
    category: ProductCategory
    price: number | null
}
```

Категория продукта

```
type ProductCategory = "софт-скил" | "другое" | "дополнительное" | "кнопка" | "хард-скил"
```

Заказ

```
export interface IOrder {
    payment: OrderPayment
    email: string
    phone: string
    address: string
    total: number
    items: IProduct[]
}
```

Тип оплаты

```
type OrderPayment = "online" | "cash"
```

Отображение продукта на главной странице

```
type TProduct = Omit<IProduct, "description">
```

Отображение продукта в корзине

```
type TBasketProduct = Pick<ProductView, "id" | "title" | "price">
```

Результат заказа

```
export interface IOrderResult {
    id: string
    total: number
}
```

Тип открытого модального окна

```
type AppStateModal = "product" | "basket" | "order"
```

## Архитектура приложения

Код приложения разделен на слои согласно парадигме MVP:

- слой представления, отвечает за отображение данных на странице,
- слой данныхб отвечает за хранение и изменение данных
- презентер, отвечает за связ представления и данных.

### Базовый код

#### Класс Api

Содержит в себе базовую логику отправки запросов. В конструктор передается базовый адрес сервера и опциональный объект с
заголовками запросов.
Методы:

- `get` - выполняет GET запрос на переданный в параметрах ендпоинт и возвращает промис с объектом, которым ответил
  сервер
- `post` - принимает объект с данными, которые будут переданы в JSON в теле запроса, и отправляет эти данные на ендпоинт
  переданный как параметр при вызове метода. По умолчанию выполняется `POST` запрос, но метод запроса может быть
  переопределен заданием третьего параметра при вызове.

#### Класс EventEmitter

Брокер событий позволяет отправлять события и подписываться на события, происходящие в системе. Класс используется в
презентере для обработки событий и в слоях приложения для генерации событий.  
Основные методы, реализуемые классом описаны интерфейсом `IEvents`:

- `on` - подписка на событие
- `emit` - инициализация события
- `trigger` - возвращает функцию, при вызове которой инициализируется требуемое в параметрах событие

### Слой данных

#### Класс AppData

Класс отвечает за хранение данных приложения \
Конструктор класса принимает экземпляр брокера событий \
Все поля приватные, доступ через методы \
В полях класса хранятся следующие данные:

- products: TProduct[] - массив объектов продуктов (товаров)
- selectedProduct: string | null - id товара для отображения в модальном окне
- basket: TBasketProduct[] - массив товаров в корзине
- openedModal: AppStateModal | null - тип открытого модального окна
- orderFields: Record<keyof IOrder, [value:string, error:string]> | null - поля формы (ключ, значение, сообщение об ошибке)
- buttonActive: boolean - активна ли кнопка на форме
- events: IEvents - экземпляр `EventEmitter` для инициации событий при изменении данных

Также класс предоставляет набор методов для взаимодействия с этими данными.

- loadProducts: () => Promise<void> - получаем товары для главной страницы, вызывает событие изменения массива продуктов
- selectProduct: (id: string) => IProduct - выбор продукта для отображения в модальном окне, вызывает событие открытия
  модального окна с типом `product`
- addProductToBasket: (id: string) => void - добавление товара в корзину, вызывает событие изменения массива товаров
  в корзине, пересчета стоимости всех товаров
- removeProductFromBasket: (id: string) => void - удаление товара из корзины, вызывает событие изменения массива товаров
  в корзине, пересчета стоимости всех товаров
- orderProducts: () => Promise<IOrderResult> - заказать товары из корзины, вызывает событие открытия
  модального окна с типом `order`
- openModal: (modal: AppStateModal) => void - открытие модального окна с заданным типом, вызывает событие изменения
  переменной `openedModal`
- closeModal: () => void - закрытие модального окна, вызывает событие изменения переменной `openedModal`
- getBasketTotal: () => number | null - получение суммы товаров в корзине
- checkOrderValidation: (data: Record<keyof IOrder, string>) => boolean - валидация полей заказа, вызывает событие
  отображения ошибки валидации
- геттеры и сеттеры, там где они необходимы

### Классы представлений

#### Класс Modal - общий класс для модальных окон
```
abstract class Modal {
  close()
}
```

#### Класс BasketView - отображение корзины в модальном окне
```
class BasketView extends Modal {
  private template: HTMLElement
  private basket: TBasketProduct[]
  private total: number | null
  
  order();
  removeProduct(id: string);
}
```
#### Класс ShortBasketView - отображение закрытой корзины
```
class ShortBasketView {
  private template: HTMLElement
  private total: number | null
  
  openModal()
}
```

#### Класс ProductView - отображение продукта на главной странице
```
class ProductView {
  private template: HTMLElement
  private product: TProduct
  
  openModal()
}
```

#### Класс ProductViewModal - отображение продукта в модальном окне
```
class ProductModalView extends Modal {
  private template: HTMLElement
  private product: IProduct
}
```

#### Класс OrderFormView - отображение формы заказа
```
class OrderFormView extends Modal {
  private template: HTMLElement
  private orderFields: Record<keyof IOrder, [value:string, error:string]> | null
  
  isButtonActive()
}
```

#### Класс OrderResultView - отображение результата заказа
```
class OrderResultView extends Modal {
  private template: HTMLElement
  private total: number
}
```
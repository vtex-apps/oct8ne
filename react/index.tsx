import { canUseDOM } from "vtex.render-runtime";

import {
  PixelMessage,
  UserData,
  CartChangedData,
  ProductViewData,
  CartItem,
} from "./typings/events";

let log = console.log
let notCapturedEvents: PixelMessage[] = [];
let scriptLoaded = false;

export function handleEvents(e: PixelMessage) {
  if (scriptLoaded === false) {
    notCapturedEvents.push(e);
    return;
  }

  switch (e.data.eventName) {
    case "vtex:pageView":
      pageView();
      break;

    case "vtex:productView":
      productView(e.data);
      break;

    case "vtex:cartChanged":
      cartChanged(e.data);
      break;

    case "vtex:userData":
      userData(e.data);
      break;

    default: {
      break;
    }
  }
}

function mapCustomerCart(items: CartItem[]) {
  const customerCart = items.map((item) => ({
    internalId: item.productId,
    title: item.name,
    formattedPrice: (item.price / 100).toString(),
    formattedPrevPrice: (item.price / 100).toString(),
    productUrl: window.location.href + item.detailUrl,
    thumbnail: item.imageUrl,
    qty: item.quantity,
  }));

  return customerCart;
}

// Event callbacks
function pageView() {
  log("executing pageview");
  window.oct8ne.restart();
  log("oct8ne restart executed");
}

function productView(data: ProductViewData) {
  log("productView executing 2");
  const productId = data.product.productId;
  const firstItemImage = data.product.items[0].imageUrl;

  window.oct8ne.currentProduct = {
    id: productId,
    thumbnail: firstItemImage,
  };
  window.oct8ne.restart();
  log("product view executed");
}

function cartChanged(data: CartChangedData) {
  log("Executing addToCart");

  // Map items
  var oct8neItems = data.items.map((item) => ({
    internalId: item.productId,
    title: item.name,
    qty: item.quantity,
    price: (item.price / 100).toString(),
  }));

  // Map root
  let price = 0;
  data.items.forEach(function (x) {
    price = price + x.price;
  });

  let totalItems = 0;
  data.items.forEach(function (x) {
    totalItems = totalItems + x.quantity;
  });

  var finalPrice = price;
  var currency = data.currency;
  var cart = oct8neItems;

  // Final ojbect for cart cand customer cart
  var ret = {
    price: price,
    finalPrice: finalPrice,
    currency: currency,
    totalItems: totalItems,
    cart: cart,
  };
  window.oct8neVtex.cart = ret;
  window.oct8neVtex.customerCart = mapCustomerCart(data.items);
  runUserDataEvent();
  log("Executed addToCart - Run user data event");
}

function userData(data: UserData) {
  log("executing userdata");
  window.oct8ne.options = { vtexioInfo: { customerInfo: null } };
  if (data === undefined || data.isAuthenticated === false) return;

  const id = data.id;
  const firstName = data.firstName !== undefined ? data.firstName : data.email;
  const lastName = data.lastName !== undefined ? data.lastName : data.email;
  const email = data.email;
  const wishList = null;
  const cart = window.oct8neVtex.customerCart;

  const ret = {
    id: id,
    firstName: firstName,
    lastName: lastName,
    email: email,
    wishList: wishList,
    cart: cart,
  };
  window.oct8ne.options.vtexioInfo.customerInfo = ret;
  log("executed userdata");
}

function runUserDataEvent() {
  const userDataEvent = notCapturedEvents.find(
    (event) => event.data.eventName === "vtex:userData"
  );

  if (userDataEvent) {
    userData(userDataEvent.data as UserData);
  }
}

if (canUseDOM) {
  // Listen to message events
  window.addEventListener("message", handleEvents);

  // Callback : when oct8ne script is loaded
  const onOct8neScriptLoaded = function () {

    scriptLoaded = true;
    log = window.oct8neVtex.log;

    // Run user data event first time script is loaded
    runUserDataEvent();
  };

  // Lets check every some interval if oct8ne script is loaded
  let oct8neScriptCheckTimeoutInMilliseconds = 10000; // 10s
  let timeCountInMilliseconds = 0;
  let intervalInMilliseconds = 100;

  let oct8neScriptCheckInterval = setInterval(function () {
    // Do not continue if timeout was reached
    if (timeCountInMilliseconds > oct8neScriptCheckTimeoutInMilliseconds){
      clearInterval(oct8neScriptCheckInterval);
      return;
    }

    // Count time
    timeCountInMilliseconds = timeCountInMilliseconds + intervalInMilliseconds;

    // Do not continue if oct8ne script was not appended
    const oct8neScript = document.getElementById("oct8neScript");
    if (!oct8neScript) return;

    // Clear interval and run callback when oct8ne script is loaded
    clearInterval(oct8neScriptCheckInterval);
    oct8neScript.onload = function () {
      onOct8neScriptLoaded();
    };
  }, 100);
}

import {cart, removeFromCart, calculateCartQuantity, updateQuantity, updateDeliveryOption} from '../../data/cart.js'
import {products, getProduct} from '../../data/products.js'
import {formatCurrency} from '../utils/money.js'; //every time it has to start with ./ for modules
import {deliveryOptions, getDeliveryOption} from '../../data/deliveryOptions.js'
import dayjs from 'https://unpkg.com/dayjs@1.11.10/esm/index.js' //ESM Version


export function renderOrderSummary(){
  //Checkout Items
  let cartSummaryHTML = '';

  cart.forEach((cartItem) => {

    const productId = cartItem.productId;
    const matchingProduct = getProduct(productId);

    const deliveryOptionId = cartItem.deliveryOptionId;
    let deliveryOption = getDeliveryOption(deliveryOptionId);

    const today = dayjs();
      const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
      );
    const dateString = deliveryDate.format('dddd, MMMM D');

    cartSummaryHTML += `
    <div class="cart-item-container
      js-cart-item-container-${matchingProduct.id}">
      <div class="delivery-date">
        Delivery date: ${dateString}
      </div>

      <div class="cart-item-details-grid">
        <img class="product-image" src="${matchingProduct.image}">

        <div class="cart-item-details">
          <div class="product-name">
            ${matchingProduct.name}
          </div>
          <div class="product-price">
            $${formatCurrency(matchingProduct.priceCents)}
          </div>
          <div class="product-quantity">
            <span>
              Quantity: <span class="quantity-label js-quantity-label">${cartItem.quantity}</span>
            </span>
            <span class="update-quantity-link link-primary js-update-link" data-product-id="${matchingProduct.id}">
              Update
            </span>
            <input class = "quantity-input js-quantity-input">
            <span class="save-quantity-link  link-primary js-save-link" data-product-id="${matchingProduct.id}"> Save </span> 
            <span class="delete-quantity-link link-primary js-delete-link" data-product-id="${matchingProduct.id}"> 
              Delete
            </span>
          </div>
        </div>

        <div class="delivery-options">
          <div class="delivery-options-title">
            Choose a delivery option:
          </div>
          ${deliveryOptionsHTML(matchingProduct, cartItem)}
        </div>
      </div>
    </div>

    `
  });


function deliveryOptionsHTML(matchingProduct, cartItem){

    let html = '';

    deliveryOptions.forEach((deliveryOption) => {
      const today = dayjs();
      const deliveryDate = today.add(
        deliveryOption.deliveryDays,
        'days'
      );
      const dateString = deliveryDate.format('dddd, MMMM D');
      const priceString = 
        (deliveryOption.priceCents === 0) 
        ? 'FREE' 
        : `$${formatCurrency(deliveryOption.priceCents)} -`;

      const isChecked = 
        deliveryOption.id === cartItem.deliveryOptionId;

      html += 
      ` <div class="delivery-option js-delivery-option"
          data-product-id = "${matchingProduct.id}"
          data-delivery-option-id = "${deliveryOption.id}">
          <input type="radio" 
            ${isChecked ? 'checked': ''}
            class="delivery-option-input" 
            name="delivery-option-${matchingProduct.id}">
          <div>
            <div class="delivery-option-date">
              ${dateString}
            </div>
            <div class="delivery-option-price">
              ${priceString} Shipping
            </div>
          </div>
        </div>
        `
    });
    return html;
  }

  updateCheckoutItems();

  document.querySelector('.js-order-summary')
    .innerHTML = cartSummaryHTML;

    document.querySelectorAll('.js-delete-link').forEach((link) => {
      link.addEventListener('click', () => {
        const productID = link.dataset.productId;
        removeFromCart(productID);

        //Remove Product from Page
        const container = document.querySelector(`.js-cart-item-container-${productID}`);
        container.remove();
        updateCheckoutItems();

      });
    }) 


    document.querySelectorAll('.js-update-link').forEach((link) => {
      link.addEventListener('click', () => {
        const productID = link.dataset.productId;
        const container = document.querySelector(`.js-cart-item-container-${productID}`);
        container.classList.add('is-editing-quantity');
      });
    }) 

    //Save New Quantity with Click
    document.querySelectorAll('.js-save-link').forEach((link) => {
      link.addEventListener('click', () => {
        const productID = link.dataset.productId;
        const container = document.querySelector(`.js-cart-item-container-${productID}`);
        container.classList.remove('is-editing-quantity');
    
        const input = container.querySelector('.js-quantity-input');
        const newQuantity = Number(input.value);

        if(newQuantity >= 0 && newQuantity <= 1000){
        updateQuantity(productID, newQuantity);
        const quantityLabel = container.querySelector('.js-quantity-label');
        quantityLabel.innerHTML = newQuantity;
        updateCheckoutItems();
        } else alert("The input quantity is high or invalid.");

      });
      
    });

    //Save New Quantity with Enter Key
    document.querySelectorAll('.js-quantity-input').forEach((input) => {
      input.addEventListener('keydown', (event) => {
        if (event.key === 'Enter') { // Check if the Enter key was pressed
          const container = input.closest('.cart-item-container'); // Find the parent container
          const productID = container.querySelector('.js-save-link').dataset.productId;
          const newQuantity = Number(input.value);
    
          if(newQuantity >= 0 && newQuantity <= 1000){
            updateQuantity(productID, newQuantity);
            
            const quantityLabel = container.querySelector('.js-quantity-label');
            quantityLabel.innerHTML = newQuantity;
            
            updateCheckoutItems();
            } else alert("The input quantity is high or invalid.");
        }
      });
    });
    

    function updateCheckoutItems(){
      document.querySelector('.js-checkout-items').innerHTML = calculateCartQuantity();
    }

    document.querySelectorAll('.js-delivery-option')
      .forEach((element) => {
        element.addEventListener('click', () => {
          const {productId, deliveryOptionId} = element.dataset;
          updateDeliveryOption(productId, deliveryOptionId);
          renderOrderSummary();
        });
    });
}


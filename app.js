$(document).ready(function () {
    const cartItems = [];
    const $cartItemsList = $('#cart-items');
    const $emptyCartMessage = $('.empty-cart-message');
    const $cartTotal = $('#cart-total');
    const $totalAmount = $('#total-amount');
    const $checkoutBtn = $('#checkout-btn');
    const $receiptModal = $('#receipt-modal')[0]; // still need vanilla for <dialog>
    const $receiptItemsList = $('#receipt-items');
    const $receiptTotal = $('#receipt-total');
    const $filterButtons = $('.filter-btn');
    const $menuItems = $('.menu-item');

    $('.add-to-cart').on('click', function () {
        const name = $(this).data('name');
        const price = $(this).data('price');
        const numericPrice = parseInt(price.replace('₱', ''));

        const existingItem = cartItems.find(item => item.name === name);
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cartItems.push({ name, price: numericPrice, quantity: 1 });
        }

        updateCartUI();

        // Show notification
        $('#add-notification').fadeIn(200).delay(1000).fadeOut(500);
    });

    function updateCartUI() {
        $cartItemsList.empty();
        let total = 0;

        cartItems.forEach(item => {
            const $li = $(`
                <li class="py-4 flex justify-between items-center">
                    <div>
                        <h4 class="font-semibold">${item.name}</h4>
                        <span class="text-gray-600">₱${item.price} x ${item.quantity}</span>
                    </div>
                    <div class="flex items-center gap-2">
                        <button class="text-2xl text-red-500 hover:text-red-700 decrease-item" data-name="${item.name}">-</button>
                        <button class="text-2xl text-green-500 hover:text-green-700 increase-item" data-name="${item.name}">+</button>
                        <button class="text-2xl text-red-500 hover:text-red-700 remove-item" data-name="${item.name}">×</button>
                    </div>
                </li>
            `);
            $cartItemsList.append($li);
            total += item.price * item.quantity;
        });

        $totalAmount.text(`₱${total}`);
        $receiptTotal.text(`₱${total}`);

        if (cartItems.length > 0) {
            $emptyCartMessage.addClass('hidden');
            $cartItemsList.removeClass('hidden');
            $cartTotal.removeClass('hidden');
            $checkoutBtn.removeClass('hidden');
        } else {
            $emptyCartMessage.removeClass('hidden');
            $cartItemsList.addClass('hidden');
            $cartTotal.addClass('hidden');
            $checkoutBtn.addClass('hidden');
        }

        // Bind new events
        $('.decrease-item').on('click', function () {
            const name = $(this).data('name');
            const item = cartItems.find(item => item.name === name);
            if (item.quantity > 1) {
                item.quantity -= 1;
            } else {
                cartItems.splice(cartItems.indexOf(item), 1);
            }
            updateCartUI();
        });

        $('.increase-item').on('click', function () {
            const name = $(this).data('name');
            const item = cartItems.find(item => item.name === name);
            item.quantity += 1;
            updateCartUI();
        });

        $('.remove-item').on('click', function () {
            const name = $(this).data('name');
            const item = cartItems.find(item => item.name === name);
            cartItems.splice(cartItems.indexOf(item), 1);
            updateCartUI();
        });
    }

    $checkoutBtn.on('click', function () {
        // ✅ Reliable total calculation
        const total = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

        const moneyInput = prompt(`Your total is ₱${total}. Enter your money:`);
        if (moneyInput === null) return;

        const money = parseInt(moneyInput);
        if (isNaN(money)) {
            alert('Please enter a valid amount.');
            return;
        }

        if (money < total) {
            alert('Not enough money. Please add more funds.');
            return;
        }

        $receiptItemsList.empty();
        cartItems.forEach(item => {
            const $li = $(`
                <li class="py-3">
                    <div class="flex justify-between">
                        <span>${item.name} x ${item.quantity}</span>
                        <span>₱${item.price * item.quantity}</span>
                    </div>
                </li>
            `);
            $receiptItemsList.append($li);
        });

        const change = money - total;
        const $totalElement = $(`
            <li class="py-3 border-t border-gray-200">
                <div class="flex justify-between font-bold">
                    <span>Total:</span>
                    <span>₱${total}</span>
                </div>
                <div class="flex justify-between">
                    <span>Money Received:</span>
                    <span>₱${money}</span>
                </div>
                <div class="flex justify-between font-bold text-green-600">
                    <span>Change:</span>
                    <span>₱${change}</span>
                </div>
            </li>
        `);
        $receiptItemsList.append($totalElement);

        // ✅ Also update the receipt-total span
        $receiptTotal.text(`₱${total}`);

        $receiptModal.showModal();

        cartItems.length = 0;
        updateCartUI();
    });



    $filterButtons.on('click', function () {
        $filterButtons.removeClass('active');
        $(this).addClass('active');

        const category = $(this).data('category');
        $menuItems.each(function () {
            const $item = $(this);
            const itemCategory = $item.data('category');

            if (category === 'all' || itemCategory === category) {
                $item.removeClass('hidden');
            } else {
                $item.addClass('hidden');
            }
        });
    });

    $(document).on('click', function (e) {
        if (e.target === $receiptModal) {
            $receiptModal.close();
            cartItems.length = 0;
            updateCartUI();
        }
    });
});

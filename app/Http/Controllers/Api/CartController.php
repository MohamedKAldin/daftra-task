<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Product;
use Illuminate\Http\Request;

class CartController extends Controller
{
    public function index(Request $request)
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        return response()->json($cart->load('items.product'));
    }

    public function addItem(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
            'quantity' => 'required|integer|min:1',
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $product = Product::findOrFail($request->product_id);

        $cartItem = $cart->items()->updateOrCreate(
            ['product_id' => $product->id],
            [
                'quantity' => $request->quantity,
                'price' => $product->price,
            ]
        );

        $this->updateCartTotal($cart);

        return response()->json($cart->load('items.product'));
    }

    public function updateItem(Request $request, CartItem $cartItem)
    {
        $request->validate([
            'quantity' => 'required|integer|min:1',
        ]);

        $cartItem->update(['quantity' => $request->quantity]);
        $this->updateCartTotal($cartItem->cart);

        return response()->json($cartItem->cart->load('items.product'));
    }

    public function removeItem(CartItem $cartItem)
    {
        $cart = $cartItem->cart;
        $cartItem->delete();
        $this->updateCartTotal($cart);

        return response()->json($cart->load('items.product'));
    }

    private function updateCartTotal(Cart $cart)
    {
        $total = $cart->items->sum(function ($item) {
            return $item->price * $item->quantity;
        });

        $cart->update(['total_amount' => $total]);
    }
} 
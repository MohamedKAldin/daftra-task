<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;

class ProductSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $products = [
            [
                'name' => 'Smartphone X',
                'description' => 'Latest smartphone with advanced features',
                'price' => 999.99,
                'stock' => 50,
                'category' => 'Electronics',
            ],
            [
                'name' => 'Laptop Pro',
                'description' => 'High-performance laptop for professionals',
                'price' => 1499.99,
                'stock' => 30,
                'category' => 'Electronics',
            ],
            [
                'name' => 'Wireless Headphones',
                'description' => 'Noise-cancelling wireless headphones',
                'price' => 199.99,
                'stock' => 100,
                'category' => 'Electronics',
            ],
            [
                'name' => 'Running Shoes',
                'description' => 'Comfortable running shoes for athletes',
                'price' => 89.99,
                'stock' => 75,
                'category' => 'Sports',
            ],
            [
                'name' => 'Yoga Mat',
                'description' => 'Premium yoga mat with carrying strap',
                'price' => 29.99,
                'stock' => 150,
                'category' => 'Sports',
            ],
            [
                'name' => 'Coffee Maker',
                'description' => 'Programmable coffee maker with thermal carafe',
                'price' => 79.99,
                'stock' => 40,
                'category' => 'Home',
            ],
            [
                'name' => 'Blender',
                'description' => 'High-speed blender for smoothies and more',
                'price' => 59.99,
                'stock' => 60,
                'category' => 'Home',
            ],
            [
                'name' => 'Desk Chair',
                'description' => 'Ergonomic office chair with lumbar support',
                'price' => 199.99,
                'stock' => 25,
                'category' => 'Furniture',
            ],
            [
                'name' => 'Bookshelf',
                'description' => 'Modern bookshelf with adjustable shelves',
                'price' => 149.99,
                'stock' => 20,
                'category' => 'Furniture',
            ],
            [
                'name' => 'Smart Watch',
                'description' => 'Fitness tracker and smartwatch with heart rate monitor',
                'price' => 249.99,
                'stock' => 45,
                'category' => 'Electronics',
            ],
        ];

        foreach ($products as $product) {
            $product['image_url'] = 'https://placehold.co/300x200?text=' . urlencode($product['name']);
            Product::create($product);
        }
    }
}

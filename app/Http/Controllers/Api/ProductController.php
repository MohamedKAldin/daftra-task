<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Product;
use Illuminate\Http\Request;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $query = Product::query();
    
        if ($request->has('search')) {
            $search = $request->search;
            $query->where(function ($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                    ->orWhere('description', 'like', "%{$search}%");
            });
        }
    
        if ($request->has('category')) {
            $query->where('category', $request->category);
        }
    
        if ($request->has('sort')) {
            $direction = $request->direction ?? 'asc';
            $query->orderBy($request->sort, $direction);
        } else {
            $query->latest();
        }
    
        // Set pagination to 6 items per page
        $perPage = 6;
        $products = $query->paginate($perPage);
    
        return response()->json([
            'data' => $products 
        ]);
    }

    public function show(Product $product)
    {
        return response()->json($product);
    }

    public function categories()
    {
        $categories = Product::distinct()->pluck('category');
        return response()->json($categories);
    }
} 
const ProductModel = require("../models/product.model");
const CategoriesModel = require("../models/category.model");
const usersModel = require("../models/user.model");
const OrderModel = require("../models/order.model");
const { ObjectId } = require("mongodb");
const ProductService = {
  //GET ALL PRODUCTS
  async getProducts(data) {
    const { keyword, isMan, isNewProduct, isPopular, category_id } = data;

    try {
      let query = {};
      if (keyword) {
        query.name = { $regex: keyword, $options: "i" };
      }
      if (isMan) {
        query.isMan = isMan;
      }
      if (isNewProduct) {
        query.isNewProduct = isNewProduct;
      }
      if (isPopular) {
        query.isPopular = isPopular;
      }
      if (category_id) {
        query.category_id = new ObjectId(category_id);
      }
      console.log("query", query);

      const products = await ProductModel.find(query);
      console.log("get product success " + products.length);
      return {
        message: "Lấy sản phẩm thành công",
        data: products,
        status: 200,
      };
    } catch (error) {
      return {
        message: "Lỗi khi lấy sản phẩm",
        status: 500,
      };
    }
  },

  //GET ALL PRODUCTS
  async getAllProducts() {
    try {
      const products = await ProductModel.find();
      return products;
    } catch (error) {
      throw new Error("Không lấy được sản phẩm");
    }
  },

  //ADD PRODUCT
  async addProducts(payload) {
    const {
      name,
      price,
      image,
      carouselImages,
      isNewProduct,
      isPopular,
      isMan,
      rating,
      category_id,
      description,
    } = payload;

    console.log("Input category_id:", category_id); // Log the input

    try {
      const newProduct = await ProductModel.create({
        name,
        price,
        isNewProduct,
        isPopular,
        isMan,
        image,
        rating,
        description,
        carouselImages,
        category_id: new ObjectId(category_id),
      });
      return newProduct;
    } catch (error) {
      console.log("error adding product", error);
      throw new Error("Không thêm được sản phẩm");
    }
  },

  // ------------------category----------------------

  //ADD CATEGORY
  async addCategory(payload) {
    const { name, image } = payload;
    try {
      const newCategory = await CategoriesModel.create({
        name,
        image,
      });
      console.log("newCategory add success");
    } catch (error) {
      console.log("error adding category", error);
      throw new Error("Không thêm được danh mục");
    }
  },
  async getCategory() {
    try {
      const category = await CategoriesModel.find();
      return category;
    } catch (error) {
      throw new Error("Không lấy được danh mục");
    }
  },
  async getCategoryByName(name) {
    try {
      const category = await CategoriesModel.findOne({ name });
      return category;
    } catch (error) {
      throw new Error("Không lấy được danh mục");
    }
  },

  async getListCategory() {
    try {
      const categories = await CategoriesModel.find();
      console.log(" List categories");
      return {
        message: "Lấy danh sách danh mục thành công",
        data: categories,
        status: 200,
      };
    } catch (error) {
      throw new Error("Không lấy được danh mục");
    }
  },

  addCart: async (payload) => {
    const { userId, productId, quantity } = payload;
    try {
      let cart = await cart.findOne({ user: userId });

      if (!cart) {
        // Nếu chưa có giỏ hàng, tạo mới
        cart = new Cart({
          user: userId,
          products: [{ productId, quantity }],
        });
      } else {
        // Nếu có rồi, kiểm tra xem sản phẩm đã có chưa
        const existingProduct = cart.products.find(
          (item) => item.productId.toString() === productId
        );

        if (existingProduct) {
          // Nếu có rồi thì cập nhật số lượng
          existingProduct.quantity += quantity;
        } else {
          // Nếu chưa có thì thêm mới
          cart.products.push({ productId, quantity });
        }
      }

      await cart.save();
      return {
        message: "Thêm sản phẩm vào giỏ hàng thành công",
        data: cart,
        status: 200,
      };
    } catch (err) {
      console.error("Error adding to cart:", err);
      return {
        message: "Lỗi khi thêm sản phẩm vào giỏ hàng",
        status: 500,
      };
    }
  },

  // Get orders
  async getOrders(user_id) {
    try {
      const orders = await OrderModel.find({ user: user_id }).populate("user");
      if (!orders || orders.length === 0) {
        throw new Error("Không tìm thấy đơn hàng");
      }

      return orders;
    } catch (err) {
      throw new Error("Không tìm thấy đơn hàng");
    }
  },

  //UPDATE PRODUCT
  async addOrder(payload) {
    const { userId, cartItems, totalPrice, shippingAddress, paymentMethod } =
      payload;
    try {
      const user = await usersModel.findById(userId);
      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }

      //create an array of product objects from the cart Items
      const products = cartItems.map((item) => ({
        name: item?.title,
        quantity: item.quantity,
        price: item.price,
        image: item?.image,
      }));

      //create a new Order
      const order = new OrderModel({
        user: userId,
        products: products,
        totalPrice: totalPrice,
        shippingAddress: shippingAddress,
        paymentMethod: paymentMethod,
      });
      await order.save();
    } catch (error) {
      console.log("error creating orders", error);
      throw new Error("Không thêm được đơn hàng");
    }
  },

  // wish list
  async addToWishlist(user_id, product_id) {
    try {
      const user = await usersModel.findById(user_id);
      if (!user) {
        throw new Error("Không tìm thấy người dùng");
      }

      const product = await ProductModel.findById(product_id);
      if (!product) {
        throw new Error("Không tìm thấy sản phẩm");
      }

      // Kiểm tra xem sản phẩm đã có trong danh sách yêu thích chưa
      const existingWishlistItem = await WishlistModel.findOne({
        user_id: user_id,
        product_id: product_id,
      });

      if (existingWishlistItem) {
        return {
          message: "Sản phẩm đã có trong danh sách yêu thích",
          status: 400,
        };
      }

      // Thêm sản phẩm vào danh sách yêu thích
      const wishlistItem = new WishlistModel({
        user_id: user_id,
        product_id: product_id,
      });
      await wishlistItem.save();

      return {
        message: "Thêm sản phẩm vào danh sách yêu thích thành công",
        status: 200,
      };
    } catch (error) {
      console.error("Error adding to wishlist:", error);
      return {
        message: "Lỗi khi thêm sản phẩm vào danh sách yêu thích",
        status: 500,
      };
    }
  },

  async removeFromWishlist(user_id, product_id) {
    try {
      const result = await WishlistModel.deleteOne({
        user_id: user_id,
        product_id: product_id,
      });
      if (result.deletedCount === 0) {
        return {
          message: "Không tìm thấy sản phẩm trong danh sách yêu thích",
          status: 404,
        };
      }
      return {
        message: "Xóa sản phẩm khỏi danh sách yêu thích thành công",
        status: 200,
      };
    } catch (error) {
      console.error("Error removing from wishlist:", error);
      return {
        message: "Lỗi khi xóa sản phẩm khỏi danh sách yêu thích",
        status: 500,
      };
    }
  },

  async getWishlist(user_id) {
    try {
      const wishlist = await WishlistModel.find({ user_id: user_id }).populate(
        "product_id"
      );
      if (!wishlist || wishlist.length === 0) {
        throw new Error("Không tìm thấy danh sách yêu thích");
      }

      return {
        message: "Lấy danh sách yêu thích thành công",
        data: wishlist,
        status: 200,
      };
    } catch (error) {
      console.error("Error getting wishlist:", error);
      return {
        message: "Lỗi khi lấy danh sách yêu thích",
        status: 500,
      };
    }
  },
};

module.exports = ProductService;

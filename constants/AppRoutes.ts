export const APP_ROUTE = {
    home: "/",
    contact: "/pages/contact",
    signup: "/pages/signup",
    signin: "/pages/signin",
    blog: "/pages/blog",
    product: "/pages/product",
    cart: "/pages/cart",
    account: "/pages/account",
    forgotPassword: "/pages/forgotpassword",
    resetPassword: "/pages/resetpassword",
    
    // Admin Routes
    adminlogin: "/pages/admin/login",
    admindashboard: "/pages/admin/dashboard",
    adminorders: "/pages/admin/orders",
    adminpayments: "/pages/admin/payments",
    adminrefunds: "/pages/admin/refunds",
    adminproducts: "/pages/admin/products",
    adminaddProduct: "/pages/admin/products/add",
    adminusers: "/pages/admin/users",
    adminreviews: "/pages/admin/reviews",
    admincms: "/pages/admin/cms",
    admincoupons: "/pages/admin/coupons",
    adminshipping: "/pages/admin/shipping",
    adminquestions: "/pages/admin/questions",
    adminsettings: "/pages/admin/settings",

    productByCategory: (category: string) => `/pages/product?category=${encodeURIComponent(category)}`,
    cartCheckoutResult: (status: "success" | "cancel", sessionId = "{CHECKOUT_SESSION_ID}") =>
        `/pages/cart?checkout=${status}&session_id=${sessionId}`,
}
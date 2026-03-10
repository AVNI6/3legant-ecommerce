export const APP_ROUTE = {
    contact: "/pages/contact",
    signup: "/pages/signup",
    signin: "/pages/signin",
    blog: "/pages/blog",
    product: "/pages/product",
    cart: "/pages/cart",
    account: "/pages/account",
    productByCategory: (category : string) => `/pages/product?category=${category}`,
}
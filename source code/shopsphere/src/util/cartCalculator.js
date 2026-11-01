export const sumCartItemSellingPrice = (items) => {
    return items.reduce((acc, item) => { return item?.sellingPrice + acc; }, 0);
};
export const sumCartItemMrpPrice = (items) => {
    return items.reduce((acc, item) => { return item?.mrpPrice + acc; }, 0);
};

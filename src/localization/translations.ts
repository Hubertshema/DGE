export type Language = 'en' | 'rw';

export const translations = {
  en: {
    // Navigation & Tabs
    tabHome: 'Home',
    tabCategories: 'Categories',
    tabSearch: 'Search',
    tabCart: 'Cart',
    tabAccount: 'Account',

    // Headers & Titles
    welcomeTitle: 'Welcome to DG',
    welcomeSubtitle: 'Rwamagana Quality Retail',
    allCategories: 'All Categories',
    featuredProducts: 'Featured Rwandan Products',
    myOrders: 'My Orders',
    orderHistory: 'Order History',
    shoppingCart: 'Shopping Cart',
    checkout: 'Checkout & Delivery',
    adminDashboard: 'DG Owner Dashboard',
    sellerDashboard: 'DG Owner Dashboard', // alias
    adminPortal: 'DG Shop Administration',

    // Categories
    allItems: 'All Items',
    catClothes: 'Clothes',
    catShoes: 'Shoes',
    catBags: 'Bags',
    catHousehold: 'Household equipment',
    catJewellery: 'Jewellery',
    catCosmetics: 'Cosmetics',
    catClothesDesc: 'Men, women, and children fashion & apparel',
    catShoesDesc: 'Casual, formal, athletic footwear and boots',
    catBagsDesc: 'Handbags, backpacks, clutches, and travel gear',
    catHouseholdDesc: 'Home appliances, kitchenware, and living essentials',
    catJewelleryDesc: 'Watches, necklaces, rings, bracelets, and accessories',
    catCosmeticsDesc: 'Skincare, beauty products, perfumes, and care',

    // Browsing & Store UI
    browseCollections: 'Browse D&G Collections',
    cartEmpty: 'Your Cart is Empty',
    cartEmptyDesc: 'Browse through our collections and discover the best items in Rwanda.',
    startShopping: 'Start Shopping',
    uniqueCount: 'items',
    checkingInventory: 'Checking for new inventory...',
    verifyingStockPrice: 'Verifying stock & price...',
    rwamaganaLocation: 'Rwamagana, Rwanda',
    unableToLoad: 'Unable to Load Products',
    tryAgain: 'Try Again',
    noItemsFound: 'No Items Found',
    noProductsListed: 'No products listed in this category right now.',
    searchPrompt: 'Enter a keyword above to search through our Rwandan inventory.',
    searchTitle: 'Search D&G Store',
    noMatchingTitle: 'No matching products',
    noMatchingDesc: 'No products found matching your search. Check spelling or try a different keyword.',
    quantity: 'Quantity',
    addedToCart: 'Added to Cart',
    productDetails: 'Product Details',
    description: 'Description',
    deliveryAddresses: 'Delivery Addresses',
    languageSettings: 'Language Settings',
    chooseLanguage: 'Hitamo Ururimi / Select Language',
    languageAppliedNote: 'Language changes apply immediately across navigation labels, order statuses, and shopping flows.',
    contactWhatsApp: 'Contact DG on WhatsApp',

    // Auth & Accounts
    signInPrompt: 'Sign in to your Account',
    signInPromptDesc: 'Please sign in to view your orders, delivery details, and account settings.',
    createAccount: 'Create Account',
    createAccountSubtitle: 'Create your shopping account',
    signInSubtitle: 'Sign in to your account',
    emailAddress: 'Email Address',
    password: 'Password',
    noAccount: "Don't have an account?",
    haveAccount: 'Already have an account?',
    register: 'Register',
    customerGuest: 'Customer',
    customerTracking: 'Tracking for',

    // Orders & Tracking
    emptyOrders: 'No orders placed yet',
    emptyOrdersDesc: 'When you place an order, it will appear here.',
    orderNumber: 'Order #',
    placedOn: 'Placed on',
    viewDetails: 'View Details',

    // Admin Features
    manageProducts: 'Manage Products',
    manageCategories: 'Manage Categories',
    manageOrders: 'Manage Orders',
    paymentVerification: 'Payment Verification',
    customersList: 'Registered Customers',
    salesReports: 'Sales Reports & Analytics',
    inventoryStock: 'Inventory Stock',
    addProduct: 'Add New Product',
    editProduct: 'Edit Product',
    deleteProduct: 'Delete Product',
    productName: 'Product Name',
    category: 'Category',
    priceRwf: 'Price (RWF)',
    stockQuantity: 'Stock Quantity',
    sku: 'SKU Code',
    brand: 'Brand',
    images: 'Images',
    addImageUrl: 'Add Image URL',
    saveProduct: 'Save Product',
    verifyPaymentAction: 'Verify Payment',
    markAsPaid: 'Confirm Payment Received',
    rejectPayment: 'Reject Payment',
    paymentUnderReview: 'Put Under Review',
    paymentNotes: 'Verification Notes',
    totalRevenue: 'Total Revenue',
    totalOrdersCount: 'Total Orders',
    paidOrders: 'Paid Orders',
    awaitingPaymentCount: 'Awaiting Payment',
    topProducts: 'Top Selling Products',
    lowStockAlerts: 'Low Stock Alert (<= 5 units)',

    // First Login & Password
    changePasswordTitle: 'Change Password Required',
    changePasswordDesc: 'As the DG shop owner, you must change your initial password before continuing.',
    currentPassword: 'Current Password',
    newPassword: 'New Password',
    confirmNewPassword: 'Confirm New Password',
    updatePasswordBtn: 'Update Password & Continue',

    // Actions
    addToCart: 'Add to Cart',
    buyNow: 'Buy Now',
    checkoutBtn: 'Proceed to Checkout',
    placeOrder: 'Place Order & Chat WhatsApp',
    signIn: 'Sign In',
    signUp: 'Create Customer Account',
    logout: 'Log Out',
    saveChanges: 'Save Changes',
    searchPlaceholder: 'Search clothes, shoes, bags, household...',
    inStock: 'In Stock',
    outOfStock: 'Out of Stock',
    stockLeft: 'left in stock',

    // Statuses
    pending: 'Pending',
    pending_confirmation: 'Pending Confirmation',
    confirmed: 'Confirmed',
    processing: 'Processing',
    shipped: 'Shipped',
    delivered: 'Delivered',
    cancelled: 'Cancelled',
    awaiting_payment: 'Awaiting Payment',
    payment_under_review: 'Payment Under Review',
    paid: 'Paid & Verified',
    payment_rejected: 'Payment Rejected',
    refunded: 'Refunded',

    // Order & Payment
    orderReference: 'Order Reference',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    totalAmount: 'Total Amount',
    deliveryInfo: 'Delivery Information',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    province: 'Province',
    district: 'District',
    sector: 'Sector',
    streetDetails: 'Street / House / Landmark',
    whatsappNotice:
      'Your order is securely saved in our database. Payment will be arranged via MTN MoMo / Airtel Money directly with DG on WhatsApp.',
    adminVerifyNotice:
      'Notice: Orders remain awaiting payment until the DG admin manually verifies your transaction.',
    languageName: 'English',
  },
  rw: {
    // Navigation & Tabs
    tabHome: 'Ahabanza',
    tabCategories: 'Ibyiciro',
    tabSearch: 'Shakisha',
    tabCart: 'Ikarita',
    tabAccount: 'Konti',

    // Headers & Titles
    welcomeTitle: 'Murakaza neza muri DG',
    welcomeSubtitle: 'Ibicuruzwa byiza i Rwamagana',
    allCategories: 'Ibyiciro Byose',
    featuredProducts: 'Ibicuruzwa byiza byo mu Rwanda',
    myOrders: 'Amategeko Yanjye',
    orderHistory: 'Amateka y’Ibyaguzwe',
    shoppingCart: 'Ikarita yo Guhaha',
    checkout: 'Kwishyura no Kohereza',
    adminDashboard: 'Ibiro by’Umuyobozi wa DG',
    sellerDashboard: 'Ibiro by’Umuyobozi wa DG', // alias
    adminPortal: 'Ubuyobozi bw’Iduka rya DG',

    // Categories
    allItems: 'Byose Hamwe',
    catClothes: 'Imyenda',
    catShoes: 'Inkweto',
    catBags: 'Amasakoshi',
    catHousehold: 'Ibikoresho byo mu nzu',
    catJewellery: 'Imikufi n’Inyerere',
    catCosmetics: 'Amavuta n’Ibirungo',
    catClothesDesc: 'Imyenda y’abagabo, abagore n’abana',
    catShoesDesc: 'Inkweto zo gusohokana, iz’akazi n’iza siporo',
    catBagsDesc: 'Amasakoshi y’intoki, ibikapu n’imifuka y’ingendo',
    catHouseholdDesc: 'Ibikoresho byo mu gikoni n’ibyo mu nzu',
    catJewelleryDesc: 'Amasaha, imikufi, impeta n’amaso yo kurimbana',
    catCosmeticsDesc: 'Amavuta yo kwisiga, imibavu n’ibirungo by’ubwiza',

    // Browsing & Store UI
    browseCollections: 'Reba ibicuruzwa byose bya DG',
    cartEmpty: 'Ikarita yawe irarangiye',
    cartEmptyDesc: 'Shakisha ibicuruzwa byiza mu Rwanda muri D&G maze ubishyire mu ikarita.',
    startShopping: 'Tangira Guhaha',
    uniqueCount: 'ibicuruzwa',
    checkingInventory: 'Gusuzuma ibicuruzwa bishya...',
    verifyingStockPrice: 'Gusuzuma ibicuruzwa n’ibiciro...',
    rwamaganaLocation: 'Rwamagana, u Rwanda',
    unableToLoad: 'Ntibishoboye gukurura ibicuruzwa',
    tryAgain: 'Ongera ugerageze',
    noItemsFound: 'Nta bicuruzwa bibonetse',
    noProductsListed: 'Nta bicuruzwa biri muri iki cyiciro muri iki gihe.',
    searchPrompt: 'Andika icyo ushaka gushakisha mu bicuruzwa byacu.',
    searchTitle: 'Shakisha muri D&G',
    noMatchingTitle: 'Nta bicuruzwa bihwanye n’ibyo ushaka',
    noMatchingDesc: 'Nta gicuruzwa cyabonetse. Gerageza gukoresha irindi jambo.',
    quantity: 'Ingano',
    addedToCart: 'Byashyizwe mu Ikarita',
    productDetails: 'Ibisobanuro by’Igicuruzwa',
    description: 'Ibisobanuro',
    deliveryAddresses: 'Aho wohereza ibicuruzwa',
    languageSettings: 'Hitamo Ururimi',
    chooseLanguage: 'Hitamo ururimi wifuza gukoresha',
    languageAppliedNote: 'Impinduka z’ururimi zihita zikoreshwa ako kanya mu bice byose by’iyi porogaramu.',
    contactWhatsApp: 'Vugana na DG kuri WhatsApp',

    // Auth & Accounts
    signInPrompt: 'Injira muri Konti yawe',
    signInPromptDesc: 'Injira kugira ngo urebe amategeko yawe, aho wohereza, n’ibigenga konti.',
    createAccount: 'Fungura Konti',
    createAccountSubtitle: 'Fungura konti yo guhaha muri DG',
    signInSubtitle: 'Injira muri konti yawe',
    emailAddress: 'Imeyili',
    password: 'Ijambobanga',
    noAccount: 'Nta konti ufite?',
    haveAccount: 'Usanzwe ufite konti?',
    register: 'Iyandikishe',
    customerGuest: 'Umukiriya',
    customerTracking: 'Igenzura rya',

    // Orders & Tracking
    emptyOrders: 'Nta tegeko uratanga',
    emptyOrdersDesc: 'Iyo utanze itegeko, rihita rigaragara hano.',
    orderNumber: 'Itegeko #',
    placedOn: 'Ryatsinzwe ku ya',
    viewDetails: 'Reba Byose',

    // Admin Features
    manageProducts: 'Gucunga Ibicuruzwa',
    manageCategories: 'Gucunga Ibyiciro',
    manageOrders: 'Gucunga Amategeko',
    paymentVerification: 'Kugenzura Ubwishyu',
    customersList: 'Abakiriya Banditse',
    salesReports: 'Raporo z’Ubucuruzi',
    inventoryStock: 'Ububiko bw’Ibicuruzwa',
    addProduct: 'Ongeramo Igicuruzwa',
    editProduct: 'Hindura Igicuruzwa',
    deleteProduct: 'Siba Igicuruzwa',
    productName: 'Izina ry’Igicuruzwa',
    category: 'Icyiciro',
    priceRwf: 'Igiciro (RWF)',
    stockQuantity: 'Umubare mu Bubiko',
    sku: 'Kode ya SKU',
    brand: 'Ikirango',
    images: 'Amafoto',
    addImageUrl: 'Ongeraho Ifoto',
    saveProduct: 'Bika Igicuruzwa',
    verifyPaymentAction: 'Emeza Ubwishyu',
    markAsPaid: 'Emeza ko Cyishyuwe',
    rejectPayment: 'Hana Ubwishyu',
    paymentUnderReview: 'Kwirinda / Gusuzuma',
    paymentNotes: 'Inyandiko z’Ubwishyu',
    totalRevenue: 'Amafaranga Yinjiye Yose',
    totalOrdersCount: 'Amategeko Yose',
    paidOrders: 'Ayishyuwe',
    awaitingPaymentCount: 'Ategerezwa Kwishyurwa',
    topProducts: 'Ibicuruzwa Byagurishijwe Cyane',
    lowStockAlerts: 'Ibicuruzwa Byenda Gushira (<= 5)',

    // First Login & Password
    changePasswordTitle: 'Guhindura Ijambobanga Birakenewe',
    changePasswordDesc: 'Nk’umuyobozi wa DG, ugomba guhindura ijambobanga ryambere mbere yo gukomeza.',
    currentPassword: 'Ijambobanga ry’Ubu',
    newPassword: 'Ijambobanga Rishya',
    confirmNewPassword: 'Subiramo Ijambobanga',
    updatePasswordBtn: 'Hindura Ijambobanga Ukomeze',

    // Actions
    addToCart: 'Shyira mu Ikarita',
    buyNow: 'Gura Ubu',
    checkoutBtn: 'Komeza ku Kwishyura',
    placeOrder: 'Tegereza no Kwishyura kuri WhatsApp',
    signIn: 'Injira',
    signUp: 'Fungura Konti y’Umukiriya',
    logout: 'Sohoka',
    saveChanges: 'Bika Impinduka',
    searchPlaceholder: 'Shakisha imyenda, inkweto, amasakoshi, ibikoresho...',
    inStock: 'Biri mu bubiko',
    outOfStock: 'Byashize mu bubiko',
    stockLeft: 'bisigaye mu bubiko',

    // Statuses
    pending: 'Gitegerejwe',
    pending_confirmation: 'Gitegereje Kwemezwa',
    confirmed: 'Cyemejwe',
    processing: 'Kiratunganywa',
    shipped: 'Cyoherejwe mu nzira',
    delivered: 'Cyagejejweho',
    cancelled: 'Cyasheshwe',
    awaiting_payment: 'Gitegereje Kwishyurwa',
    payment_under_review: 'Kwishyura kurasuzumwa',
    paid: 'Kwishyura Byemejwe',
    payment_rejected: 'Kwishyura Kwanze',
    refunded: 'Yasubijwe Umukiriya',

    // Order & Payment
    orderReference: 'Inomero y’Itegeko',
    subtotal: 'Igiteranyo cy’ibicuruzwa',
    deliveryFee: 'Amafaranga yo kugezaho',
    totalAmount: 'Igiteranyo cyose hamwe',
    deliveryInfo: 'Aho kugezwa',
    fullName: 'Amazina Yose',
    phoneNumber: 'Nimero ya Terefone',
    province: 'Intara',
    district: 'Akarere',
    sector: 'Umurenge',
    streetDetails: 'Akagari / Umudugudu / Inzu',
    whatsappNotice:
      'Itegeko ryawe ryabitswe neza mu bubiko. Kwishyura birakorwa binyuze kuri MoMo / Airtel Money kuri WhatsApp.',
    adminVerifyNotice:
      'Icyitonderwa: Itegeko riguma ritegereje kwishyurwa kugeza ubwo umuyobozi wa DG abyemeje.',
    languageName: 'Ikinyarwanda',
  },
};

export const getCategoryTranslation = (name: string, t: any): string => {
  if (!name) return '';
  const lower = name.toLowerCase().trim();
  if (lower === 'all' || lower === 'all items' || lower === 'byose hamwe') {
    return t.allItems || 'All Items';
  }
  if (lower === 'clothes' || lower === 'imyenda') return t.catClothes || 'Clothes';
  if (lower === 'shoes' || lower === 'inkweto') return t.catShoes || 'Shoes';
  if (lower === 'bags' || lower === 'amasakoshi') return t.catBags || 'Bags';
  if (lower.includes('household') || lower.includes('ibikoresho')) {
    return t.catHousehold || 'Household equipment';
  }
  if (lower.includes('jewel') || lower.includes('imikufi')) {
    return t.catJewellery || 'Jewellery';
  }
  if (lower.includes('cosmetic') || lower.includes('amavuta')) {
    return t.catCosmetics || 'Cosmetics';
  }
  return name;
};

export const getCategoryDescription = (slug: string, t: any): string => {
  if (!slug) return '';
  switch (slug) {
    case 'clothes':
      return t.catClothesDesc || 'Men, women, and children fashion & apparel';
    case 'shoes':
      return t.catShoesDesc || 'Casual, formal, athletic footwear and boots';
    case 'bags':
      return t.catBagsDesc || 'Handbags, backpacks, clutches, and travel gear';
    case 'household-equipment':
    case 'household':
      return t.catHouseholdDesc || 'Home appliances, kitchenware, and living essentials';
    case 'jewellery':
      return t.catJewelleryDesc || 'Watches, necklaces, rings, bracelets, and accessories';
    case 'cosmetics':
      return t.catCosmeticsDesc || 'Skincare, beauty products, perfumes, and care';
    default:
      return '';
  }
};

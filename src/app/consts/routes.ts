export enum routes {
  DASHBOARD = '/dashboard',
  PROFILE = '/app/profile',       
  CHANGE_PASSWORD = '/app/change-password',
  LOGIN = '/login',

  // --- CRUD module ---//

  USER_LIST = '/user/list',
  USER_ADD = '/user/add',
  ADMIN_LIST = '/user/admin/list',
  ADMIN_ADD = '/user/admin/add',

  // --- E-commerce ---//

  MANAGEMENT = '/e-commerce/management',
  PRODUCT_EDIT = '/e-commerce/edit',
  PRODUCT_CREATE = '/e-commerce/create',
  PRODUCT = '/e-commerce/product',


  // --- Content ---//

  MANAGEMENT_BLOG = '/content/management',
  BLOG_EDIT = '/content/edit',
  BLOG_CREATE = '/content/create',
  BLOG = '/content/blog',


  // --- Order ---//

  PAYMENTS_MANAGE = '/order/payments-list',
  ORDER_LIST = '/order/list',
  ORDER_DETAILS = '/order/detail',
  ORDER_STATUS_FLOW = '/order/status-flow',
  ORDER_REPORTS = '/order/reports',
  CUSTOMER_INFO = '/order/customerInfo',



  // --- discount ---//

  DISCOUNT_LIST = '/discount/list',
  DISCOUNT_PRODUCT = '/discount/product',
  DISCOUNT_BASKET = '/discount/basket',
  DISCOUNT_EDIT = '/discount/edit',
  DISCOUNT_DETAILS='/discount/detail',



  // --- footer ---//

  SITE_SETTING = '/site-settings',


  // --- Documentation ---//



  // --- Core module ---//

  TYPOGRAPHY = '/core/typography',
  COLORS = '/core/colors',
  GRID = '/core/grid',

  // --- Tables module ---//

  TABLES_BASIC = '/tables/basic',
  TABLES_DYNAMIC = '/tables/dynamic',

  // --- Ui Elements module --- //

  ICONS = '/ui/icons',
  BADGE = '/ui/badge',
  CAROUSEL = '/ui/carousel',
  CARDS = '/ui/cards',
  MODAL = '/ui/modal',
  NOTIFICATION = '/ui/notification',
  NAVBAR = '/ui/navbar',
  TOOLTIPS = '/ui/tooltips',
  TABS = '/ui/tabs',
  PAGINATION = '/ui/pagination',
  PROGRESS = '/ui/progress',
  WIDGET = '/ui/widget',

  // --- Forms module ---//

  FORMS_ELEMENTS = '/forms/elements',
  FORMS_VALIDATION = '/forms/validation',

  // --- Charts module ---//

  BAR_CHARTS = '/charts/bar',
  LINE_CHARTS = '/charts/line',
  PIE_CHARTS = '/charts/pie',
  OVERVIEW_CHARTS = '/charts/overview',

  // --- Maps module --- //

  GOOGLE_MAP = '/maps/google',
  VECTOR_MAP = '/maps/vector',

  // --- Extra module ---//

  CALENDAR = '/extra/calendar',
  INVOICE = '/extra/invoice',

}

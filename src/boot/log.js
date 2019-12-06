// import something here

// "async" is optional
export default async ({ Vue /* app, router, Vue, ... */ }) => {
  Vue.prototype.$log = console.log;
};

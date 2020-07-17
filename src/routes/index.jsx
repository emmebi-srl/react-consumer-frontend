import asyncComponent from '../components/AsyncComponent'

export const createRouteObj = ({ path = '', exact = true, component = '', ...rest }) => ({
  path,
  exact,
  component,
  ...rest,
})

export const createRoutes = store => ({
  routes: [
    createRouteObj({
      path: '/checklists',
      exact: false,
      component: asyncComponent(() => import('./Checklists').then(module => module.default(store))),
    }),
    createRouteObj({
      path: '/customers',
      exact: false,
      component: asyncComponent(() => import('./Customers').then(module => module.default(store))),
    }),
    createRouteObj({
      path: '/interventions',
      exact: false,
      component: asyncComponent(() => import('./Interventions').then(module => module.default(store))),
    }),
  ],
})

export default createRoutes

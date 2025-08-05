import { useUserStore } from '@/stores/user'
import router from './index'
import NProgress from 'nprogress'
import 'nprogress/nprogress.css'
import storage from 'store'

const whiteList = ['/user/login', '/user/register'] // 不重定向白名单

router.beforeEach(async (to, from, next) => {
  NProgress.start()

  const token = localStorage.getItem('token') || storage.get('ACCESS_TOKEN')
  const userStore = useUserStore()

  if (token) {
    // 如果有token但userStore中没有用户信息，从storage恢复
    if (!userStore.userInfo) {
      const storedUserInfo = storage.get('USER_INFO')
      if (storedUserInfo) {
        userStore.setUserInfo(storedUserInfo)
        console.log('从storage恢复用户信息:', storedUserInfo)
      }
    }

    if (whiteList.includes(to.path)) {
      // 已登录状态下访问登录/注册页面，重定向到首页
      next({ path: '/' })
    } else {
      // 检查公司页面的访问权限
      const selectedCompany = localStorage.getItem('selectedCompany') || storage.get('SELECTED_COMPANY')
      const companyRoutes = {
        '常州拓源电气集团有限公司': '/changzhou-tuoyuan-electric',
        '上海南华兰陵电气有限公司': '/shanghai-nanhua-lanling-electric', 
        '上海南华兰陵实业有限公司': '/shanghai-nanhua-lanling-industry'
      }
      
      // 如果访问的是公司页面，检查是否有权限
      const isCompanyPage = Object.values(companyRoutes).some(route => to.path.startsWith(route))
      
      if (isCompanyPage && selectedCompany) {
        const allowedRoute = companyRoutes[selectedCompany as keyof typeof companyRoutes]
        
        // 如果用户访问的不是他们选择的公司页面，重定向到正确的公司页面
        if (allowedRoute && !to.path.startsWith(allowedRoute)) {
          next({ path: allowedRoute })
          return
        }
      }
      
      // 已登录，直接通过
      next()
    }
  } else {
    if (whiteList.includes(to.path)) {
      // 未登录可以访问白名单页面
      next()
    } else {
      // 未登录且访问的不是白名单页面，重定向到登录页
      next(`/user/login?redirect=${to.path}`)
    }
  }
  NProgress.done()
})

router.afterEach(() => {
  NProgress.done()
})

import request from '@/libs/request';

export default function () {
  return request<any>({
    method: 'get',
    url: '/api',
  });
}

export const getNanhuaNewOrders = (period: string) => {
  return request({
    method: 'GET',
    url: `/api/nanhua-new-orders/${period}`
  });
};

export const getNanhuaCostCenterStructure = (period: string) => {
  return request({
    method: 'GET',
    url: `/api/nanhua-cost-center-structure/${period}`
  });
};

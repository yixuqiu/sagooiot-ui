import { get, post, del, put } from '/@/utils/request_network';

export default {
  getList: (params?: object) => get('/tunnel/list', params)
}
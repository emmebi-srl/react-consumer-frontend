import { all, call, fork, take, put } from 'redux-saga/effects'
import ariesProxy from '../../../proxies/aries-proxy'
import {actionTypes} from './ChecklistsActions'

const fetchChecklists = async _ => await ariesProxy.checklists.get({includes: 'system,customer'})
const fetchChecklistDetail = async (id) => await ariesProxy.checklists.getById({id, includes: 'system,customer,paragraphs,paragraphs.rows'})
const updateChecklist = async (id, checklist) => await ariesProxy.checklists.update({id, checklist})
const createSystemLink = async (id) => await ariesProxy.checklists.createSystemLink({id})

function* doGetChecklists() {
  yield put({type: actionTypes.CHECKLISTS_GET_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(fetchChecklists)
    yield put({type:  actionTypes.CHECKLISTS_GET_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CHECKLISTS_GET_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CHECKLISTS_GET_REQUEST,  payload: { loading: false }})
  }
}
export function * getChecklists () {
  while (true) {
    yield take(actionTypes.CHECKLISTS_GET_REQUEST, doGetChecklists)
    yield doGetChecklists()
  }
}

function* doGetChecklistDetail({id}) {
  yield put({type: actionTypes.CHECKLIST_DETAIL_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(fetchChecklistDetail, id)

    yield put({type:  actionTypes.CHECKLIST_DETAIL_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_REQUEST,  payload: { loading: false }})
  }
}
export function * getChecklistDetail () {
  while (true) {
    const request = yield take(actionTypes.CHECKLIST_DETAIL_REQUEST, doGetChecklistDetail)
    yield doGetChecklistDetail(request.payload)
  }
}

function* doRemoteUpdate({id, checklist}) {
  yield put({type: actionTypes.CHECKLIST_DETAIL_REMOTE_UPDATE_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(updateChecklist, id, checklist)

    yield put({type:  actionTypes.CHECKLIST_DETAIL_REMOTE_UPDATE_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_REMOTE_UPDATE_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_REMOTE_UPDATE_REQUEST,  payload: { loading: false }})
  }
}
export function * remoteUpdate () {
  while (true) {
    const request = yield take(actionTypes.CHECKLIST_DETAIL_REMOTE_UPDATE_REQUEST, doRemoteUpdate)
    yield doRemoteUpdate(request.payload)
  }
}

function* doCreateSystemChecklistAssoc({id}) {
  yield put({type: actionTypes.CHECKLIST_DETAIL_SYSTEM_ASSOCIATION_REQUEST, payload: { loading: true }})
  try {
    const resp = yield call(createSystemLink, id)

    yield put({type:  actionTypes.CHECKLIST_DETAIL_SYSTEM_ASSOCIATION_SUCCESS, payload: resp})
    return true;
  } catch (error) {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_SYSTEM_ASSOCIATION_FAILURE, payload: { error: error }})
  } finally {
    yield put({type:  actionTypes.CHECKLIST_DETAIL_SYSTEM_ASSOCIATION_REQUEST,  payload: { loading: false }})
  }
}
export function * createSystemChecklistAssoc () {
  while (true) {
    const request = yield take(actionTypes.CHECKLIST_DETAIL_SYSTEM_ASSOCIATION_REQUEST, doCreateSystemChecklistAssoc)
    yield doCreateSystemChecklistAssoc(request.payload)
  }
}

export default function* rootSaga() {
  yield all([
    fork(getChecklists),
    fork(getChecklistDetail),
    fork(remoteUpdate),
    fork(createSystemChecklistAssoc),
  ])
}

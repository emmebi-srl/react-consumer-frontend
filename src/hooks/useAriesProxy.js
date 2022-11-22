import ariesProxy from '../proxies/aries-proxy'

const result = [ariesProxy];
result.ariesProxy = ariesProxy;

const useAriesProxy = () => result;

export default useAriesProxy;
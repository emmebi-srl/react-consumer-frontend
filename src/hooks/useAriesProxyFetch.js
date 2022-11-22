import useAriesProxy from "./useAriesProxy";

const useAriesProxyFetch = (action) => {
    const [status, setStatus] = useState('idle');
    const [response, setResponse] = useState([]);
    const [ariesProxy] = useAriesProxy();

    useEffect(() => {
        if (!action) return;
        const fetchData = async () => {
            setStatus('fetching');
            const resp = await action(ariesProxy);
            setResponse(resp);
            setStatus('fetched');
        };

        fetchData();
    }, [ariesProxy, action]);

    return { status, response };
};

export default useAriesProxyFetch;

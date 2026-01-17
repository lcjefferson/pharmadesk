import { useState, useEffect } from 'react';

export const useFetchMock = (fn) => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let mounted = true;
        fn()
            .then(res => {
                if (mounted) setData(res);
            })
            .finally(() => {
                if (mounted) setLoading(false);
            });

        return () => { mounted = false; };
    }, [fn]);

    return { data, loading, setData };
};

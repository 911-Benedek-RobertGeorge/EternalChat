import { useState, useCallback } from 'react';

const useReRender = () => {
    const [count, setCount] = useState(0);

    const reRender = useCallback(() => {
        setCount(prev => prev + 1);
    }, []);

    return { reRender, count };
};

export default useReRender;

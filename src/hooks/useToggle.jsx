import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";

export default function useToggle({
    initialValue = false,
    onToggle = () => {},
}) {
    const [on, setOn] = useState(initialValue);

    const firstRender = useRef(true);

    const toggle = () => {
        setOn((prevOn) => !prevOn);
    };

    useEffect(() => {
        if (firstRender.current) {
            firstRender.current = false;
        } else {
            onToggle();
        }
    }, [on]);

    return [on, toggle];
}

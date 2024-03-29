import { useContext, useState, useEffect } from "react";
import { MenuContext } from "./Menu";

export default function MenuDropdown({ children, className }) {
    const { on, toggle, location } = useContext(MenuContext);
    const [showWithDelay, setShowWithDelay] = useState(false);

    useEffect(() => {
        let timeout;
        if (on) {
            timeout = setTimeout(() => {
                setShowWithDelay(true);
            }, 10);
        } else {
            setShowWithDelay(false);
        }

        return () => clearTimeout(timeout);
    }, [on]);

    return (
        on && (
            <>
                <div
                    className="menu-blur"
                    onClick={toggle}
                    style={{
                        opacity: showWithDelay ? 1 : 0,
                    }}
                ></div>
                <div
                    className={`menu-dropdown ${className}`}
                    style={{
                        opacity: showWithDelay ? 1 : 0,
                        top: location.top,
                        left: location.left,
                    }}
                >
                    {children}
                </div>
            </>
        )
    );
}

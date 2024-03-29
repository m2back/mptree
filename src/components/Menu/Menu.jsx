import { createContext, useState } from "react";
import useToggle from "../../hooks/useToggle";
const MenuContext = createContext();
export { MenuContext };
export default function Menu({
    open = false,
    onOpen,
    children,
    className,
    ...rest
}) {
    const [on, toggle] = useToggle(open, onOpen);
    const [location, setLocation] = useState({ left: 0, top: 0 });

    return (
        <MenuContext.Provider value={{ on, toggle, location, setLocation }}>
            <div {...rest} className={`menu-menu ${className}`}>
                {children}
            </div>
        </MenuContext.Provider>
    );
}

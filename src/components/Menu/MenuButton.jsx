import { useContext } from "react";
import { MenuContext } from "./Menu";

export default function MenuButton({
    children,
    className,
    onClick = () => {},
    ...rest
}) {
    const { toggle, setLocation } = useContext(MenuContext);
    return (
        <button
            {...rest}
            onClick={(e) => {
                onClick();
                toggle();
                setLocation({ left: e.clientX - 75, top: e.clientY + 5 });
            }}
            className={`menu-button button ${className}`}
        >
            {children}
        </button>
    );
}

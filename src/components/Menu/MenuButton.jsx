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
                setLocation({ left: e.clientX, top: e.clientY });
            }}
            className={`menu-button button ${className}`}
        >
            {children}
        </button>
    );
}

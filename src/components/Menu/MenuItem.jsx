import { useContext } from "react";
import { MenuContext } from "./Menu";

export default function MenuItem({
    children,
    className,
    onClick = () => {},
    ...rest
}) {
    const { toggle } = useContext(MenuContext);

    return (
        <div
            {...rest}
            onClick={() => {
                toggle();
                onClick();
            }}
            className={`menu-item button ${className}`}
        >
            {children}
        </div>
    );
}

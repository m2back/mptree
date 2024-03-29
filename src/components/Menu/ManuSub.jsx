import { useContext, useState } from "react";
import MenuDropdown from "./MenuDropdown";
import { MenuContext } from "./Menu";
import MenuItem from "./MenuItem";
export default function ManuSub({
    value,
    className,
    children,
    dropdownClassName,
    prompt,
}) {
    const { setLocation } = useContext(MenuContext);
    const [menu, setMenu] = useState();
    const handleClick = () => {
        setLocation({
            left: window.innerWidth / 2,
            top: window.innerHeight / 4,
        });
        setMenu(
            <>
                <MenuDropdown className={dropdownClassName}>
                    <MenuItem className="menu-sub-title">{prompt}</MenuItem>
                    {children}
                </MenuDropdown>
            </>
        );
    };
    return (
        <div className={`menu-item button ${className}`} onClick={handleClick}>
            {value}
            {menu}
        </div>
    );
}

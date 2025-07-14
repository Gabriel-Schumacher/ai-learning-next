"use client"; // This enables client-side interactivity
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";

function HeaderAndNav() {
    const currentPath = usePathname();
    const [navigationItems, setNavigationItems] = useState([
        {name: "Core Part of the App", path: "/", active:false, },
        {name: "Library", path: "/routes/library", active:false, },
    ]);
    const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

    const navClasses = ['bg-primary-500','text-surface-50','w-full','px-2','py-1', 'rounded','hover:bg-primary-800','transition-all','disabled:text-surface-50', 'disabled:bg-surface-950','dark:disabled:bg-surface-300','dark:disabled:text-surface-800'];

    const handleHamburgerClick = () => {
        // Handle hamburger menu click event here
        console.log("Hamburger clicked!");
        setIsHamburgerOpen(!isHamburgerOpen);
    }

    useEffect(() => {

        // Update the active state based on the current path
        setNavigationItems(prevItems =>
            prevItems.map(item => ({
            ...item,
            active: item.path === currentPath,
            }))
        );

        // Close the hamburger menu if outside is clicked
        const handleClickOutside = (event: MouseEvent) => {
            const menu = document.querySelector(".hamburger-menu");
            if (isHamburgerOpen && menu && !menu.contains(event.target as Node)) {
                setIsHamburgerOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };

    }, [isHamburgerOpen, currentPath]);

    return (
        <header className="grid bg-surface-50 dark:bg-surface-950 grid-cols-[1fr_auto] p-4 w-full place-items-center shadow">
            <div className="w-full flex items-center justify-start">
                <h1 className="h5 dark:text-surface-50">Ai Learning Project</h1>
            </div>
            <nav className="flex items-center justify-end gap-2">
                <button className="hamburger md:hidden flex flex-col justify-between h-[44px] gap-0 p-[8px] bg-primary-500 border border-solid border-transparent rounded" type="button" aria-label="Menu" onClick={() => {handleHamburgerClick()}}>
                    <svg
                        className="block h-[40px] w-[40px] text-white"
                        viewBox="0 0 100 80"
                        width="40"
                        height="40"
                        fill="currentColor"
                        aria-hidden="true"
                    >
                        <rect y="0" width="100" height="10"></rect>
                        <rect y="35" width="100" height="10"></rect>
                        <rect y="70" width="100" height="10"></rect>
                    </svg>
                </button>
                {navigationItems.map((item, index) => (
                    <Link key={index} href={item.path}>
                        <button className={item.active ? `current-menu-item ${navClasses.join(' ')}` : `${navClasses.join(' ')}`} type="button" disabled={item.active}>
                            {item.name}
                        </button>
                    </Link>
                ))}
                <div
                    className={`hamburger-menu ${isHamburgerOpen ? "translate-x-0" : "translate-x-full"} md:hidden fixed top-0 right-0 h-screen w-[200px] shadow flex flex-col items-center justify-start gap-2 bg-surface-50-950 rounded-l p-4 transition-transform duration-300 ease-in-out`}
                >
                    <div className="w-full flex items-center justify-end">
                        <button className="hamburger md:hidden flex flex-col justify-between h-[44px] gap-0 p-[8px_0] bg-surface-700 border border-solid border-transparent rounded" type="button" aria-label="Menu" onClick={() => {handleHamburgerClick()}}>
                            <svg
                                className="block h-[40px] w-[40px] text-white"
                                viewBox="0 0 100 100"
                                width="40"
                                height="40"
                                fill="currentColor"
                                aria-hidden="true"
                            >
                                <line x1="10" y1="10" x2="90" y2="90" stroke="currentColor" strokeWidth="10" />
                                <line x1="90" y1="10" x2="10" y2="90" stroke="currentColor" strokeWidth="10" />
                            </svg>
                        </button>
                    </div>
                    <hr className="hr border-t-2" />
                    {navigationItems.map((item, index) => (
                        <Link key={index} href={item.path} className="w-full">
                            <button className={item.active ? `current-menu-item ${navClasses.join(' ')}` : `${navClasses.join(' ')}`} type="button" disabled={item.active}>
                                {item.name}
                            </button>
                        </Link>
                    ))}
                </div>
            </nav>
        </header>
    )
}

export default HeaderAndNav
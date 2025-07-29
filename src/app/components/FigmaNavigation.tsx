'use client';
import { useState, useContext, useEffect} from "react";
import { DataContextProvider } from "@/app/context_providers/data_context/DataProvider";
import * as Types from "@/lib/types/types_new";
// import { INITIAL_DATA_STATE_TYPE } from "./AiContextProvider/AiDataProvider"



interface FigmaNavigationProps {
    actions?: () => void;
}

const FigmaNavigation: React.FC<FigmaNavigationProps> = () => {    
    const [currentItem, setCurrentItem] = useState<number>(1); // Default to the first item
    const context = useContext(DataContextProvider);
    if (!context) {
        throw new Error(
            "DataContextProvider must be used within a DataContextProvider"
        );
    }
    const { data, dispatch } = context;

    const navigationItems = [
        { name: "Home", clickable: true, pageOption: "HOME" },
        // { name: "Chat", clickable: false },
        // { name: "Quiz", clickable: false },
        { name: "Study", clickable: true, pageOption: "STUDY" },
        { name: "Essay Assistance", clickable: true, pageOption: "ESSAY" },
    ];

    const changePage = (index: number) => {
        dispatch({ type: "SET_PAGE", payload: navigationItems[index].pageOption as Types.PageOptions });
        dispatch({ type: "TOGGLE_CURRENT_FILE", payload: -1 })
    }

    useEffect(() => {
        const itemDependingOnPage: number = (() => {
            switch (data.sortedData?.currentPage) {
                case 'HOME': // 1
                    return 1;
                case 'CHAT':
                    return 1; 
                case 'QUIZ':
                    return 2;
                case 'STUDY': // 2
                    return 2;
                case 'DATA_CREATION': // 2
                    return 2;
                case 'LIBRARY': // 2
                    return 2;
                case 'ESSAY': // 3
                    return 3;
                default:
                    return 1; // Default case if currentPage doesn't match any known value
            }
        })();
    
        setCurrentItem(itemDependingOnPage);
    }, [data.sortedData?.currentPage]); // Update currentItem when currentPage changes

    return (
        <nav className="flex flex-col bg-surface-300 dark:bg-surface-800 rounded-xl relative overflow-hidden mb-2">
            <ul className="grid grid-cols-3 justify-between w-full p-0 m-0 list-none overflow-hidden hover:[&>div]:rounded-lg">
                <div
                    className="absolute top-0 left-0 w-1/3 h-full bg-primary-500 rounded-lg transition-all duration-300 z-0"
                    style={{ transform: `translateX(${(currentItem - 1) * 100}%)` }}
                ></div>
                {navigationItems.map((item, index) => (
                    <li key={index} className="flex-1 text-center w-full h-full font-bold z-10 transition-all duration-300 rounded-lg bg-transparent">
                        <button
                            className={`w-full h-full text-xs sm:text-sm md:text-base rounded-lg transition-all duration-300 p-2 ${
                                currentItem === index + 1 ? "text-white bg-[rgba(0,0,0,0.15)]" : "hover:bg-[rgba(0,0,0,0.15)]"
                            } ${item.clickable && "cursor-pointer"}`}
                            disabled={!item.clickable}
                            onClick={() => item.clickable && changePage(index)}
                        >
                            {item.name}
                        </button>
                    </li>
                ))}
            </ul>
        </nav>
    );
}

export default FigmaNavigation;
import {useState, useContext, useEffect} from 'react';
import { Bullet, Folder, ChatBox, ThreeDotsEllipsis } from '../IconsIMGSVG';
import { AiDataProviderContext } from '../AiContextProvider/AiDataProvider';

interface SlotProps {
    header: string;
    type: 'folder' | 'chat';
    isActive?: boolean;
    dataID?: number;
}
/**
 * This local Slot Component is used to display a folder or chat item in the sidebar.
 * 
 * @param type folder or chat
 * @param header name of the folder or chat
 * @param isActive if the slot is active or not
 * @param dataID the id of the folder or chat
 * @returns A li item with a header and a button to remove the folder or chat. Can appear with a bullet if active.
 */
const Slot: React.FC<SlotProps> = ({header, type, isActive=false, dataID}) => {
    const [menuIsOpen, setMenuIsOpen] = useState<boolean>(false);
    const context = useContext(AiDataProviderContext);
        if (!context) {
            throw new Error("AiDataProviderContext must be used within a AiDataProvider");
        }
    const { dispatch } = context;

    /* Close other submenus while opening this one. */
    const handleButtonClick = () => {
        const allSubMenus = document.querySelectorAll('.subMenu') as NodeListOf<HTMLUListElement>;
        allSubMenus.forEach((menu) => {
            if (menu !== null && menu !== undefined && menu.classList.contains('flex')) {
                menu.classList.add('hidden');
                menu.classList.remove('flex');
            }
        });
        setMenuIsOpen(prev => !prev)
    }

    /* Manage the state so it stays consistent in cases where other submenus closed the this one. */
    useEffect(() => {
        const checkIfMenuWasForceClosed = () => {
            if (!dataID) return;
            const thisMenu = document.querySelector(`.subMenu.hidden[data-key="${dataID}"]`) as HTMLUListElement;
            if (thisMenu) {
                if (setMenuIsOpen) {
                    setMenuIsOpen(false);
                }
            }
        }
        checkIfMenuWasForceClosed()
    }, [menuIsOpen, dataID])

    return (
        <div className="grid grid-cols-[auto_1fr_auto] gap-2 bg-surface-50 dark:bg-surface-900 rounded-lg p-2 place-items-center relative">
            {type === 'folder' ? 
                <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<Folder width='w-3' background={false} special={true} /></div>
                : 
                <div className='flex flex-row gap-2'>{isActive && <Bullet background={false}  />}<ChatBox width='w-3' background={false} special={true} /></div>
            }
            <span className="text-black dark:text-white block w-full truncate h-min text-sm">{header}</span>
            <button className="bg-transparent border-none p-0 m-0 cursor-pointer" onClick={()=>{handleButtonClick()}}><ThreeDotsEllipsis width='w-3' background={false} /></button>
            <ul data-key={dataID} className={`subMenu ${menuIsOpen ? 'flex' : 'hidden'} absolute right-3 top-5 rounded-lg shadow-lg p-0 flex-col gap-0 cursor-pointer z-10`}>
                <li className='border-transparent rounded-tl-lg hover:bg-error-800 bg-error-500 p-2 text-black hover:text-white transition-all' onClick={() => dispatch({type: "REMOVE_ITEM", payload: dataID ?? 0})}>Delete</li>
                <li className='border-transparent rounded-b-lg hover:bg-surface-800 bg-surface-500 p-2 text-white transition-all'>Rename</li>
            </ul>
        </div>
    );
}

export default Slot;
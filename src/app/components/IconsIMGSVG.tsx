import chatboxSrc from "../media/chatbox-icon.svg";
import folderSrc from "../media/folder.svg";
import plusSignSrc from "../media/plusSign.svg";
import ellipsisSrc from "../media/ellipsis-horizontal.svg";
import chevronSrc from "../media/chevron-down.svg";
import documentSrc from "../media/document-text.svg";
import AaSrc from "../media/text.svg";
import chatboxFilledSrc from "../media/chatbox-icon.svg";
import arrowSrc from "../media/arrow.svg";
import Image from "next/image";

interface IconProps {
    background?: boolean;
    width?: 'w-2' | 'w-[22px]'| 'w-3' | 'w-4' | 'w-5' | 'w-6' | 'w-8' | 'w-10' | 'w-12' | 'w-16' | 'w-20' | 'w-24';
    special?: boolean;
}

/**
 * 
 * @param background if true, the icon will have a background
 * @param width the width of the icon
 * @param special if true, the icon will NOT CHANGE COLORS in darkmode
 * @returns 
 */
const Icon = ({ src, background = true, width="w-6", special=false}: IconProps & { src: string }) => {
    if (width === 'w-3') {
        width = 'w-[22px]';
    }
    const height = `h-${width.replace('w-', '')}`;

    const CLASSES = !special ? `svg-icon ${width} ${height} max-w-${width} ` : `max-${width} svg-icon-special ${width} ${height}`;
    return (
        <>
            {background &&
                <div className={`${special ? "svg-icon-special" : ""} svg-icon grid place-items-center p-[4px] aspect-square rounded bg-white hover:bg-[#f0f0f0] cursor-pointer`}>
                    <Image src={src} alt="icon" className={CLASSES + " svg-icon-background aspect-square"} width={24} height={24} />
                </div>
            }
            {!background &&
                <div className={`${special ? "svg-icon-special" : ""} svg-icon grid aspect-square place-items-center cursor-pointer`}>
                    <Image src={src} alt="icon" className={CLASSES + " aspect-square"} />
                </div>
            }
        </>
    );
};

const BulletIcon = ({ background = true, width="w-2", special=false}: IconProps) => {
    if (width === 'w-3') {
        width = 'w-[22px]';
    }
    let height = `h-${width.replace('w-', '')}`;
    width = "w-2"
    height = "h-2"

    const CLASSES = !special ? `svg-icon ${width} ${height} max-w-${width} ` : `max-${width} svg-icon-special ${width} ${height}`;
    return (
        <>
            {background &&
            <div className={`BULLET ${special ? "svg-icon-special" : ""} svg-icon grid place-items-center rounded bg-white hover:bg-[#f0f0f0] cursor-pointer`}>
                <svg className={`${CLASSES} aspect-square`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" className="fill-surface-950 dark:fill-surface-50" />
                </svg>
            </div>
            }
            {!background &&
            <div className={`BULLET ${special ? "svg-icon-special" : ""} svg-icon grid place-items-center cursor-pointer`}>
                <svg className={`${CLASSES} aspect-square`} viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <circle cx="12" cy="12" r="10" className="fill-surface-950 dark:fill-surface-50" />
                </svg>
            </div>
            }
        </>
    );
}

export const SearchIcon = () => {
    return <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="feather feather-search text-surface-950 dark:text-surface-50 cursor-pointer"
        >
            <circle
                cx="11"
                cy="11"
                r="8"
            ></circle>
            <line
                x1="21"
                y1="21"
                x2="16.65"
                y2="16.65"
            ></line>
        </svg>
}

export const Bullet = (props: IconProps) => <BulletIcon {...props} />;
export const ChatBox = (props: IconProps) => <Icon {...props} src={chatboxSrc} />;
export const Folder = (props: IconProps) => <Icon {...props} src={folderSrc} />;
export const PlusSign = (props: IconProps) => <Icon {...props} src={plusSignSrc} />;
export const ThreeDotsEllipsis = (props: IconProps) => <Icon {...props} src={ellipsisSrc} />;
export const Chevron = (props: IconProps) => <Icon {...props} src={chevronSrc} />;
export const Document = (props: IconProps) => <Icon {...props} src={documentSrc} />;
export const Aa = (props: IconProps) => <Icon {...props} src={AaSrc} />;
export const Arrow = (props: IconProps) => <Icon {...props} src={arrowSrc} />;
export const ChatBoxFilled = (props: IconProps) => <Icon {...props} src={chatboxFilledSrc} />; // This icon is visually similar to chatBox, but is stuled to appear filled instead of just stroked.

const currentYear = new Date().getFullYear();

function Footer() {
    return (
        <footer className="bg-surface-200 dark:bg-surface-900 p-4 w-full h-full">
            <div className="grid justify-center align-center w-full h-full">
                <span className="w-max h-max text-center text-surface-900 dark:text-surface-50">&copy; {currentYear} &bull; Ai Learning Project</span>                
            </div>
        </footer>
    )
}

export default Footer
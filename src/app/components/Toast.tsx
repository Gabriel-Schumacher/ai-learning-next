function Toast(message: string, error: boolean, showing: boolean) {
    return (
        <div className={`Toast fixed bottom-4 left-4 p-4 rounded shadow-lg transition-all duration-300 ${error ? 'bg-red-500 text-white' : 'bg-gray-100'} ${showing ? 'flex' : 'hidden'}`}>
            { message }
        </div>
    )
}

export default Toast;
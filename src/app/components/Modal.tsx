function Modal( handleConfirm: (payload: React.MouseEvent<HTMLButtonElement>) => void, handleCancel: (payload: React.MouseEvent<HTMLButtonElement>) => void, title: string, cancel: string, confirm: string, showing: boolean) {
  if (!showing) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-lg shadow-lg p-6 w-96">
            <h2 className="text-xl font-semibold mb-4">{title}</h2>
            <div className="flex justify-end space-x-2">
            <button
                onClick={handleCancel}
                className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            >
                {cancel}
            </button>
            <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
                {confirm}
            </button>
            </div>
        </div>

    </div>
  );
}

export default Modal;
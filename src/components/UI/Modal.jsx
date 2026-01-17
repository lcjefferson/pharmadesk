import { Icons } from './Icons';

const Modal = ({ open, onClose, title, children }) => {
    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={onClose}></div>
            <div className="relative bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-md p-6 fade-in max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold dark:text-white">{title}</h3>
                    <button onClick={onClose}>
                        <Icons.X className="h-6 w-6 text-slate-500" />
                    </button>
                </div>
                {children}
            </div>
        </div>
    );
};

export default Modal;

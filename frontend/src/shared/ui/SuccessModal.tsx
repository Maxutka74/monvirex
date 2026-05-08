import SuccessIcon  from '../../assets/successIcon.svg'
import {IoCloseSharp} from "react-icons/io5";

type SuccessModalProps = {
    title: string,
    message: string,
    onClose: () => void
}

const SuccessModal = ({ title, message, onClose }: SuccessModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 grid place-items-center min-h-screen z-1">
            <div className="w-[500px] h-[360px] flex flex-col items-center rounded-[20px] bg-[#FFFFFF]">
                <IoCloseSharp size={24} className="mt-5 mr-5 ml-auto cursor-pointer" onClick={() => onClose()} />
                <img src={SuccessIcon} alt="Success icon" className='w-[100px] h-[100px]' loading="lazy" />
                <h3 className="text-[32px] font-medium mt-5">{title}</h3>
                <p className="w-[374px] text-[16px] text-center text-[#6F6F6F] font-medium mt-5">{message}</p>
                <button type="button" className="w-[452px] h-[50px] rounded-[50px] text-white bg-[#429EFF] mt-5 cursor-pointer">Get Started</button>
            </div>
        </div>
    )
}

export default SuccessModal
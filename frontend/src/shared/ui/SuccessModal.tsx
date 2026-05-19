import SuccessIcon  from '../../assets/successIcon.svg'
import {Link} from "react-router-dom";

type SuccessModalProps = {
    title: string,
    message: string,
    link: string,
    buttonName: string,
}

const SuccessModal = ({ title, message, link, buttonName }: SuccessModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/50 grid place-items-center min-h-screen z-10">
            <div className="w-[500px] h-[340px] flex flex-col items-center rounded-[20px] bg-[#FFFFFF]">
                <img src={SuccessIcon} alt="Success icon" className='w-[100px] h-[100px] mt-6' loading="lazy" />
                <h3 className="text-[32px] font-medium mt-5">{title}</h3>
                <p className="w-[374px] text-[16px] text-center text-[#6F6F6F] font-medium mt-5">{message}</p>
                <Link to={link}><button type="button" className="w-[452px] h-[50px] rounded-[50px] text-white bg-[#429EFF] mt-5 cursor-pointer" onClick={() => {
                    sessionStorage.removeItem('verify_token')
                    sessionStorage.removeItem('reset_token')
                    sessionStorage.removeItem('reset_verify_token')
                }}>{buttonName}</button></Link>
            </div>
        </div>
    )
}

export default SuccessModal
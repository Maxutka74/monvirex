import SuccessIcon  from '../../assets/icons/SuccessIcon.svg'
import {Link} from "react-router-dom";

type SuccessModalProps = {
    title: string,
    message: string,
    link: string,
    buttonName: string,
}

const SuccessModal = ({ title, message, link, buttonName }: SuccessModalProps) => {
    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm grid place-items-center z-10">
            <div className="w-full max-w-[420px] h-[360px] flex flex-col items-center rounded-[20px] bg-white">
                <img
                    src={SuccessIcon}
                    alt="Success icon"
                    className='w-full max-h-[100px] mt-6'
                    loading="lazy"
                />
                <h3 className="text-[28px] max-[405px]:text[24px] leading-tight text-center font-medium mt-5">
                    {title}
                </h3>
                <p className="w-full text-[16px] text-center text-[#6F6F6F] font-medium mt-5">
                    {message}
                </p>
                <Link
                    to={link}
                    className="w-full flex items-center justify-center"
                >
                    <button
                        type="button"
                        className="w-full max-w-[350px] h-[50px] rounded-[50px] text-white bg-[#429EFF] mt-5 cursor-pointer"
                        onClick={() => {
                    sessionStorage.removeItem('verify_token')
                    sessionStorage.removeItem('reset_token')
                    sessionStorage.removeItem('reset_verify_token')
                }}>
                        {buttonName}
                    </button>
                </Link>
            </div>
        </div>
    )
}

export default SuccessModal
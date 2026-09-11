import success_image from '../../assets/images/Success_Payment.svg'
import {useNavigate} from "react-router-dom";
import type {PaymentSuccess} from "../../widgets/myassets/trading/TradeConfirmationModal.tsx";
import {useStore} from "zustand/react";
import themeStore from "../../entities/theme/themeStore.tsx";

const SuccessPaymentModal = ({type, receiveAmount, receiveCurrency}: PaymentSuccess) => {
    const theme = useStore(themeStore, (state) => state.theme);

    const navigate = useNavigate()

    return (
        <div className={`fixed inset-0 z-50 w-full h-full flex justify-center items-center backdrop-blur-sm p-5 ${
            theme === 'dark' ? 'bg-black/70' : 'bg-black/40'
        }`}>
            <div className={`w-100 rounded-[20px] p-5 ${
                theme === 'dark'
                    ? 'bg-[#020817] border border-[#123A70] shadow-[0_0_35px_rgba(21,151,255,0.15)] text-white'
                    : 'bg-white'
            }`}>
                <div className='w-full flex flex-col items-center gap-3 mb-5'>
                    <img src={success_image} alt="Success Payment" />
                    <h3 className={`text-[36px] font-medium ${
                        theme === 'dark' ? 'text-white' : 'text-black'
                    }`}>
                        {Number(receiveAmount).toFixed(6)} {type === 'Sell' ? receiveCurrency : receiveCurrency.slice(0,-4)}
                    </h3>
                    <p className={`text-[18px] font-medium ${
                        theme === 'dark' ? 'text-[#A8B8D0]' : 'text-black'
                    }`}>
                        Successfully {type === 'Buy'? 'purchased': type === 'Sell'? 'sold': 'exchanged'}
                    </p>
                </div>

                <button className={`w-full h-12 text-white rounded-full cursor-pointer ${
                    theme === 'dark'
                        ? 'bg-[#1597FF] shadow-[0_0_18px_rgba(21,151,255,0.3)] hover:bg-[#269FFF]'
                        : 'bg-black'
                }`} onClick={() => navigate('/dashboard')}>Thank you</button>
            </div>
        </div>
    )
}

export default SuccessPaymentModal
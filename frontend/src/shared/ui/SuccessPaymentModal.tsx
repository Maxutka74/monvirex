import success_image from '../../assets/images/Success_Payment.svg'
import {useNavigate} from "react-router-dom";
import type {PaymentSuccess} from "../../widgets/myassets/trading/TradeConfirmationModal.tsx";

const SuccessPaymentModal = ({type, receiveAmount, receiveCurrency}: PaymentSuccess) => {
    const navigate = useNavigate()

    return (
        <div className='fixed inset-0 z-50 w-full h-full flex justify-center items-center backdrop-blur-sm p-5'>
            <div className='w-100 bg-white rounded-[20px] p-5'>
                <div className='w-full flex flex-col items-center gap-3 mb-5'>
                    <img src={success_image} alt="Success Payment" />
                    <h3 className='text-[36px] font-medium'>{Number(receiveAmount).toFixed(6)} {type === 'Sell'? receiveCurrency: receiveCurrency.slice(0,-4)}</h3>
                    <p className='text-[18px] font-medium'>Successfully {type === 'Buy'? 'purchased': type === 'Sell'? 'sold': 'exchanged'}</p>
                </div>

                <button className='w-full h-12 text-white bg-black rounded-full cursor-pointer' onClick={() => navigate('/dashboard')}>Thank you</button>
            </div>
        </div>
    )
}

export default SuccessPaymentModal